import React from 'react';

interface SectionProps {
    isNightMode?: boolean;
}

export const About: React.FC<SectionProps> = ({ isNightMode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen p-4 sm:p-8">
            <div className={`p-4 sm:p-8 rounded-lg border-4 shadow-lg max-w-2xl max-h-[70vh] md:max-h-[80vh] overflow-y-auto transition-colors duration-500 ${isNightMode
                ? 'bg-slate-800/95 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/90 border-black text-black'
                }`}>
                <h2 className={`text-2xl md:text-3xl font-pixel mb-4 md:mb-6 text-center border-b-4 pb-4 ${isNightMode ? 'border-white/50' : 'border-black'}`}>About Me</h2>
                <div className="flex flex-col gap-4 md:gap-8 items-center">
                    <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 overflow-hidden shrink-0 ${isNightMode ? 'border-white/50 bg-slate-700' : 'border-black bg-gray-300'}`}>
                        <img
                            src="/flappybird/profile.jpg"
                            alt="Thanapat Pirmphol"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="font-sans text-base md:text-lg leading-relaxed">
                        <p className="mb-4">
                            This is the arcade archive: a lighter side path for the work that does not fit neatly into the main executive site.
                        </p>
                        <p className="mb-4">
                            Before the current focus on trusted markets, water infrastructure, blockchain, and agentic AI, I spent years building and modernizing enterprise systems across aviation, insurance, data platforms, consulting, application support, and offshore delivery.
                        </p>
                        <p className="mb-4">
                            The pattern underneath is simple: I like understanding messy operational problems, turning them into working software, and staying close enough to the implementation to know what is real.
                        </p>
                        <p>
                            Think of this section as the playable backstory: practical systems, old-school delivery discipline, data work, certifications, and the builder personality behind the more polished profile.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
