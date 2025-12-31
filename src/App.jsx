import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import IngredientInput from './components/IngredientInput';
import FilterPanel from './components/FilterPanel';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import ApiKeyModal from './components/ApiKeyModal';
import FridgeLanding from './components/FridgeLanding';
import RemyMascot, { REMY_STATES } from './components/RemyMascot';
import { generateRecipes } from './services/geminiApi';
import { getRecipeImages } from './services/unsplashApi';
import { isFirstVisit, markVisited, hasValidApiKey, addRecentIngredients, clearLegacyKeys } from './utils/localStorage';

// Floating decorative food emojis
const floatingEmojis = [
    { emoji: '🥕', position: { top: '10%', left: '5%' }, delay: 0 },
    { emoji: '🍅', position: { top: '15%', right: '8%' }, delay: 0.5 },
    { emoji: '🧅', position: { top: '60%', left: '3%' }, delay: 1 },
    { emoji: '🍋', position: { top: '70%', right: '5%' }, delay: 1.5 },
    { emoji: '🌶️', position: { top: '40%', left: '2%' }, delay: 2 },
    { emoji: '🥦', position: { top: '45%', right: '3%' }, delay: 0.8 },
];

const defaultFilters = {
    dietary: [],
    cookingTime: 60,
    difficulty: 'Any',
    maxCalories: null,
    cuisine: ''
};

