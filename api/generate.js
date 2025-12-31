// Vercel Serverless Function - Proxy for Gemini Recipe Generation
// Includes rate limiting and origin checking to prevent abuse

// In-memory rate limiting (resets on cold start, but that's OK for basic protection)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per IP

// Allowed origins (add your Vercel domain here)
const ALLOWED_ORIGINS = [
    'https://crisper-ai-recipe-generator.vercel.app',
    'https://crisper-ai-recipe-generator-shreyanshdixit6206.vercel.app',
    // Add any custom domains here
];

// Check if origin is allowed (also allow localhost for testing)
const isOriginAllowed = (origin) => {
    if (!origin) return false;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
    if (origin.includes('.vercel.app') && origin.includes('crisper')) return true;
    return ALLOWED_ORIGINS.some(allowed => origin.includes(allowed));
};

// Simple rate limiter
const checkRateLimit = (ip) => {
    const now = Date.now();
    const windowData = rateLimitMap.get(ip) || { count: 0, windowStart: now };

    // Reset window if expired
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

    // Check origin to prevent unauthorized access
    const origin = req.headers.origin || req.headers.referer;
    if (!isOriginAllowed(origin)) {
        console.log(`[Security] Blocked request from unauthorized origin: ${origin}`);
        return res.status(403).json({
            error: 'Forbidden',
            message: 'This API is only accessible from the Crisper application'
        });
    }

    // Rate limiting by IP
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        'unknown';

    if (!checkRateLimit(clientIP)) {
        console.log(`[Security] Rate limit exceeded for IP: ${clientIP}`);
        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Please wait a moment before generating more recipes'
        });
    }

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: 'Server configuration error: API key not set',
            message: 'Please set GEMINI_API_KEY in Vercel environment variables'
        });
    }

    try {
        const { prompt, generationConfig } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Basic prompt validation (prevent prompt injection attacks)
        if (prompt.length > 10000) {
            return res.status(400).json({ error: 'Prompt too long' });
        }

        // Forward request to Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: generationConfig || {
                        temperature: 0.8,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 4096,
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || 'Failed to generate recipes',
                details: data.error
            });
        }

        // Set CORS header for allowed origin
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
