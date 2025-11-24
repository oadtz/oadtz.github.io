import React from 'react';

interface SectionProps {
    isNightMode?: boolean;
}

const certs = [
    "M.S. MIS, Chulalongkorn University (3.58 GPA)",
    "B.S. Computer Science, Burapha University",
    "Certified Blockchain Developer (CBDE)",
    "MS Azure Musketeer",
    "Power BI (Microsoft x Edx)",
    "Machine Learning (Coursera x Stanford)",
    "MongoDB for Developers",
    "MongoDB for DBAs"
];

export const Certifications: React.FC<SectionProps> = ({ isNightMode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen p-4 sm:p-8">
            <div className={`p-4 sm:p-8 rounded-lg border-4 shadow-lg max-w-3xl w-full max-h-[70vh] md:max-h-auto overflow-y-auto transition-colors duration-500 ${isNightMode
                ? 'bg-slate-800/95 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/90 border-black text-black'
                }`}>
                <h2 className={`text-2xl md:text-3xl font-pixel mb-6 md:mb-8 text-center border-b-4 pb-4 ${isNightMode ? 'border-white/50' : 'border-black'}`}>Education & Certifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {certs.map((cert, index) => (
                        <div key={index} className={`flex items-center p-2 md:p-3 border-2 rounded ${isNightMode
                            ? 'bg-slate-700/50 border-white/30 text-gray-200'
                            : 'bg-yellow-50 border-yellow-200 text-black'
                            }`}>
                            <span className="text-xl md:text-2xl mr-2 md:mr-3">🏆</span>
                            <span className="font-medium text-sm md:text-base">{cert}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
