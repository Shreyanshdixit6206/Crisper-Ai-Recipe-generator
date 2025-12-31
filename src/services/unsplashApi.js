// Unsplash API service for food photography
// Free tier: 50 requests/hour

const UNSPLASH_ACCESS_KEY = 'demo'; // User should replace with their key

// Curated food image URLs as fallbacks (royalty-free from Unsplash)
const fallbackImages = {
    default: [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
        'https://images.unsplash.com/photo-1484723091996-d4c6348c26b4?w=800&q=80',
    ],
    Italian: [
        'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&q=80',
        'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80',
        'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
    ],
    Asian: [
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=80',
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
    ],
    Mexican: [
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
        'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
        'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&q=80',
    ],
    Mediterranean: [
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
        'https://images.unsplash.com/photo-1540914124281-342587941389?w=800&q=80',
        'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80',
    ],
    American: [
        'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
        'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80',
    ],
    Indian: [
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
        'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
        'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
    ],
    Healthy: [
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80',
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    ],
    Dessert: [
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
        'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80',
        'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80',
    ],
};

// Get a random image from a category
const getRandomImage = (category = 'default') => {
    const images = fallbackImages[category] || fallbackImages.default;
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
};

// Search Unsplash for food images
export const searchFoodImage = async (query, cuisine = '') => {
    // For demo, use fallback images
    // In production, integrate with Unsplash API

    // Try to match cuisine to a category
    const cuisineLower = cuisine.toLowerCase();

    if (cuisineLower.includes('italian') || query.toLowerCase().includes('pasta')) {
        return getRandomImage('Italian');
    }
    if (cuisineLower.includes('asian') || cuisineLower.includes('chinese') || cuisineLower.includes('japanese')) {
        return getRandomImage('Asian');
    }
    if (cuisineLower.includes('mexican') || query.toLowerCase().includes('taco')) {
        return getRandomImage('Mexican');
    }
    if (cuisineLower.includes('mediterranean') || cuisineLower.includes('greek')) {
        return getRandomImage('Mediterranean');
    }
    if (cuisineLower.includes('indian') || query.toLowerCase().includes('curry')) {
        return getRandomImage('Indian');
    }
    if (cuisineLower.includes('american')) {
        return getRandomImage('American');
    }
    if (query.toLowerCase().includes('salad') || query.toLowerCase().includes('healthy')) {
        return getRandomImage('Healthy');
    }
    if (query.toLowerCase().includes('dessert') || query.toLowerCase().includes('cake')) {
        return getRandomImage('Dessert');
    }

    return getRandomImage('default');
};

// Get multiple images for recipe cards
export const getRecipeImages = async (recipes) => {
    const imagesPromises = recipes.map(async (recipe) => {
        const imageUrl = await searchFoodImage(recipe.name, recipe.cuisine);
        return { ...recipe, imageUrl };
    });

    return Promise.all(imagesPromises);
};

// Export fallback images for direct use
export { fallbackImages };
