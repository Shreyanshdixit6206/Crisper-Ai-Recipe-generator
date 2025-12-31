// Common ingredients database for autocomplete
export const ingredientCategories = {
    proteins: [
        'chicken breast', 'chicken thighs', 'ground beef', 'beef steak', 'pork chops',
        'bacon', 'ham', 'sausage', 'salmon', 'tuna', 'shrimp', 'cod', 'tilapia',
        'eggs', 'tofu', 'tempeh', 'turkey', 'lamb', 'duck', 'crab', 'lobster',
        'scallops', 'mussels', 'sardines', 'anchovies', 'ground turkey', 'chicken wings'
    ],
    vegetables: [
        'onion', 'garlic', 'tomato', 'potato', 'carrot', 'broccoli', 'spinach',
        'lettuce', 'cucumber', 'bell pepper', 'zucchini', 'eggplant', 'mushroom',
        'asparagus', 'green beans', 'peas', 'corn', 'celery', 'cabbage', 'kale',
        'cauliflower', 'sweet potato', 'butternut squash', 'brussels sprouts',
        'artichoke', 'leek', 'shallot', 'radish', 'beet', 'turnip', 'bok choy',
        'jalapeño', 'avocado', 'green onion', 'ginger', 'arugula'
    ],
    fruits: [
        'apple', 'banana', 'orange', 'lemon', 'lime', 'strawberry', 'blueberry',
        'raspberry', 'mango', 'pineapple', 'peach', 'pear', 'grape', 'watermelon',
        'cantaloupe', 'kiwi', 'cherry', 'plum', 'fig', 'pomegranate', 'coconut',
        'papaya', 'passion fruit', 'grapefruit', 'cranberry'
    ],
    dairy: [
        'milk', 'butter', 'cheese', 'cheddar cheese', 'mozzarella', 'parmesan',
        'cream cheese', 'sour cream', 'heavy cream', 'yogurt', 'greek yogurt',
        'cottage cheese', 'feta cheese', 'goat cheese', 'ricotta', 'brie',
        'cream', 'half and half', 'whipping cream', 'buttermilk'
    ],
    grains: [
        'rice', 'pasta', 'bread', 'flour', 'oats', 'quinoa', 'couscous',
        'barley', 'bulgur', 'cornmeal', 'breadcrumbs', 'tortilla', 'noodles',
        'spaghetti', 'penne', 'fettuccine', 'ramen', 'udon', 'rice noodles',
        'pita bread', 'naan', 'bagel', 'croissant', 'baguette'
    ],
    pantry: [
        'olive oil', 'vegetable oil', 'coconut oil', 'sesame oil', 'vinegar',
        'balsamic vinegar', 'soy sauce', 'fish sauce', 'worcestershire sauce',
        'hot sauce', 'ketchup', 'mustard', 'mayonnaise', 'honey', 'maple syrup',
        'sugar', 'brown sugar', 'salt', 'pepper', 'chicken broth', 'beef broth',
        'vegetable broth', 'tomato paste', 'tomato sauce', 'canned tomatoes',
        'coconut milk', 'beans', 'black beans', 'chickpeas', 'lentils',
        'peanut butter', 'almonds', 'walnuts', 'cashews', 'pine nuts'
    ],
    spices: [
        'paprika', 'cumin', 'coriander', 'turmeric', 'cinnamon', 'nutmeg',
        'oregano', 'basil', 'thyme', 'rosemary', 'parsley', 'cilantro',
        'bay leaf', 'chili powder', 'cayenne pepper', 'garlic powder',
        'onion powder', 'italian seasoning', 'curry powder', 'garam masala',
        'cardamom', 'cloves', 'allspice', 'dill', 'mint', 'sage', 'tarragon',
        'fennel seeds', 'mustard seeds', 'red pepper flakes', 'black pepper',
        'white pepper', 'smoked paprika', 'za\'atar', 'sumac'
    ]
};

// Flatten all ingredients for autocomplete
export const allIngredients = Object.values(ingredientCategories).flat();

// Get ingredient category
export const getIngredientCategory = (ingredient) => {
    const lowerIngredient = ingredient.toLowerCase();
    for (const [category, items] of Object.entries(ingredientCategories)) {
        if (items.some(item => item.toLowerCase() === lowerIngredient)) {
            return category;
        }
    }
    return 'other';
};

// Search ingredients for autocomplete
export const searchIngredients = (query, limit = 8) => {
    if (!query || query.length < 1) return [];

    const lowerQuery = query.toLowerCase();
    const results = allIngredients.filter(ingredient =>
        ingredient.toLowerCase().includes(lowerQuery)
    );

    // Sort by relevance (starts with query first)
    results.sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(lowerQuery);
        const bStarts = b.toLowerCase().startsWith(lowerQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
    });

    return results.slice(0, limit);
};

// Example ingredients for empty state
export const exampleIngredients = [
    'chicken breast', 'garlic', 'onion', 'olive oil', 'lemon'
];
