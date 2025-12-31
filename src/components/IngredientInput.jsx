import { useState, useRef, useEffect } from 'react';
import { Plus, X, Camera, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchIngredients } from '../data/ingredients';
import { analyzeImageIngredients } from '../services/geminiApi';
import { hasValidApiKey } from '../utils/localStorage';

// Food emoji mapping for common ingredients
const ingredientEmojis = {
    chicken: '🍗', beef: '🥩', fish: '🐟', salmon: '🍣', shrimp: '🦐',
    tomato: '🍅', potato: '🥔', carrot: '🥕', onion: '🧅', garlic: '🧄',
    pepper: '🌶️', broccoli: '🥦', lettuce: '🥬', corn: '🌽', mushroom: '🍄',
    egg: '🥚', cheese: '🧀', milk: '🥛', butter: '🧈', bread: '🍞',
    rice: '🍚', pasta: '🍝', noodles: '🍜', apple: '🍎', lemon: '🍋',
    orange: '🍊', banana: '🍌', avocado: '🥑', olive: '🫒', salt: '🧂',
};

const getIngredientEmoji = (ingredient) => {
    const lower = ingredient.toLowerCase();
    for (const [key, emoji] of Object.entries(ingredientEmojis)) {
        if (lower.includes(key)) return emoji;
    }
    return '🥘';
};

function IngredientInput({ ingredients, onAddIngredient, onRemoveIngredient }) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (inputValue.length > 0) {
            const results = searchIngredients(inputValue);
            const filtered = results.filter(s => !ingredients.includes(s.toLowerCase()));
            setSuggestions(filtered.slice(0, 6));
            setShowSuggestions(filtered.length > 0);
            setSelectedIndex(-1);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [inputValue, ingredients]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                handleAddIngredient(suggestions[selectedIndex]);
            } else if (inputValue.trim()) {
                handleAddIngredient(inputValue.trim());
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleAddIngredient = (ingredient) => {
        onAddIngredient(ingredient);
        setInputValue('');
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!hasValidApiKey()) {
            alert('Please set your Gemini API key first');
            return;
        }

        setIsAnalyzing(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result.split(',')[1];
                try {
                    const detectedIngredients = await analyzeImageIngredients(base64);
                    detectedIngredients.forEach(ing => onAddIngredient(ing));
                } catch (err) {
                    console.error('Image analysis failed:', err);
                    alert('Failed to analyze image. Please try again.');
                } finally {
                    setIsAnalyzing(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Image upload failed:', err);
            setIsAnalyzing(false);
        }
        e.target.value = '';
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* 3D Input Container */}
            <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="relative overflow-hidden rounded-2xl"
                    animate={{
                        boxShadow: isFocused
                            ? '0 8px 32px rgba(217, 119, 6, 0.25), 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                            : '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                    style={{
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                    }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Gradient border */}
                    <div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                            padding: '2px',
                            background: isFocused
                                ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #d97706 100%)'
                                : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                        }}
                    />

                    <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl">
                        <motion.div
                            animate={{
                                rotate: isFocused ? 90 : 0,
                                scale: isFocused ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <Plus className="w-6 h-6 text-amber-500" />
                        </motion.div>

                        <input
                            ref={inputRef}
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-lg py-1 placeholder:text-gray-400 text-gray-800"
                            placeholder="Type an ingredient..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                                setIsFocused(true);
                                if (inputValue) setShowSuggestions(suggestions.length > 0);
                            }}
                            onBlur={() => {
                                setIsFocused(false);
                                setTimeout(() => setShowSuggestions(false), 200);
                            }}
                            disabled={ingredients.length >= 10}
                        />

                        {/* Camera button with 3D effect */}
                        <motion.button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzing}
                            className="relative p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg disabled:opacity-50"
                            style={{
                                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                            }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isAnalyzing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Camera className="w-5 h-5" />
                            )}
                        </motion.button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                </motion.div>

                {/* Suggestions Dropdown with 3D */}
                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl overflow-hidden z-50"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        >
                            {suggestions.map((suggestion, index) => (
                                <motion.button
                                    key={suggestion}
                                    className={`w-full text-left px-4 py-3 text-base flex items-center gap-3 transition-colors ${index === selectedIndex
                                        ? 'bg-amber-50 text-amber-800'
                                        : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    onClick={() => handleAddIngredient(suggestion)}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <span className="text-xl">{getIngredientEmoji(suggestion)}</span>
                                    <span className="capitalize font-medium">{suggestion}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* 3D Ingredient Tags */}
            <motion.div
                className="flex flex-wrap gap-3 mt-5 min-h-[52px] justify-center"
                layout
            >
                <AnimatePresence mode="popLayout">
                    {ingredients.map((ingredient, index) => (
                        <motion.div
                            key={ingredient}
                            layout
                            initial={{ opacity: 0, scale: 0, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0, rotate: 20 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                                delay: index * 0.02,
                            }}
                            className="group relative"
                        >
                            <div
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold capitalize cursor-default"
                                style={{
                                    background: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)',
                                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.05)',
                                    color: '#92400e',
                                }}
                            >
                                <span className="text-lg">{getIngredientEmoji(ingredient)}</span>
                                <span>{ingredient}</span>
                                <motion.button
                                    onClick={() => onRemoveIngredient(ingredient)}
                                    className="ml-1 p-1 rounded-full bg-amber-600/20 hover:bg-red-500 hover:text-white transition-colors"
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {ingredients.length >= 10 && (
                <motion.p
                    className="mt-4 text-sm text-amber-600 text-center font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    ✨ Maximum 10 ingredients reached
                </motion.p>
            )}
        </div>
    );
}

export default IngredientInput;
