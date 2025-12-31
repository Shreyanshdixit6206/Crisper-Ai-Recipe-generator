import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Flame, Leaf } from 'lucide-react';

// Simplified, relevant dietary options
const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬', color: '#22c55e' },
    { id: 'vegan', label: 'Vegan', emoji: '🌱', color: '#16a34a' },
    { id: 'gluten-free', label: 'Gluten-Free', emoji: '🌾', color: '#eab308' },
    { id: 'dairy-free', label: 'Dairy-Free', emoji: '🥛', color: '#06b6d4' },
    { id: 'low-carb', label: 'Low-Carb', emoji: '🥗', color: '#8b5cf6' },
];

// Cooking time presets
const timePresets = [
    { value: 15, label: '15 min', emoji: '⚡' },
    { value: 30, label: '30 min', emoji: '🍳' },
    { value: 60, label: '1 hour', emoji: '🍲' },
    { value: 120, label: '2+ hrs', emoji: '🍖' },
];

// Difficulty options
const difficultyOptions = [
    { id: 'Easy', label: 'Easy', emoji: '😊', desc: 'Simple recipes' },
    { id: 'Moderate', label: 'Medium', emoji: '👨‍🍳', desc: 'Some skill needed' },
    { id: 'Advanced', label: 'Hard', emoji: '🎯', desc: 'Chef level' },
];

function FilterPanel({ filters, onUpdateFilters }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDietaryChange = (option) => {
        const newDietary = filters.dietary.includes(option)
            ? filters.dietary.filter(d => d !== option)
            : [...filters.dietary, option];
        onUpdateFilters({ dietary: newDietary });
    };

    const activeFilters = filters.dietary.length + (filters.difficulty !== 'Any' ? 1 : 0) + (filters.cookingTime !== 60 ? 1 : 0);

    return (
        <motion.div
            className="max-w-2xl mx-auto overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
        >
            {/* Filter Header Button */}
            <motion.button
                className="w-full flex items-center justify-between p-5 group"
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ backgroundColor: 'rgba(251, 191, 36, 0.05)' }}
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.2)',
                        }}
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="text-xl">✨</span>
                    </motion.div>
                    <div className="text-left">
                        <span className="font-semibold text-gray-800 text-lg">Recipe Filters</span>
                        {activeFilters > 0 && (
                            <motion.span
                                className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                {activeFilters} active
                            </motion.span>
                        )}
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                </motion.div>
            </motion.button>

            {/* Expandable Filter Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-5">
                            {/* Dietary Restrictions - Pill Style */}
                            <motion.div
                                className="p-4 rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Leaf className="w-4 h-4 text-green-600" />
                                    <h4 className="text-sm font-semibold text-green-800">Dietary Preferences</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {dietaryOptions.map((option, index) => {
                                        const isSelected = filters.dietary.includes(option.label);
                                        return (
                                            <motion.button
                                                key={option.id}
                                                onClick={() => handleDietaryChange(option.label)}
                                                className="relative px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2"
                                                style={{
                                                    background: isSelected
                                                        ? `linear-gradient(135deg, ${option.color} 0%, ${option.color}dd 100%)`
                                                        : 'white',
                                                    color: isSelected ? 'white' : '#374151',
                                                    boxShadow: isSelected
                                                        ? `0 4px 12px ${option.color}40`
                                                        : '0 2px 8px rgba(0,0,0,0.06)',
                                                }}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <span>{option.emoji}</span>
                                                <span>{option.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Cooking Time - Preset Cards */}
                            <motion.div
                                className="p-4 rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%)',
                                }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-4 h-4 text-amber-700" />
                                    <h4 className="text-sm font-semibold text-amber-800">Max Cooking Time</h4>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {timePresets.map((preset, index) => {
                                        const isSelected = filters.cookingTime === preset.value;
                                        return (
                                            <motion.button
                                                key={preset.value}
                                                onClick={() => onUpdateFilters({ cookingTime: preset.value })}
                                                className="flex flex-col items-center p-3 rounded-xl transition-all"
                                                style={{
                                                    background: isSelected
                                                        ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                                                        : 'white',
                                                    color: isSelected ? 'white' : '#78350f',
                                                    boxShadow: isSelected
                                                        ? '0 4px 12px rgba(217, 119, 6, 0.4)'
                                                        : '0 2px 8px rgba(0,0,0,0.06)',
                                                }}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 + index * 0.05 }}
                                                whileHover={{ scale: 1.05, y: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <span className="text-2xl mb-1">{preset.emoji}</span>
                                                <span className="text-xs font-semibold">{preset.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Difficulty - Card Style */}
                            <motion.div
                                className="p-4 rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                                }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Flame className="w-4 h-4 text-pink-600" />
                                    <h4 className="text-sm font-semibold text-pink-800">Difficulty Level</h4>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {difficultyOptions.map((option, index) => {
                                        const isSelected = filters.difficulty === option.id;
                                        return (
                                            <motion.button
                                                key={option.id}
                                                onClick={() => onUpdateFilters({ difficulty: option.id })}
                                                className="flex flex-col items-center p-3 rounded-xl transition-all"
                                                style={{
                                                    background: isSelected
                                                        ? 'linear-gradient(135deg, #db2777 0%, #be185d 100%)'
                                                        : 'white',
                                                    color: isSelected ? 'white' : '#831843',
                                                    boxShadow: isSelected
                                                        ? '0 4px 12px rgba(219, 39, 119, 0.4)'
                                                        : '0 2px 8px rgba(0,0,0,0.06)',
                                                }}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.15 + index * 0.05 }}
                                                whileHover={{ scale: 1.05, y: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <span className="text-2xl mb-1">{option.emoji}</span>
                                                <span className="text-sm font-semibold">{option.label}</span>
                                                <span className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                                    {option.desc}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Clear Filters Button */}
                            <AnimatePresence>
                                {activeFilters > 0 && (
                                    <motion.button
                                        className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                                        style={{
                                            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                        }}
                                        onClick={() => onUpdateFilters({
                                            dietary: [],
                                            cookingTime: 60,
                                            difficulty: 'Any',
                                            maxCalories: null,
                                            cuisine: ''
                                        })}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        🔄 Clear All Filters
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default FilterPanel;
