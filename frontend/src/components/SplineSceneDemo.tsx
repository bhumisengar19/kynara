import React from "react"
import { Card } from "./ui/card"
import { Spotlight } from "./ui/spotlight"
import NeuralOrb from "./NeuralOrb"

export function SplineSceneBasic() {
    return (
        <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden border-white/10 shadow-2xl">
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
            />

            <div className="flex h-full flex-col md:flex-row">
                {/* Left content */}
                <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
                    <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 tracking-tighter">
                        Neural Core v2.5
                    </h1>
                    <p className="mt-4 text-neutral-300 max-w-lg font-medium opacity-70 leading-relaxed text-sm md:text-base">
                        Experience Kynara's proprietary neural architecture.
                        A multi-layered generative engine designed for high-fidelity
                        reasoning and creative synthesis.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            Active Node
                        </div>
                        <div className="px-5 py-2 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-[10px] font-black uppercase tracking-[0.2em] text-accent-purple">
                            4.2 tflops
                        </div>
                    </div>
                </div>

                {/* Right content */}
                <div className="flex-1 relative h-[400px] md:h-full group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <NeuralOrb />
                </div>
            </div>
        </Card>
    )
}
