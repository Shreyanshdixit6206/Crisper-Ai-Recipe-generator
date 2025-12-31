import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Cloud shapes for the transition
const clouds = [
    { size: 280, x: '-5%', y: '10%', delay: 0 },
    { size: 260, x: '75%', y: '5%', delay: 0.05 },
    { size: 300, x: '25%', y: '55%', delay: 0.1 },
    { size: 240, x: '85%', y: '45%', delay: 0.08 },
    { size: 270, x: '45%', y: '25%', delay: 0.03 },
    { size: 250, x: '15%', y: '70%', delay: 0.12 },
    { size: 280, x: '55%', y: '75%', delay: 0.07 },
    { size: 220, x: '35%', y: '0%', delay: 0.04 },
    { size: 200, x: '65%', y: '35%', delay: 0.09 },
    { size: 230, x: '5%', y: '40%', delay: 0.06 },
];

function FridgeLanding({ onComplete }) {
    const [phase, setPhase] = useState('clouds'); // clouds -> clearing -> done

    useEffect(() => {
        const timeline = [
            { phase: 'clearing', delay: 800 },
            { phase: 'done', delay: 2800 },
        ];

        const timers = timeline.map(({ phase, delay }) =>
            setTimeout(() => setPhase(phase), delay)
        );

        return () => timers.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        if (phase === 'done') {
            onComplete();
        }
    }, [phase, onComplete]);

    const isClearing = phase === 'clearing';

    return (
        <AnimatePresence>
            {phase !== 'done' && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    {/* Sky background - transitions from white to blue */}
                    <motion.div
                        className="absolute inset-0"
                        initial={{
                            background: 'linear-gradient(180deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%)'
                        }}
                        animate={{
                            background: isClearing
                                ? 'linear-gradient(180deg, #87CEEB 0%, #B0E2FF 40%, #E8F7FF 70%, #ffffff 100%)'
                                : 'linear-gradient(180deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%)',
                        }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    />

                    {/* Sun appearing */}
                    <motion.div
                        className="absolute z-20 top-8 left-1/2 -translate-x-1/2"
                        initial={{ opacity: 0, scale: 0.3, y: 50 }}
                        animate={{
                            opacity: isClearing ? 1 : 0,
                            scale: isClearing ? 1 : 0.3,
                            y: isClearing ? 0 : 50,
                        }}
                        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    >
                        <div
                            className="w-28 h-28 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(255,255,200,1) 0%, rgba(255,220,100,0.7) 40%, transparent 70%)',
                                boxShadow: '0 0 100px rgba(255,220,100,0.8), 0 0 200px rgba(255,200,50,0.4)',
                            }}
                        />
                    </motion.div>

                    {/* Animated clouds that cover then part */}
                    {clouds.map((cloud, i) => (
                        <motion.div
                            key={i}
                            className="absolute z-30 pointer-events-none"
                            style={{
                                left: cloud.x,
                                top: cloud.y,
                                width: cloud.size,
                                height: cloud.size * 0.55,
                            }}
                            initial={{
                                opacity: 1,
                                x: 0,
                                y: 0,
                                scale: 1,
                            }}
                            animate={isClearing ? {
                                opacity: 0,
                                x: i % 2 === 0 ? -300 - Math.random() * 200 : 300 + Math.random() * 200,
                                y: -50 - Math.random() * 100,
                                scale: 1.4,
                            } : {
                                opacity: 1,
                                x: 0,
                                y: 0,
                                scale: 1,
                            }}
                            transition={{
                                duration: 1.8,
                                delay: cloud.delay,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                        >
                            {/* Fluffy cloud shape */}
                            <div className="relative w-full h-full">
                                <div
                                    className="absolute rounded-full"
                                    style={{
                                        width: '65%',
                                        height: '100%',
                                        left: '18%',
                                        top: '15%',
                                        background: 'linear-gradient(180deg, #ffffff 0%, #f8f8f8 100%)',
                                        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                                    }}
                                />
                                <div
                                    className="absolute rounded-full"
                                    style={{
                                        width: '50%',
                                        height: '85%',
                                        left: '0%',
                                        top: '35%',
                                        background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
                                    }}
                                />
                                <div
                                    className="absolute rounded-full"
                                    style={{
                                        width: '55%',
                                        height: '90%',
                                        right: '0%',
                                        top: '25%',
                                        background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
                                    }}
                                />
                                <div
                                    className="absolute rounded-full"
                                    style={{
                                        width: '45%',
                                        height: '75%',
                                        left: '28%',
                                        top: '0%',
                                        background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}

                    {/* Center content - Crisper branding */}
                    <motion.div
                        className="absolute z-25 inset-0 flex flex-col items-center justify-center"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: isClearing ? 1 : 0,
                            scale: isClearing ? 1 : 0.9,
                            y: isClearing ? 0 : 20,
                        }}
                        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                    >
                        <motion.div
                            className="text-6xl mb-4"
                            animate={{
                                rotate: [0, -10, 10, -5, 5, 0],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: 1, delay: 0.8 }}
                        >
                            🍳
                        </motion.div>
                        <motion.h1
                            className="text-5xl md:text-6xl font-serif font-bold mb-3"
                            style={{
                                background: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Crisper
                        </motion.h1>
                        <motion.p
                            className="text-lg text-gray-500 font-light"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isClearing ? 1 : 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            AI-Powered Recipe Generator
                        </motion.p>
                    </motion.div>

                    {/* Sparkle particles */}
                    {isClearing && [...Array(12)].map((_, i) => (
                        <motion.div
                            key={`sparkle-${i}`}
                            className="absolute z-35 text-xl"
                            style={{
                                left: `${15 + Math.random() * 70}%`,
                                top: `${20 + Math.random() * 60}%`,
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.3, 0],
                                y: -40,
                            }}
                            transition={{
                                duration: 1.2,
                                delay: 0.6 + i * 0.08,
                                ease: 'easeOut',
                            }}
                        >
                            {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '🌟'}
                        </motion.div>
                    ))}

                    {/* Loading dots at bottom */}
                    <motion.div
                        className="absolute bottom-12 flex gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: phase === 'clouds' ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2.5 h-2.5 rounded-full bg-amber-400"
                                animate={{
                                    y: [0, -10, 0],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.12,
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default FridgeLanding;
