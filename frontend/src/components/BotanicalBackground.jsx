import { motion } from "framer-motion";

const Particle = ({ top, left, delay, size }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: [0, 0.4, 0],
            scale: [0, 1, 0.5],
            y: [0, -40, -80],
            x: [0, Math.random() * 20 - 10, 0]
        }}
        transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay,
            ease: "easeInOut"
        }}
        className="absolute rounded-full bg-kynaraLight-pink/40 blur-[1px]"
        style={{ top: `${top}%`, left: `${left}%`, width: size, height: size }}
    />
);

const LightBeam = ({ left, delay, duration, width, opacity }) => (
    <motion.div
        initial={{ skewX: -20, opacity: 0 }}
        animate={{
            opacity: [0, opacity, 0],
            x: ["-10%", "10%"]
        }}
        transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
        className="absolute top-[-20%] h-[140%] bg-gradient-to-b from-white/20 via-white/5 to-transparent blur-3xl pointer-events-none"
        style={{ left: `${left}%`, width: `${width}px` }}
    />
);

const Flower = ({ type, color, top, left, delay, rotation, size = 60 }) => {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{
                y: [-15, 15, -15],
                rotate: [rotation - 8, rotation + 8, rotation - 8],
                opacity: 0.7,
                filter: [
                    "drop-shadow(0 0 0px transparent)",
                    `drop-shadow(0 0 10px ${color}33)`,
                    "drop-shadow(0 0 0px transparent)"
                ]
            }}
            transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
            }}
            className="absolute"
            style={{ top: `${top}%`, left: `${left}%`, color }}
        >
            <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className="drop-shadow-sm">
                {type === 'lavender' && (
                    <path d="M50 90 L50 40 M50 45 L60 35 M50 55 L40 45 M50 65 L60 55 M50 75 L40 65" stroke="currentColor" strokeWidth="2" fill="none" />
                )}
                {type === 'leaf' && (
                    <path d="M50 90 C70 70 80 40 50 10 C20 40 30 70 50 90" />
                )}
                {type === 'tulip' && (
                    <path d="M50 90 L50 60 M35 40 C35 20 45 10 50 30 C55 10 65 20 65 40 C65 60 55 70 50 70 C45 70 35 60 35 40" />
                )}
                {type === 'berry' && (
                    <g>
                        <path d="M50 90 L50 40" stroke="currentColor" strokeWidth="1" />
                        <circle cx="50" cy="35" r="8" />
                        <circle cx="62" cy="45" r="6" />
                        <circle cx="38" cy="48" r="7" />
                    </g>
                )}
            </svg>
        </motion.div>
    );
};

export default function BotanicalBackground() {
    const elements = [
        { type: 'lavender', color: '#B19CD9', top: 15, left: 10, delay: 0, rotation: -15, size: 80 },
        { type: 'leaf', color: '#90EE90', top: 75, left: 88, delay: 2, rotation: 25, size: 100 },
        { type: 'tulip', color: '#FFB6C1', top: 45, left: 82, delay: 1, rotation: 5, size: 70 },
        { type: 'lavender', color: '#B19CD9', top: 85, left: 12, delay: 3, rotation: 10, size: 90 },
        { type: 'leaf', color: '#90EE90', top: 8, left: 78, delay: 5, rotation: -35, size: 110 },
        { type: 'berry', color: '#FFD1DC', top: 55, left: 5, delay: 4, rotation: 15, size: 50 },
        { type: 'leaf', color: '#B2FFD8', top: 30, left: 92, delay: 6, rotation: -10, size: 40 },
    ];

    const particles = Array.from({ length: 25 }).map((_, i) => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        size: Math.random() * 4 + 2
    }));

    return (
        <div className="fixed inset-0 z-0 bg-kynaraLight-bg overflow-hidden pointer-events-none">
            {/* Soft Ambient Light Base */}
            <div className="absolute inset-0 bg-gradient-to-br from-kynaraLight-bg via-white to-kynaraLight-mint/10" />

            {/* Light Beams */}
            <LightBeam left={20} delay={0} duration={15} width={200} opacity={0.3} />
            <LightBeam left={60} delay={4} duration={20} width={150} opacity={0.2} />
            <LightBeam left={85} delay={8} duration={18} width={250} opacity={0.25} />

            {/* Breathing Gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-30%] right-[-15%] w-[120%] h-[120%] bg-gradient-radial from-kynaraLight-pink/30 to-transparent blur-[100px] pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1.3, 1, 1.3],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-30%] left-[-15%] w-[120%] h-[120%] bg-gradient-radial from-kynaraLight-mint/30 to-transparent blur-[100px] pointer-events-none"
            />

            {/* Pollen Particles */}
            {particles.map((p, i) => (
                <Particle key={i} {...p} />
            ))}

            {/* Botanical Illustrations */}
            {elements.map((el, i) => (
                <Flower key={i} {...el} />
            ))}

            {/* Soft Radiant Sun/Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[5%] right-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-orange-100/40 to-white/0 blur-[60px] z-10"
            />

            {/* Overlay for Texture */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/20 pointer-events-none" />
        </div>
    );
}


