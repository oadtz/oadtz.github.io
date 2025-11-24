import React from 'react';

interface SectionProps {
    isNightMode?: boolean;
}

export const Home: React.FC<SectionProps> = ({ isNightMode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen p-4 sm:p-8">
            <div className={`p-6 sm:p-12 rounded-lg border-4 shadow-lg text-center transition-colors duration-500 ${isNightMode
                ? 'bg-slate-800/95 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/90 border-black text-black'
                }`}>
                <h1 className="text-3xl md:text-6xl font-pixel mb-4">Thanapat Pirmphol</h1>
                <p className="text-lg md:text-2xl font-pixel mb-8">CTO | Certified Blockchain Developer | Innovator</p>

                {/* Desktop Instructions */}
                <div className="hidden md:flex items-center justify-center gap-2 font-sans text-lg">
                    <span className="px-2 py-1 bg-gray-200 text-black rounded border-2 border-gray-400 font-bold">SPACE</span>
                    <span>or</span>
                    <span className="px-2 py-1 bg-gray-200 text-black rounded border-2 border-gray-400 font-bold">↑</span>
                    <span>to Fly</span>
                </div>

                {/* Mobile Instructions */}
                <div className="flex md:hidden items-center justify-center gap-2 font-sans text-lg animate-pulse">
                    <span className="font-bold">Tap to Fly</span>
                </div>
            </div>
        </div>
    );
};
