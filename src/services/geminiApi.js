// Gemini API service for recipe generation
// In production, uses serverless proxy to keep API key server-side
// In development, can use client-side key for quick testing

import { getGeminiApiKey, refreshKeyTimestamp, hasValidApiKey } from '../utils/localStorage';

// Check if we're in production (Vercel) or development
const isProduction = import.meta.env.PROD;

// API endpoints
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const PROXY_GENERATE_URL = '/api/generate';
const PROXY_ANALYZE_URL = '/api/analyze-image';

// Build optimized recipe prompt (token-efficient)
const buildRecipePrompt = (ingredients, filters) => {
    // Build compact filter string
    const filterParts = [];
    if (filters.dietary.length > 0) filterParts.push(`diet:${filters.dietary.join(',')}`);
    if (filters.cuisine) filterParts.push(`cuisine:${filters.cuisine}`);
    if (filters.cookingTime !== 60) filterParts.push(`time:<${filters.cookingTime}min`);
    if (filters.difficulty !== 'Any') filterParts.push(`level:${filters.difficulty}`);

    const filterStr = filterParts.length > 0 ? `\nFilters: ${filterParts.join(' | ')}` : '';

    // Compact prompt - ~200 tokens vs ~500 tokens before
    return `Generate 3 recipes using: ${ingredients.join(', ')}${filterStr}

Return JSON array. Each recipe: {id,name,description,cookingTime,difficulty,servings,calories,cuisine,dietaryTags[],matchPercentage,ingredients[{name,amount,userHas}],instructions[],nutritionalInfo:{protein,carbs,fat,fiber},tips}

JSON only, no markdown.`;
};

// Parse Gemini response
const parseRecipeResponse = (text) => {
    try {
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.slice(7);
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.slice(3);
        }
        if (cleanText.endsWith('```')) {
            cleanText = cleanText.slice(0, -3);
        }
        cleanText = cleanText.trim();

        const recipes = JSON.parse(cleanText);

        return recipes.map((recipe, index) => ({
            ...recipe,
            id: recipe.id || `recipe-${Date.now()}-${index}`,
            matchPercentage: recipe.matchPercentage || 75
        }));
    } catch (error) {
        console.error('Failed to parse recipe response:', error);
        throw new Error('Failed to parse recipe data. Please try again.');
    }
};

// Generate recipes using Gemini API
export const generateRecipes = async (ingredients, filters) => {
    if (ingredients.length < 3) {
        throw new Error('Please add at least 3 ingredients to generate recipes.');
    }

    const prompt = buildRecipePrompt(ingredients, filters);

    // In production: Use serverless proxy (API key stored on server)
    if (isProduction) {
        try {
            const response = await fetch(PROXY_GENERATE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    generationConfig: {
                        temperature: 0.8,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate recipes');
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) {
                throw new Error('No recipe content received');
            }

            return parseRecipeResponse(textContent);
        } catch (error) {
            console.error('Proxy API error:', error);
            throw error;
        }
    }

    // In development: Use client-side API key
    const apiKey = await getGeminiApiKey();

    if (!apiKey) {
        throw new Error('API key expired or not set. Please enter your Gemini API key.');
    }

    refreshKeyTimestamp();

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate recipes');
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            throw new Error('No recipe content received from API');
        }

        return parseRecipeResponse(textContent);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
};

// Analyze fridge image using Gemini Vision
export const analyzeImageIngredients = async (imageBase64) => {
    // In production: Use serverless proxy
    if (isProduction) {
        try {
            const response = await fetch(PROXY_ANALYZE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64,
                    mimeType: 'image/jpeg'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to analyze image');
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) {
                throw new Error('No content received');
            }

            let cleanText = textContent.trim();
            if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
            else if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
            if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);

            return JSON.parse(cleanText.trim());
        } catch (error) {
            console.error('Proxy image analysis error:', error);
            throw error;
        }
    }

    // In development: Use client-side API key
    const apiKey = await getGeminiApiKey();

    if (!apiKey) {
        throw new Error('API key expired or not set. Please enter your Gemini API key.');
    }

    refreshKeyTimestamp();

    const prompt = `Analyze this image and identify all visible food ingredients and items. 
Return ONLY a JSON array of ingredient names as strings, lowercase, singular form.
Example: ["chicken", "tomato", "onion", "garlic", "olive oil"]
Do not include non-food items. Return ONLY the JSON array.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }
                    ]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to analyze image');
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            throw new Error('No content received from API');
        }

        let cleanText = textContent.trim();
        if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
        else if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
        if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);

        return JSON.parse(cleanText.trim());
    } catch (error) {
        console.error('Image analysis error:', error);
        throw error;
    }
};

// Validate API key (only used in development mode)
export const validateApiKey = async (apiKey) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (response.ok) return true;
        if (response.status === 401 || response.status === 403) return false;
        return true;
    } catch {
        return false;
    }
};

// Check if app is in production mode (using server proxy)
export const isUsingServerProxy = () => isProduction;
