import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Remy's animation states
const STATES = {
    IDLE: 'idle',
    ROAMING: 'roaming',
    NOD: 'nod',
    THINKING: 'thinking',
    COOKING: 'cooking',
    EXCITED: 'excited',
    FLEEING: 'fleeing',
};

// Idle animation phrases
const idlePhrases = [
    "Anyone can cook! 🍳",
    "Hmm, what's cooking? 🤔",
    "Add some ingredients! 🥕",
    "I smell deliciousness! 👃",
    "Let's make magic! ✨",
];

function RemyMascot({ state = STATES.IDLE, message = null }) {
    // Initialize with a visible default position
    const [position, setPosition] = useState({ x: 100, y: 400 });
    const [currentPhrase, setCurrentPhrase] = useState(null);
    const [facingDirection, setFacingDirection] = useState(-1); // -1 = left (facing user), 1 = right
    const [isRunning, setIsRunning] = useState(false);
    const [idleAction, setIdleAction] = useState('stand');
    const [isInitialized, setIsInitialized] = useState(false);
    const remyRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const fleeTimeoutRef = useRef(null);
    const roamingIntervalRef = useRef(null);

    // Initialize position after mount
    useEffect(() => {
        const initPosition = {
            x: window.innerWidth - 180,
            y: window.innerHeight - 250,
        };
        setPosition(initPosition);
        setIsInitialized(true);
    }, []);

    // Get safe zones dynamically
    const getSafeZones = useCallback(() => [
        { x: 80, y: 250, label: 'left-top' },
        { x: 80, y: 450, label: 'left-mid' },
        { x: 80, y: Math.min(650, window.innerHeight - 180), label: 'left-bottom' },
        { x: window.innerWidth - 180, y: 250, label: 'right-top' },
        { x: window.innerWidth - 180, y: 450, label: 'right-mid' },
        { x: window.innerWidth - 180, y: Math.min(650, window.innerHeight - 180), label: 'right-bottom' },
        { x: window.innerWidth / 2 - 40, y: 200, label: 'top-center' },
        { x: window.innerWidth / 2 - 40, y: Math.min(650, window.innerHeight - 180), label: 'bottom-center' },
    ], []);

    // Get a random safe position
    const getRandomSafePosition = useCallback(() => {
        const zones = getSafeZones();
        const zone = zones[Math.floor(Math.random() * zones.length)];
        return {
            x: Math.max(50, Math.min(zone.x + (Math.random() - 0.5) * 80, window.innerWidth - 150)),
            y: Math.max(150, Math.min(zone.y + (Math.random() - 0.5) * 80, window.innerHeight - 180)),
        };
    }, [getSafeZones]);

    // Flee from cursor
    const fleeFromCursor = useCallback((cursorX, cursorY) => {
        const dx = position.x - cursorX;
        const dy = position.y - cursorY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) { // Flee radius
            setIsRunning(true);

            // Calculate flee direction (away from cursor)
            const angle = Math.atan2(dy, dx);
            const fleeDistance = 150 + Math.random() * 100;

            let newX = position.x + Math.cos(angle) * fleeDistance;
            let newY = position.y + Math.sin(angle) * fleeDistance;

            // Keep within bounds
            newX = Math.max(50, Math.min(newX, window.innerWidth - 150));
            newY = Math.max(150, Math.min(newY, window.innerHeight - 180));

            // Update facing direction based on movement
            setFacingDirection(newX > position.x ? 1 : -1);

            setPosition({ x: newX, y: newY });

            // Stop running after reaching destination
            clearTimeout(fleeTimeoutRef.current);
            fleeTimeoutRef.current = setTimeout(() => {
                setIsRunning(false);
                setFacingDirection(-1); // Face back toward user
            }, 800);
        }
    }, [position]);

    // Track mouse movement
    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };

            if (state === STATES.IDLE || state === STATES.ROAMING) {
                fleeFromCursor(e.clientX, e.clientY);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [state, fleeFromCursor]);

    // Roaming behavior when idle
    useEffect(() => {
        if (state === STATES.IDLE && !isRunning && isInitialized) {
            roamingIntervalRef.current = setInterval(() => {
                const newPos = getRandomSafePosition();
                setFacingDirection(newPos.x > position.x ? 1 : -1);
                setPosition(newPos);

                // Turn back to face user after moving
                setTimeout(() => setFacingDirection(-1), 1500);
            }, 6000 + Math.random() * 4000);

            return () => clearInterval(roamingIntervalRef.current);
        }
    }, [state, isRunning, isInitialized, getRandomSafePosition, position.x]);

    // Stop roaming when not idle
    useEffect(() => {
        if (state !== STATES.IDLE && isInitialized) {
            clearInterval(roamingIntervalRef.current);
            setIsRunning(false);
            // Move to corner and face user when doing an action
            setPosition({ x: window.innerWidth - 180, y: window.innerHeight - 250 });
            setFacingDirection(-1);
        }
    }, [state, isInitialized]);

    // Show random phrases when idle
    useEffect(() => {
        if (state === STATES.IDLE) {
            const showPhrase = () => {
                const phrase = idlePhrases[Math.floor(Math.random() * idlePhrases.length)];
                setCurrentPhrase(phrase);
                setTimeout(() => setCurrentPhrase(null), 3500);
            };

            const initialTimer = setTimeout(showPhrase, 2000);
            const phraseInterval = setInterval(showPhrase, 10000);

            return () => {
                clearTimeout(initialTimer);
                clearInterval(phraseInterval);
            };
        }
    }, [state]);

    // Cycle through idle actions
    useEffect(() => {
        if (state === STATES.IDLE && !isRunning) {
            const actions = ['stand', 'sniff', 'look', 'scratch'];
            let actionIndex = 0;

            const cycleAction = () => {
                actionIndex = (actionIndex + 1) % actions.length;
                setIdleAction(actions[actionIndex]);
            };

            const actionInterval = setInterval(cycleAction, 3500);
            return () => clearInterval(actionInterval);
        } else if (isRunning) {
            setIdleAction('run');
        }
    }, [state, isRunning]);

    // Get body animation based on state
    const getBodyAnimation = () => {
        if (isRunning) {
            return {
                y: [0, -8, 0, -8, 0],
                rotate: [-5, 5, -5, 5, -5],
            };
        }

        switch (state) {
            case STATES.NOD:
                return {
                    rotate: [0, -12, 12, -8, 8, 0],
                    y: [0, -10, 0],
                };
            case STATES.THINKING:
                return {
                    rotate: [0, -5, 5, -5, 5, 0],
                    x: [0, -3, 3, 0],
                };
            case STATES.COOKING:
                return {
                    rotate: [0, -10, 10, -10, 10, 0],
                    y: [0, -12, 0, -12, 0],
                };
            case STATES.EXCITED:
                return {
                    y: [0, -35, 0, -28, 0, -18, 0],
                    rotate: [0, -18, 18, -12, 12, 0],
                    scale: [1, 1.15, 1],
                };
            case STATES.IDLE:
            default:
                switch (idleAction) {
                    case 'sniff':
                        return { rotate: [0, 8, 0, 8, 0], y: [0, -4, 0] };
                    case 'look':
                        return { rotate: [0, -20, 0, 20, 0] };
                    case 'scratch':
                        return { rotate: [0, 5, -5, 5, 0], x: [0, 2, -2, 0] };
                    case 'run':
                        return { y: [0, -8, 0], rotate: [-3, 3, -3] };
                    default:
                        return { y: [0, -4, 0], rotate: [0, 3, 0, -3, 0] };
                }
        }
    };

    // Don't render until initialized
    if (!isInitialized) return null;

    return (
        <motion.div
            ref={remyRef}
            className="fixed z-50 pointer-events-none select-none"
            style={{
                left: 0,
                top: 0,
            }}
            animate={{
                x: position.x,
                y: position.y,
            }}
            transition={{
                type: isRunning ? 'spring' : 'tween',
                stiffness: isRunning ? 200 : 100,
                damping: isRunning ? 20 : 30,
                duration: isRunning ? 0.4 : 2,
            }}
        >
            {/* Speech bubble - TOP RIGHT corner of Remy */}
            <AnimatePresence>
                {(currentPhrase || message) && (
                    <motion.div
                        className="absolute -top-16 -right-4 px-3 py-2 bg-white rounded-xl shadow-lg border-2 border-primary/20 max-w-[180px] z-[60]"
                        initial={{ opacity: 0, scale: 0.5, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5, x: 20 }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 400 }}
                    >
                        <div className="text-xs text-foreground font-medium text-center leading-snug">
                            {message || currentPhrase}
                        </div>
                        {/* Bubble tail pointing to Remy */}
                        <div
                            className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-r-2 border-b-2 border-primary/20 rotate-45"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Remy character - NO HAT, just the rat */}
            <motion.div
                className="relative"
                style={{
                    scaleX: facingDirection,
                    transformOrigin: 'center bottom',
                }}
                animate={getBodyAnimation()}
                transition={{
                    duration: isRunning ? 0.15 : state === STATES.IDLE ? 2 : 0.6,
                    repeat: isRunning || state === STATES.IDLE || state === STATES.COOKING || state === STATES.THINKING ? Infinity : 0,
                    ease: 'easeInOut',
                }}
            >
                {/* Main body container */}
                <div className="relative w-20 h-24">
                    {/* Ground shadow */}
                    <motion.div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-3 bg-black/20 rounded-[50%] blur-sm"
                        animate={{
                            scaleX: isRunning ? [1, 0.7, 1] : [1, 1.1, 1],
                            opacity: state === STATES.EXCITED ? [0.2, 0.1, 0.2] : 0.2,
                        }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                    />

                    {/* Body */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                        {/* Tail - long and curvy */}
                        <motion.svg
                            className="absolute -left-10 bottom-6"
                            width="45"
                            height="20"
                            viewBox="0 0 45 20"
                            animate={{
                                rotate: isRunning ? [-25, 25, -25] :
                                    state === STATES.EXCITED ? [-35, 35, -35] : [-12, 12, -12],
                            }}
                            transition={{ duration: isRunning ? 0.15 : 0.4, repeat: Infinity }}
                            style={{ transformOrigin: 'right center' }}
                        >
                            <path
                                d="M45 10 Q30 0 20 10 Q10 20 0 15"
                                stroke="#b8956f"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </motion.svg>

                        {/* Back legs (when running) */}
                        <motion.div
                            className="absolute -bottom-2 left-1 w-3 h-4 rounded-b-full"
                            style={{ background: 'linear-gradient(180deg, #8b7355 0%, #6d5a45 100%)' }}
                            animate={{
                                rotate: isRunning ? [-25, 25, -25] : [-5, 5, -5],
                            }}
                            transition={{ duration: isRunning ? 0.1 : 0.5, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute -bottom-2 right-1 w-3 h-4 rounded-b-full"
                            style={{ background: 'linear-gradient(180deg, #8b7355 0%, #6d5a45 100%)' }}
                            animate={{
                                rotate: isRunning ? [25, -25, 25] : [5, -5, 5],
                            }}
                            transition={{ duration: isRunning ? 0.1 : 0.5, repeat: Infinity, delay: 0.05 }}
                        />

                        {/* Main body */}
                        <div
                            className="relative w-12 h-14 rounded-[45%] mx-auto"
                            style={{
                                background: 'linear-gradient(145deg, #a08774 0%, #7d6652 40%, #5e4f40 100%)',
                                boxShadow: `
                                    inset -2px -4px 8px rgba(0,0,0,0.3),
                                    inset 2px 2px 6px rgba(255,255,255,0.1),
                                    0 4px 15px rgba(0,0,0,0.25)
                                `,
                            }}
                        >
                            {/* Belly */}
                            <div
                                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-9 h-9 rounded-[50%]"
                                style={{
                                    background: 'radial-gradient(ellipse at center, #efe4d8 0%, #ddd0c0 60%, #ccc0ae 100%)',
                                }}
                            />

                            {/* Front paws/arms */}
                            <motion.div
                                className="absolute -left-3 top-6 w-4 h-5 rounded-full origin-top-right"
                                style={{
                                    background: 'linear-gradient(145deg, #a08774 0%, #7d6652 100%)',
                                }}
                                animate={{
                                    rotate: isRunning ? [-40, 40, -40] :
                                        state === STATES.COOKING ? [-35, 35, -35] :
                                            idleAction === 'scratch' ? [-20, 50, -20] : [-8, 8, -8],
                                }}
                                transition={{ duration: isRunning ? 0.1 : 0.5, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute -right-3 top-6 w-4 h-5 rounded-full origin-top-left"
                                style={{
                                    background: 'linear-gradient(145deg, #a08774 0%, #7d6652 100%)',
                                }}
                                animate={{
                                    rotate: isRunning ? [40, -40, 40] :
                                        state === STATES.EXCITED ? [-20, 50, -20] : [8, -8, 8],
                                }}
                                transition={{ duration: isRunning ? 0.1 : 0.5, repeat: Infinity, delay: 0.05 }}
                            />
                        </div>

                        {/* Head */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-14 h-12">
                            {/* Main head */}
                            <div
                                className="relative w-full h-11 rounded-[55%] mx-auto"
                                style={{
                                    background: 'linear-gradient(145deg, #a08774 0%, #7d6652 40%, #5e4f40 100%)',
                                    boxShadow: `
                                        inset -2px -3px 6px rgba(0,0,0,0.25),
                                        inset 2px 2px 6px rgba(255,255,255,0.08),
                                        0 3px 12px rgba(0,0,0,0.25)
                                    `,
                                }}
                            >
                                {/* Ears - large and round */}
                                <motion.div
                                    className="absolute -left-2 -top-2 w-7 h-7 rounded-full"
                                    style={{
                                        background: 'linear-gradient(145deg, #a08774 0%, #7d6652 100%)',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                    }}
                                    animate={{
                                        rotate: idleAction === 'sniff' ? [-5, 5, -5] : 0,
                                    }}
                                    transition={{ duration: 0.3, repeat: Infinity }}
                                >
                                    <div
                                        className="absolute inset-1.5 rounded-full"
                                        style={{ background: 'linear-gradient(145deg, #e8bfa0 0%, #d4a882 100%)' }}
                                    />
                                </motion.div>
                                <motion.div
                                    className="absolute -right-2 -top-2 w-7 h-7 rounded-full"
                                    style={{
                                        background: 'linear-gradient(145deg, #a08774 0%, #7d6652 100%)',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                    }}
                                    animate={{
                                        rotate: idleAction === 'sniff' ? [5, -5, 5] : 0,
                                    }}
                                    transition={{ duration: 0.3, repeat: Infinity, delay: 0.1 }}
                                >
                                    <div
                                        className="absolute inset-1.5 rounded-full"
                                        style={{ background: 'linear-gradient(145deg, #e8bfa0 0%, #d4a882 100%)' }}
                                    />
                                </motion.div>

                                {/* Face */}
                                <div className="absolute inset-x-1 top-4 bottom-0">
                                    {/* Eyes - large and expressive */}
                                    <div className="flex justify-center gap-4 mb-0.5">
                                        <motion.div
                                            className="relative w-4 h-4 bg-gradient-to-br from-gray-800 to-black rounded-full"
                                            style={{ boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.4)' }}
                                            animate={{
                                                scaleY: state === STATES.NOD ? [1, 0.1, 1] :
                                                    isRunning ? [1, 0.7, 1] : 1,
                                            }}
                                            transition={{ duration: 0.12 }}
                                        >
                                            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                                        </motion.div>
                                        <motion.div
                                            className="relative w-4 h-4 bg-gradient-to-br from-gray-800 to-black rounded-full"
                                            style={{ boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.4)' }}
                                            animate={{
                                                scaleY: state === STATES.NOD ? [1, 0.1, 1] :
                                                    isRunning ? [1, 0.7, 1] : 1,
                                            }}
                                            transition={{ duration: 0.12 }}
                                        >
                                            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                                        </motion.div>
                                    </div>

                                    {/* Nose - pink and twitchy */}
                                    <div className="flex justify-center">
                                        <motion.div
                                            className="w-4 h-3 rounded-[50%]"
                                            style={{
                                                background: 'linear-gradient(180deg, #ff9999 0%, #cc6666 100%)',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                            }}
                                            animate={{
                                                scale: idleAction === 'sniff' || isRunning ? [1, 1.15, 1] : 1,
                                            }}
                                            transition={{ duration: 0.2, repeat: idleAction === 'sniff' ? Infinity : 0 }}
                                        />
                                    </div>

                                    {/* Whiskers */}
                                    <div className="absolute top-4 -left-3 space-y-0.5">
                                        <motion.div
                                            className="w-4 h-px bg-gray-500 -rotate-15"
                                            animate={{ rotate: idleAction === 'sniff' ? [-15, -5, -15] : -15 }}
                                            transition={{ duration: 0.2, repeat: Infinity }}
                                        />
                                        <div className="w-4 h-px bg-gray-500" />
                                        <motion.div
                                            className="w-4 h-px bg-gray-500 rotate-15"
                                            animate={{ rotate: idleAction === 'sniff' ? [15, 5, 15] : 15 }}
                                            transition={{ duration: 0.2, repeat: Infinity }}
                                        />
                                    </div>
                                    <div className="absolute top-4 -right-3 space-y-0.5">
                                        <motion.div
                                            className="w-4 h-px bg-gray-500 rotate-15"
                                            animate={{ rotate: idleAction === 'sniff' ? [15, 5, 15] : 15 }}
                                            transition={{ duration: 0.2, repeat: Infinity }}
                                        />
                                        <div className="w-4 h-px bg-gray-500" />
                                        <motion.div
                                            className="w-4 h-px bg-gray-500 -rotate-15"
                                            animate={{ rotate: idleAction === 'sniff' ? [-15, -5, -15] : -15 }}
                                            transition={{ duration: 0.2, repeat: Infinity }}
                                        />
                                    </div>

                                    {/* Mouth */}
                                    <motion.div className="flex justify-center">
                                        <div
                                            className="w-3 h-1.5 border-b-2 border-gray-600 rounded-b-full"
                                            style={{
                                                borderColor: state === STATES.EXCITED ? '#666' : '#555',
                                            }}
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Accessories based on state */}
                        <AnimatePresence>
                            {state === STATES.COOKING && (
                                <motion.div
                                    className="absolute -right-8 top-2 text-2xl"
                                    initial={{ opacity: 0, rotate: -30 }}
                                    animate={{ opacity: 1, rotate: [-20, 20, -20] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ rotate: { duration: 0.2, repeat: Infinity } }}
                                >
                                    🥄
                                </motion.div>
                            )}
                            {state === STATES.THINKING && (
                                <motion.div
                                    className="absolute -left-8 -top-2 text-xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1, y: [0, -3, 0] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ y: { duration: 1.5, repeat: Infinity } }}
                                >
                                    📖
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Sparkles when excited */}
                        <AnimatePresence>
                            {state === STATES.EXCITED && (
                                <>
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute text-base"
                                            style={{
                                                top: `${-25 + Math.random() * 50}px`,
                                                left: `${-15 + Math.random() * 50}px`,
                                            }}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{
                                                opacity: [0, 1, 0],
                                                scale: [0, 1.2, 0],
                                                y: [-5, -35],
                                            }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                        >
                                            {i % 2 === 0 ? '⭐' : '✨'}
                                        </motion.div>
                                    ))}
                                </>
                            )}
                        </AnimatePresence>

                        {/* Running dust clouds */}
                        <AnimatePresence>
                            {isRunning && (
                                <>
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute -bottom-1 left-1/2 w-3 h-2 bg-amber-200/40 rounded-full blur-sm"
                                            initial={{ opacity: 0.6, scale: 0.5, x: 0 }}
                                            animate={{
                                                opacity: 0,
                                                scale: 1.5,
                                                x: facingDirection * -20,
                                                y: -5,
                                            }}
                                            transition={{ duration: 0.4, delay: i * 0.1 }}
                                        />
                                    ))}
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export { STATES as REMY_STATES };
export default RemyMascot;