function App() {
    // Landing animation state
    const [showLanding, setShowLanding] = useState(true);
    const [landingComplete, setLandingComplete] = useState(false);

    // Original app state
    const [showWelcome, setShowWelcome] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const [filters, setFilters] = useState(defaultFilters);
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Remy mascot state
    const [remyState, setRemyState] = useState(REMY_STATES.IDLE);
    const [remyMessage, setRemyMessage] = useState(null);
    const [mousePosition, setMousePosition] = useState(null);
    const [isHoveringCards, setIsHoveringCards] = useState(false);

    // Refs
    const resultsRef = useRef(null);

    // Security: Clear any old plaintext API keys on app load
    useEffect(() => {
        clearLegacyKeys();
    }, []);

    // Check first visit and API key (skip in production - uses server proxy)
    useEffect(() => {
        if (landingComplete) {
            if (isFirstVisit()) {
                setShowWelcome(true);
            }
            // Only show API key modal in development mode
            // In production, the API key is stored server-side via environment variables
            if (!import.meta.env.PROD && !hasValidApiKey()) {
                setShowApiKeyModal(true);
            }
        }
    }, [landingComplete]);

    // Handle landing animation complete
    const handleLandingComplete = () => {
        setShowLanding(false);
        setLandingComplete(true);
    };

    // Track mouse for Remy following
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isHoveringCards) {
                setMousePosition({ x: e.clientX, y: e.clientY });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isHoveringCards]);

    // Update Remy state based on app state
    useEffect(() => {
        if (isHoveringCards) {
            setRemyState(REMY_STATES.FOLLOWING);
        } else if (isLoading) {
            setRemyState(REMY_STATES.COOKING);
            setRemyMessage("Cooking up something special! 🍳");
        } else if (recipes.length > 0 && hasSearched) {
            setRemyState(REMY_STATES.EXCITED);
            setRemyMessage("Voilà! Check out these recipes! ✨");
            setTimeout(() => {
                setRemyState(REMY_STATES.IDLE);
                setRemyMessage(null);
            }, 3000);
        } else {
            setRemyState(REMY_STATES.IDLE);
            setRemyMessage(null);
        }
    }, [isLoading, recipes.length, hasSearched, isHoveringCards]);

    const handleWelcomeDismiss = () => {
        setShowWelcome(false);
        markVisited();
    };

    const addIngredient = (ingredient) => {
        const normalized = ingredient.toLowerCase().trim();
        if (normalized && !ingredients.includes(normalized) && ingredients.length < 10) {
            setIngredients([...ingredients, normalized]);
            // Remy nods when ingredient added
            setRemyState(REMY_STATES.NOD);
            setRemyMessage("Great choice! 👍");
            setTimeout(() => {
                setRemyState(REMY_STATES.IDLE);
                setRemyMessage(null);
            }, 1500);
        }
    };

    const removeIngredient = (ingredient) => {
        setIngredients(ingredients.filter(i => i !== ingredient));
    };

    const updateFilters = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const handleGenerateRecipes = async () => {
        if (ingredients.length < 3) {
            setError('Please add at least 3 ingredients to generate recipes.');
            return;
        }

        // Only check for API key in development mode
        // In production, the key is stored server-side
        if (!import.meta.env.PROD && !hasValidApiKey()) {
            setShowApiKeyModal(true);
            return;
        }

        // Remy starts thinking/cooking
        setRemyState(REMY_STATES.THINKING);
        setRemyMessage("Hmm, let me think... 🤔");

        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            addRecentIngredients(ingredients);
            const generatedRecipes = await generateRecipes(ingredients, filters);
            const recipesWithImages = await getRecipeImages(generatedRecipes);
            setRecipes(recipesWithImages);

            // Scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        } catch (err) {
            console.error('Recipe generation error:', err);
            setError(err.message || 'Failed to generate recipes. Please try again.');
            setRecipes([]);
            setRemyState(REMY_STATES.IDLE);
            setRemyMessage("Oops! Let's try again... 😅");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle card hover for Remy mouse following
    const handleCardMouseEnter = () => {
        setIsHoveringCards(true);
    };

    const handleCardMouseLeave = () => {
        setIsHoveringCards(false);
        setRemyState(REMY_STATES.IDLE);
    };

    return (
        <>
            {/* Fridge Landing Animation */}
            {showLanding && (
                <FridgeLanding onComplete={handleLandingComplete} />
            )}

            {/* Main App */}
            <AnimatePresence>
                {landingComplete && (
                    <motion.div
                        className="min-h-screen bg-background relative overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Floating decorative emojis */}
                        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                            {floatingEmojis.map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="absolute text-3xl md:text-4xl opacity-20"
                                    style={item.position}
                                    animate={{
                                        y: [0, -20, 0],
                                        rotate: [-5, 5, -5],
                                    }}
                                    transition={{
                                        duration: 4 + index * 0.5,
                                        repeat: Infinity,
                                        delay: item.delay,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    {item.emoji}
                                </motion.div>
                            ))}
                        </div>

                        <Header onSettingsClick={() => setShowApiKeyModal(true)} />

                        <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
                            {/* Hero Section */}
                            <motion.section
                                className="text-center mb-12"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <motion.h1
                                    className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    What's in your kitchen?
                                </motion.h1>
                                <motion.p
                                    className="text-lg text-muted-foreground max-w-md mx-auto"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                >
                                    Add your ingredients and let AI create delicious recipes for you
                                </motion.p>

                                {/* Decorative sparkles around title */}
                                <motion.div
                                    className="absolute left-1/4 top-20 text-2xl"
                                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    ✨
                                </motion.div>
                                <motion.div
                                    className="absolute right-1/4 top-24 text-xl"
                                    animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                                >
                                    ⭐
                                </motion.div>
                            </motion.section>

                            {/* Ingredient Input */}
                            <motion.section
                                className="mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <IngredientInput
                                    ingredients={ingredients}
                                    onAddIngredient={addIngredient}
                                    onRemoveIngredient={removeIngredient}
                                />
                            </motion.section>

                            {/* Filter Panel */}
                            <motion.section
                                className="mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <FilterPanel
                                    filters={filters}
                                    onUpdateFilters={updateFilters}
                                />
                            </motion.section>

                            {/* Generate Button */}
                            <motion.div
                                className="text-center mb-10"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <Button
                                    size="lg"
                                    onClick={handleGenerateRecipes}
                                    disabled={isLoading || ingredients.length < 3}
                                    className="min-w-[250px] h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all generate-btn animate-pulse-glow"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating Recipes...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate Recipes
                                        </>
                                    )}
                                </Button>
                                {ingredients.length > 0 && ingredients.length < 3 && (
                                    <motion.p
                                        className="mt-3 text-sm text-muted-foreground"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        Add {3 - ingredients.length} more ingredient{3 - ingredients.length > 1 ? 's' : ''} to continue
                                    </motion.p>
                                )}
                            </motion.div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        className="text-center p-4 mb-6 bg-destructive/10 text-destructive rounded-xl font-medium"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Results Section */}
                            <section ref={resultsRef}>
                                {isLoading ? (
                                    <LoadingState />
                                ) : recipes.length > 0 ? (
                                    <motion.div
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        onMouseEnter={handleCardMouseEnter}
                                        onMouseLeave={handleCardMouseLeave}
                                    >
                                        {recipes.map((recipe, index) => (
                                            <motion.div
                                                key={recipe.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                            >
                                                <RecipeCard
                                                    recipe={recipe}
                                                    index={index}
                                                    onClick={() => setSelectedRecipe(recipe)}
                                                />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : hasSearched ? (
                                    <EmptyState type="no-results" />
                                ) : ingredients.length === 0 ? (
                                    <EmptyState
                                        type="getting-started"
                                        onAddExample={(example) => example.forEach(ing => addIngredient(ing))}
                                    />
                                ) : null}
                            </section>
                        </main>

                        {/* Modals */}
                        {showWelcome && <WelcomeScreen onDismiss={handleWelcomeDismiss} />}
                        {selectedRecipe && (
                            <RecipeDetail
                                recipe={selectedRecipe}
                                userIngredients={ingredients}
                                onClose={() => setSelectedRecipe(null)}
                            />
                        )}
                        {showApiKeyModal && <ApiKeyModal onClose={() => setShowApiKeyModal(false)} />}

                        {/* Remy Mascot */}
                        <RemyMascot
                            state={remyState}
                            mousePosition={mousePosition}
                            message={remyMessage}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default App;
