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

// Build the recipe generation prompt
const buildRecipePrompt = (ingredients, filters) => {
    const dietaryText = filters.dietary.length > 0
        ? `Dietary restrictions: ${filters.dietary.join(', ')}.`
        : '';

    const cuisineText = filters.cuisine
        ? `Preferred cuisine: ${filters.cuisine}.`
        : '';

    const timeText = `Maximum cooking time: ${filters.cookingTime} minutes.`;
    const difficultyText = `Difficulty level: ${filters.difficulty}.`;
    const calorieText = filters.maxCalories
        ? `Maximum calories per serving: ${filters.maxCalories}.`
        : '';

    return `You are a creative chef assistant. Generate exactly 3 unique recipes using primarily these ingredients: ${ingredients.join(', ')}.

${dietaryText}
${cuisineText}
${timeText}
${difficultyText}
${calorieText}

IMPORTANT: Prioritize recipes that use the provided ingredients. Minimize additional ingredients needed.

Return your response as a valid JSON array with exactly 3 recipe objects. Each recipe must have this exact structure:
{
  "id": "unique-id-string",
  "name": "Recipe Name",
  "description": "Brief appetizing description (1-2 sentences)",
  "cookingTime": number (in minutes),
  "difficulty": "Easy" | "Moderate" | "Advanced",
  "servings": number,
  "calories": number (per serving),
  "cuisine": "Cuisine type",
  "dietaryTags": ["array", "of", "relevant", "tags"],
  "matchPercentage": number (0-100, how many provided ingredients are used),
  "ingredients": [
    {"name": "ingredient name", "amount": "quantity", "userHas": boolean}
  ],
  "instructions": [
    "Step 1: Detailed instruction...",
    "Step 2: Detailed instruction..."
  ],
  "nutritionalInfo": {
    "protein": "Xg",
    "carbs": "Xg",
    "fat": "Xg",
    "fiber": "Xg"
  },
  "tips": "Optional chef's tip or serving suggestion"
}

Return ONLY the JSON array, no additional text or markdown formatting.`;
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
                        maxOutputTokens: 4096,
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
                    maxOutputTokens: 4096,
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
