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
                            src="/profile.jpg"
                            alt="Thanapat Pirmphol"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="font-sans text-base md:text-lg leading-relaxed">
                        <p className="mb-4">
                            Visionary Chief Technology Officer specializing in Blockchain and Sustainable Technology. I bridge the gap between complex technical innovations and tangible business value.
                        </p>
                        <p className="mb-4">
                            With a proven track record in orchestrating high-performance engineering teams and architecting secure, scalable distributed systems, I drive digital transformation that matters. My leadership is defined by a commitment to ethical tech development and delivering solutions that are not only cutting-edge but also culturally resonant and societally impactful.
                        </p>
                        <p className="mb-4">
                            I pioneered the <strong>WAND Framework</strong> (Water Ledger Global AI-Native Development), a revolutionary methodology that integrates Spec-Driven Development with AI agents to accelerate engineering workflows, ensuring precision and scalability.
                        </p>
                        <p>
                            I am dedicated to leveraging technology to solve critical global challenges, ensuring that every line of code contributes to a more sustainable future.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
