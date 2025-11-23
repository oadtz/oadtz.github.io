import React from 'react';

interface SectionProps {
    isNightMode?: boolean;
}

export const Contact: React.FC<SectionProps> = ({ isNightMode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen p-4 sm:p-8">
            <div className={`p-6 sm:p-10 rounded-lg border-4 shadow-lg max-w-2xl w-full text-center transition-colors duration-500 ${isNightMode
                ? 'bg-slate-800/95 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/90 border-black text-black'
                }`}>
                <h2 className="text-2xl md:text-3xl font-pixel mb-4 md:mb-8">Contact</h2>
                <p className="text-lg md:text-xl mb-6 md:mb-8">Let's work together!</p>

                <div className="flex flex-col gap-3 md:gap-4 items-center">
                    <a
                        href="mailto:t.pirmphol@gmail.com"
                        className={`font-pixel py-2 md:py-3 px-6 md:px-8 rounded border-b-4 active:border-b-0 active:translate-y-1 transition-all w-full md:w-64 text-sm md:text-base ${isNightMode
                            ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-800'
                            : 'bg-sky-500 hover:bg-sky-600 text-white border-sky-700'
                            }`}
                    >
                        EMAIL ME
                    </a>
                    <a
                        href="https://www.linkedin.com/in/thanapatpirmphol"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-pixel py-2 md:py-3 px-6 md:px-8 rounded border-b-4 active:border-b-0 active:translate-y-1 transition-all w-full md:w-64 text-sm md:text-base ${isNightMode
                            ? 'bg-blue-800 hover:bg-blue-700 text-white border-blue-950'
                            : 'bg-blue-700 hover:bg-blue-800 text-white border-blue-900'
                            }`}
                    >
                        LINKEDIN
                    </a>
                    <a
                        href="https://www.github.com/oadtz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-pixel py-2 md:py-3 px-6 md:px-8 rounded border-b-4 active:border-b-0 active:translate-y-1 transition-all w-full md:w-64 text-sm md:text-base ${isNightMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-900'
                            : 'bg-gray-800 hover:bg-gray-900 text-white border-black'
                            }`}
                    >
                        GITHUB
                    </a>
                </div>

                <div className={`mt-8 md:mt-12 text-xs md:text-sm font-pixel ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    THANAPAT PIRMPHOL © 2025
                </div>
            </div>
        </div>
    );
};
