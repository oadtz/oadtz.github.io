import React from 'react';

interface SectionProps {
    isNightMode?: boolean;
}

export const Experience: React.FC<SectionProps> = ({ isNightMode }) => {
    const experiences = [
        {
            role: "Lead Software Engineer",
            company: "4-ti Co. Ltd.",
            period: "Oct 2020 – Feb 2022",
            description: "Led delivery teams and kept architecture close to implementation. Strengthened code quality, delivery cadence, and system-level technical decisions."
        },
        {
            role: "Senior Manager - Business Transformation & IS",
            company: "Aetna, a CVS Health Company",
            period: "Jun 2020 - Oct 2020",
            description: "Worked at the business and information-systems layer, connecting operational workflows with practical technology execution."
        },
        {
            role: "IT Business Consultant",
            company: "Adastra Thailand",
            period: "Jan 2019 - Jun 2020",
            description: "Led APAC and EU delivery for React projects and BI work. Designed reporting and data solutions with MicroStrategy for decision support."
        },
        {
            role: "Senior Software Engineer",
            company: "Unilode Aviation Solutions",
            period: "2011 - 2018",
            description: "Built aviation operations software, reporting systems, data models, and performance-tuned application workflows for global logistics needs."
        },
        {
            role: "Application Analyst",
            company: "ExxonMobil",
            period: "2010 - 2011",
            description: "Supported APAC application stability, upgrade planning, and production operations in an enterprise environment where reliability mattered."
        },
        {
            role: "Development Lead",
            company: "Softscape Inc",
            period: "2005 - 2010",
            description: "Led offshore development, coordinated with analysts, project managers, and QA, and built delivery habits that still shape how I run engineering work."
        },
        {
            role: "Development Lead",
            company: "Progress Information Co., Ltd.",
            period: "2002 - 2005",
            description: "Built and led development for an e-learning web application, covering full lifecycle delivery from requirements through implementation."
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen p-4 sm:p-8">
            <div className={`p-4 sm:p-8 rounded-lg border-4 shadow-lg max-w-4xl w-full max-h-[70vh] md:max-h-[80vh] overflow-y-auto transition-colors duration-500 ${isNightMode
                ? 'bg-slate-800/95 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/90 border-black text-black'
                }`}>
                <h2 className={`text-2xl md:text-3xl font-pixel mb-6 md:mb-8 text-center border-b-4 pb-4 sticky top-0 ${isNightMode ? 'bg-slate-800 border-white/50' : 'bg-white border-black'} z-10`}>Earlier Systems</h2>
                <div className="grid gap-4 md:gap-6">
                    {experiences.map((exp, index) => (
                        <div key={index} className={`border-l-4 pl-4 ${isNightMode ? 'border-white/50' : 'border-black'}`}>
                            <h3 className="text-lg md:text-xl font-bold font-pixel">{exp.role}</h3>
                            <p className={`font-bold text-sm md:text-base ${isNightMode ? 'text-blue-300' : 'text-blue-800'}`}>{exp.company}</p>
                            <p className={`text-xs md:text-sm mb-2 ${isNightMode ? 'text-gray-400' : 'text-gray-600'}`}>{exp.period}</p>
                            <p className="font-sans text-sm md:text-base">{exp.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
