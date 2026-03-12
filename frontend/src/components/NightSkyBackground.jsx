import { motion } from "framer-motion";

const Star = ({ top, left, delay, size }) => (
    <motion.div
        initial={{ opacity: 0.1, scale: 0.5 }}
        animate={{
            opacity: [0.1, 0.8, 0.1],
            scale: [0.5, 1.2, 0.5],
            y: [0, -20, 0]
        }}
        transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay,
            ease: "easeInOut"
        }}
        className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        style={{ top: `${top}%`, left: `${left}%`, width: size, height: size }}
    />
);

const Cloud = ({ top, delay, duration, opacity }) => (
    <motion.div
        initial={{ x: "-20%", opacity: 0 }}
        animate={{ x: "120%", opacity: [0, opacity, 0] }}
        transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
        className="absolute bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent blur-3xl h-64 w-[600px] rounded-full"
        style={{ top: `${top}%` }}
    />
);

export default function NightSkyBackground() {
    const stars = Array.from({ length: 50 }).map((_, i) => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        size: Math.random() * 3 + 1
    }));

    return (
        <div className="fixed inset-0 z-0 bg-kynaraDark-bg overflow-hidden pointer-events-none">
            {/* Deep Gradient Layers */}
            <div className="absolute inset-0 bg-gradient-to-tr from-kynaraDark-navy via-kynaraDark-indigo to-kynaraDark-midnight opacity-80" />

            {/* Nebula Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-900/20 blur-[120px] rounded-full animate-pulse-glow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full animate-pulse-glow" />

            {/* Clouds */}
            <Cloud top={20} delay={0} duration={40} opacity={0.15} />
            <Cloud top={50} delay={10} duration={60} opacity={0.1} />
            <Cloud top={80} delay={5} duration={50} opacity={0.12} />

            {/* Stars */}
            <div className="absolute inset-0">
                {stars.map((star, i) => (
                    <Star key={i} {...star} />
                ))}
            </div>

            {/* Glowing Moon */}
            <motion.div
                animate={{
                    boxShadow: [
                        "0 0 40px rgba(230, 230, 250, 0.2)",
                        "0 0 80px rgba(230, 230, 250, 0.4)",
                        "0 0 40px rgba(230, 230, 250, 0.2)"
                    ]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[10%] left-[15%] w-32 h-32 rounded-full bg-gradient-to-br from-lavender-100 to-indigo-100 opacity-90 backdrop-blur-sm z-10"
            >
                {/* Moon Crater Details */}
                <div className="absolute top-[20%] left-[30%] w-4 h-4 bg-indigo-200/30 rounded-full" />
                <div className="absolute top-[50%] left-[60%] w-6 h-6 bg-indigo-200/40 rounded-full" />
                <div className="absolute top-[70%] left-[20%] w-3 h-3 bg-indigo-200/20 rounded-full" />
            </motion.div>

            {/* Subtle Fog */}
            <div className="absolute inset-0 bg-gradient-to-t from-kynaraDark-bg via-transparent to-transparent opacity-60" />
        </div>
    );
}
