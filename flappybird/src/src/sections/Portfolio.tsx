import React from 'react';

interface SectionProps {
    isNightMode?: boolean;
}

const projects = [
    {
        name: "Unilode's ACID",
        role: "Senior Software Engineer",
        url: "https://www.unilode.com/",
        description: "Aviation reporting and operational visibility for Unit Load Device (ULD) management. A practical example of software built close to real logistics workflows."
    },
    {
        name: "Rikai",
        role: "Team Lead",
        url: "https://www.rikai.ch",
        description: "Health-tech delivery work around blood analysis and personalized health insights, connecting complex data with user-facing product experience."
    },
    {
        name: "Enterprise BI",
        role: "Consultant",
        url: "https://www.adastracorp.com/",
        description: "Business intelligence and reporting systems using MicroStrategy, data modeling, and stakeholder-driven delivery across regional teams."
    },
    {
        name: "E-learning Platform",
        role: "Development Lead",
        url: "https://www.linkedin.com/in/thanapatpirmphol/",
        description: "Early full-lifecycle web application leadership: requirements, implementation, team delivery, and practical product building before modern frontend stacks matured."
    }
];

export const Portfolio: React.FC<SectionProps> = ({ isNightMode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen p-4 sm:p-8">
            <div className={`p-4 sm:p-8 rounded-lg border-4 shadow-lg max-w-6xl w-full max-h-[70vh] md:max-h-[80vh] overflow-y-auto transition-colors duration-500 ${isNightMode
                ? 'bg-slate-800/95 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/90 border-black text-black'
                }`}>
                <h2 className={`text-2xl md:text-3xl font-pixel mb-6 md:mb-8 text-center border-b-4 pb-4 ${isNightMode ? 'border-white/50' : 'border-black'}`}>Side Quests</h2>
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
