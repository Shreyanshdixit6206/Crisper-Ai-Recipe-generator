// Vercel Serverless Function - Proxy for Gemini Recipe Generation
// This keeps your API key completely server-side and never exposed to the browser

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get API key from environment variable (set in Vercel dashboard)
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

        // Return the Gemini response
        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
