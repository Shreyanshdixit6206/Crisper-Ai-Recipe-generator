// Vercel Serverless Function - Proxy for Gemini Image Analysis
// This keeps your API key completely server-side

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
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

        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
