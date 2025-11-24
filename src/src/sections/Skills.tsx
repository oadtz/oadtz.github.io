import React from 'react';

interface SectionProps {
    isNightMode?: boolean;
}

const skills = [
    { category: "Emerging Tech", items: ["Generative AI", "LLM", "Ollama", "LMStudio", "Cursor", "CodeRabbit", "OpenCode", "Machine Learning"] },
    { category: "Leadership & Strategy", items: ["WAND Framework", "Strategic Planning", "Team Leadership", "Tech Architecture", "Agile/Scrum", "Stakeholder Mgmt"] },
    { category: "Blockchain", items: ["Smart Contracts", "DLT", "Solidity", "Consensus Mechanisms"] },
    { category: "Technical Stack", items: ["NodeJS", "TypeScript", "ReactJS", "Python", "C#", "Go"] },
    { category: "Data & Cloud", items: ["SQL/NoSQL", "MicroStrategy", "AWS", "Azure", "Docker", "DevOps"] }
];

export const Skills: React.FC<SectionProps> = ({ isNightMode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen p-4 sm:p-8">
            <div className={`p-4 sm:p-8 rounded-lg border-4 shadow-lg max-w-4xl w-full max-h-[70vh] md:max-h-auto overflow-y-auto transition-colors duration-500 ${isNightMode
                ? 'bg-slate-800/95 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/90 border-black text-black'
                }`}>
                <h2 className={`text-2xl md:text-3xl font-pixel mb-6 md:mb-8 text-center border-b-4 pb-4 ${isNightMode ? 'border-white/50' : 'border-black'}`}>Skills Matrix</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {skills.map((skillGroup, index) => (
                        <div key={index} className={`border-2 p-3 md:p-4 rounded ${isNightMode ? 'border-white/30 bg-slate-700/50' : 'border-gray-300'}`}>
                            <h3 className={`text-lg md:text-xl font-bold mb-2 border-b-2 pb-1 ${isNightMode ? 'border-white/20' : 'border-gray-200'}`}>{skillGroup.category}</h3>
                            <div className="flex flex-wrap gap-2">
                                {skillGroup.items.map((item, i) => (
                                    <span key={i} className={`px-2 py-1 rounded text-xs md:text-sm font-medium ${isNightMode
                                        ? 'bg-sky-900/50 text-sky-200 border border-sky-700'
                                        : 'bg-sky-100 text-sky-800'
                                        }`}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
