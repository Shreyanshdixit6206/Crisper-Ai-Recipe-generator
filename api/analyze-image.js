// Vercel Serverless Function - Proxy for Gemini Image Analysis
// Includes rate limiting and origin checking to prevent abuse

// In-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 image analyses per minute per IP

// Check if origin is allowed
const isOriginAllowed = (origin) => {
    if (!origin) return false;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
    if (origin.includes('.vercel.app') && origin.includes('crisper')) return true;
    return false;
};

// Simple rate limiter
const checkRateLimit = (ip) => {
    const now = Date.now();
    const windowData = rateLimitMap.get(ip) || { count: 0, windowStart: now };

    if (now - windowData.windowStart > RATE_LIMIT_WINDOW) {
        windowData.count = 0;
        windowData.windowStart = now;
    }

    windowData.count++;
    rateLimitMap.set(ip, windowData);

    return windowData.count <= MAX_REQUESTS_PER_WINDOW;
};

export default async function handler(req, res) {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check origin
    const origin = req.headers.origin || req.headers.referer;
    if (!isOriginAllowed(origin)) {
        console.log(`[Security] Blocked image analysis from unauthorized origin: ${origin}`);
        return res.status(403).json({
            error: 'Forbidden',
            message: 'This API is only accessible from the Crisper application'
        });
    }

    // Rate limiting
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        'unknown';

    if (!checkRateLimit(clientIP)) {
        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Please wait before analyzing more images'
        });
    }

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: 'Server configuration error: API key not set'
        });
    }

    try {
        const { imageBase64, mimeType = 'image/jpeg' } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        // Limit image size (5MB max when base64 encoded)
        if (imageBase64.length > 7 * 1024 * 1024) {
            return res.status(400).json({ error: 'Image too large. Please use a smaller image.' });
        }

        const prompt = `Analyze this image and identify all visible food ingredients and items. 
Return ONLY a JSON array of ingredient names as strings, lowercase, singular form.
Example: ["chicken", "tomato", "onion", "garlic", "olive oil"]
Do not include non-food items. Return ONLY the JSON array.`;

        // Forward request to Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: imageBase64
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1024,
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || 'Failed to analyze image'
            });
        }

        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
