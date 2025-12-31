import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Bookmark, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function RecipeCard({ recipe, index, onClick }) {
    const [isHovered, setIsHovered] = useState(false);
    const [tiltStyle, setTiltStyle] = useState({});
    const cardRef = useRef(null);

    // Handle 3D tilt effect on mouse move
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = -(x - centerX) / 20;

        setTiltStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`,
        });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTiltStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        });
    };

    return (
        <motion.div
            ref={cardRef}
            className="group relative rounded-3xl overflow-hidden cursor-pointer bg-neutral-900 shadow-xl transition-shadow duration-500"
            style={{
                ...tiltStyle,
                transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            whileHover={{
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(193, 127, 89, 0.2)',
            }}
        >
            {/* Shine effect on hover */}
            <motion.div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
                    transform: 'translateX(-100%)',
                }}
                animate={{
                    translateX: isHovered ? '200%' : '-100%',
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
            />

            {/* Image */}
            <div className="relative h-[420px] overflow-hidden">
                <motion.img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    animate={{
                        scale: isHovered ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Animated particles on hover */}
                {isHovered && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-lg"
                                style={{
                                    left: `${20 + Math.random() * 60}%`,
                                    bottom: '20%',
                                }}
                                initial={{ opacity: 0, y: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    y: [-20, -80],
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.2,
                                    repeat: Infinity,
                                }}
                            >
                                ✨
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Top Badge */}
                <motion.div
                    className="absolute top-5 left-5 px-4 py-2 bg-white/15 backdrop-blur-xl border border-white/20 rounded-full"
                    whileHover={{ scale: 1.05 }}
                >
                    <span className="text-xs font-semibold text-white uppercase tracking-wide">{recipe.cuisine}</span>
                </motion.div>

                {/* Bookmark */}
                <motion.button
                    className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center bg-white/15 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/25 transition-all"
                    onClick={(e) => e.stopPropagation()}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Bookmark className="w-5 h-5" />
                </motion.button>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-7">
                    {/* Tags */}
                    <div className="flex gap-2 mb-4">
                        {recipe.dietaryTags?.slice(0, 2).map((tag, tagIndex) => (
                            <motion.span
                                key={tag}
                                className="px-3 py-1 bg-green-400/20 border border-green-400/30 rounded-full text-xs font-semibold text-green-300 uppercase tracking-wide"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * tagIndex }}
                            >
                                {tag}
                            </motion.span>
                        ))}
                    </div>

                    {/* Title */}
                    <motion.h3
                        className="font-serif text-2xl md:text-3xl font-semibold text-white mb-3 leading-tight"
                        animate={{
                            x: isHovered ? 5 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {recipe.name}
                    </motion.h3>

                    {/* Description */}
                    <p className="text-white/70 text-sm leading-relaxed mb-5 line-clamp-2">
                        {recipe.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-white/80">
                        <motion.div
                            className="flex items-center gap-1.5"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Clock className="w-4 h-4 opacity-70" />
                            <span>{recipe.cookingTime} min</span>
                        </motion.div>
                        <div className="w-px h-4 bg-white/30" />
                        <motion.div
                            className="flex items-center gap-1.5"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Users className="w-4 h-4 opacity-70" />
                            <span>{recipe.servings} servings</span>
                        </motion.div>
                        <div className="w-px h-4 bg-white/30" />
                        <motion.span
                            className="font-semibold"
                            whileHover={{ scale: 1.05 }}
                        >
                            {recipe.calories} cal
                        </motion.span>
                    </div>
                </div>

                {/* Match Badge with enhanced animation */}
                <motion.div
                    className="absolute right-5 bottom-28 px-4 py-3 bg-primary/90 backdrop-blur-sm rounded-2xl text-center"
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{
                        opacity: isHovered ? 1 : 0,
                        x: isHovered ? 0 : 20,
                        scale: isHovered ? 1 : 0.8,
                        rotate: isHovered ? [0, 5, -5, 0] : 0,
                    }}
                    transition={{ duration: 0.4, rotate: { duration: 0.5, delay: 0.2 } }}
                >
                    <motion.span
                        className="block text-xl font-bold text-white"
                        animate={{
                            scale: isHovered ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        {recipe.matchPercentage}%
                    </motion.span>
                    <span className="text-xs text-white/80 uppercase tracking-wide">match</span>

                    {/* Stars animation */}
                    {isHovered && (
                        <motion.div
                            className="absolute -top-1 -right-1"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1], rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </motion.div>
                    )}
                </motion.div>

                {/* Difficulty indicator */}
                <motion.div
                    className="absolute left-5 bottom-28 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                        opacity: isHovered ? 1 : 0,
                        x: isHovered ? 0 : -20,
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <span className="text-xs text-white/70 uppercase">Difficulty</span>
                    <div className="flex gap-1 mt-1">
                        {['Easy', 'Moderate', 'Advanced'].map((level, i) => (
                            <div
                                key={level}
                                className={`w-2 h-2 rounded-full ${i <= ['Easy', 'Moderate', 'Advanced'].indexOf(recipe.difficulty)
                                        ? 'bg-primary'
                                        : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default RecipeCard;
