import { motion } from 'framer-motion';

// Cooking steps to show during loading
const cookingSteps = [
    { emoji: '📖', text: 'Reading your ingredients...' },
    { emoji: '🧑‍🍳', text: 'Chef Remy is thinking...' },
    { emoji: '🥘', text: 'Mixing flavors...' },
    { emoji: '🔥', text: 'Cooking up recipes...' },
    { emoji: '✨', text: 'Adding the magic touch...' },
];

// Floating ingredients during loading
const floatingIngredients = ['🥕', '🍅', '🧅', '🥦', '🍳', '🧀', '🌶️', '🍋'];

function LoadingState() {
    return (
        <div className="py-12 relative">
            {/* Floating ingredients background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {floatingIngredients.map((ingredient, index) => (
                    <motion.div
                        key={index}
                        className="absolute text-4xl opacity-30"
                        style={{
                            left: `${10 + (index * 12)}%`,
                            top: `${20 + (index % 3) * 30}%`,
                        }}
                        animate={{
                            y: [-20, 20, -20],
                            x: [-10, 10, -10],
                            rotate: [0, 360],
                        }}
                        transition={{
                            duration: 3 + index * 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.3,
                        }}
                    >
                        {ingredient}
                    </motion.div>
                ))}
            </div>

            {/* Main loading content */}
            <div className="text-center mb-10 relative z-10">
                {/* Animated cooking pot */}
                <div className="relative inline-block">
                    <motion.span
                        className="text-7xl inline-block"
                        animate={{
                            rotate: [-5, 5, -5],
                            y: [0, -5, 0],
                        }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        🍳
                    </motion.span>

                    {/* Steam effect */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute text-2xl opacity-60"
                                style={{ left: `${-20 + i * 20}px` }}
                                animate={{
                                    y: [0, -30],
                                    opacity: [0.6, 0],
                                    scale: [1, 1.5],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: 'easeOut',
                                }}
                            >
                                💨
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.h3
                    className="font-serif text-2xl font-semibold text-foreground mt-6 mb-3"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Creating delicious recipes...
                </motion.h3>

                {/* Animated cooking steps */}
                <div className="flex justify-center gap-3 flex-wrap max-w-md mx-auto">
                    {cookingSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 1, 0],
                                scale: [0.8, 1, 1, 0.8],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                delay: index * 0.8,
                                times: [0, 0.1, 0.9, 1],
                            }}
                        >
                            <span>{step.emoji}</span>
                            <span className="text-sm text-muted-foreground">{step.text}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Skeleton cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0, 1, 2].map((index) => (
                    <motion.div
                        key={index}
                        className="bg-card rounded-3xl overflow-hidden shadow-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                    >
                        {/* Image skeleton with shimmer */}
                        <div className="h-56 bg-muted relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                }}
                                animate={{
                                    x: ['-100%', '100%'],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'linear',
                                    delay: index * 0.2,
                                }}
                            />
                        </div>
                        <div className="p-5 space-y-3">
                            <motion.div
                                className="h-6 bg-muted rounded-lg w-3/4"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <motion.div
                                className="h-4 bg-muted rounded-lg w-full"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                            />
                            <motion.div
                                className="h-4 bg-muted rounded-lg w-2/3"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            />
                            <div className="flex gap-2 mt-4">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="h-5 bg-muted rounded-full w-16"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default LoadingState;
