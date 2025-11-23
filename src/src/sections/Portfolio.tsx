import React from 'react';

interface SectionProps {
    isNightMode?: boolean;
}

const projects = [
    {
        name: "Water Ledger",
        role: "CTO",
        url: "https://www.waterledger.com",
        description: "A pioneering platform for water trading and management using blockchain technology. Enabling transparent, secure, and efficient water markets."
    },
    {
        name: "TapIn",
        role: "Creator",
        url: "https://play.google.com/store/apps/details?id=com.waterledger.tapin&hl=en_US&pli=1",
        description: "The ultimate water status tracker. Empowering communities to report and monitor real-time water conditions like leaks and spills on a dynamic live map."
    },
    {
        name: "Unilode's ACID",
        role: "Senior Software Engineer",
        url: "https://www.unilode.com/",
        description: "A specialized aviation reporting system for Unit Load Device (ULD) management. Enhancing visibility, operational workflows, and decision-making for global aviation logistics."
    },
    {
        name: "Rikai",
        role: "Team Lead",
        url: "https://www.rikai.ch",
        description: "An innovative health-tech platform providing personalized blood analysis and health insights. Bridging the gap between medical diagnostics and user-friendly health management."
    }
];

export const Portfolio: React.FC<SectionProps> = ({ isNightMode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen p-4 sm:p-8">
            <div className={`p-4 sm:p-8 rounded-lg border-4 shadow-lg max-w-6xl w-full max-h-[85vh] md:max-h-[80vh] overflow-y-auto transition-colors duration-500 ${isNightMode
                ? 'bg-slate-800/95 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/90 border-black text-black'
                }`}>
                <h2 className={`text-2xl md:text-3xl font-pixel mb-6 md:mb-8 text-center border-b-4 pb-4 ${isNightMode ? 'border-white/50' : 'border-black'}`}>Portfolio Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {projects.map((project, index) => (
                        <a
                            key={index}
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block border-4 p-4 md:p-6 rounded transition-all group flex flex-col h-full ${isNightMode
                                ? 'border-white/30 hover:border-sky-400 hover:bg-slate-700'
                                : 'border-gray-200 hover:border-sky-400 hover:bg-sky-50'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2 md:mb-4">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-1">{project.name}</h3>
                                    <p className={`text-xs md:text-sm font-bold ${isNightMode ? 'text-sky-300' : 'text-sky-700'}`}>{project.role}</p>
                                </div>
                                <div className={`text-xl md:text-2xl transition-transform group-hover:scale-110 ${isNightMode ? 'text-sky-300' : 'text-sky-600'}`}>
                                    ↗
                                </div>
                            </div>

                            <p className={`text-sm md:text-base mb-4 md:mb-6 flex-grow ${isNightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {project.description}
                            </p>

                            <div className="text-sky-500 font-pixel text-xs md:text-sm group-hover:underline">
                                VIEW PROJECT &gt;
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};
