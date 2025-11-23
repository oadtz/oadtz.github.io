import React from 'react';

interface SectionProps {
    isNightMode?: boolean;
}

export const Experience: React.FC<SectionProps> = ({ isNightMode }) => {
    const experiences = [
        {
            role: "Chief Technology Officer",
            company: "Water Ledger Global",
            period: "Jul 2024 – Present",
            description: "Spearheading the technical vision and delivering enterprise-grade blockchain solutions for water trading. Orchestrating the development of secure, scalable distributed ledger platforms to drive environmental sustainability and operational efficiency."
        },
        {
            role: "Senior Software/Blockchain Engineer",
            company: "Civic Ledger",
            period: "Mar 2022 – Dec 2024",
            description: "Architected and implemented critical blockchain infrastructure. Led the engineering of secure digital systems, ensuring high performance and regulatory compliance for public sector applications."
        },
        {
            role: "Lead Software Engineer",
            company: "4-ti Co. Ltd.",
            period: "Oct 2020 – Feb 2022",
            description: "Directed software engineering teams to deliver complex projects. Established best practices in code quality, CI/CD pipelines, and system architecture, significantly improving delivery velocity."
        },
        {
            role: "Senior Manager - Business Transformation & IS",
            company: "Aetna, a CVS Health Company",
            period: "Jun 2020 - Oct 2020",
            description: "Steered business transformation initiatives by aligning information systems with strategic goals. Optimized operational workflows and oversaw large-scale IT integration projects."
        },
        {
            role: "IT Business Consultant",
            company: "Adastra Thailand",
            period: "Jan 2019 - Jun 2020",
            description: "Led the APAC & EU development teams for high-stakes React.JS projects. Designed and implemented robust BI solutions using MicroStrategy to drive data-driven decision making."
        },
        {
            role: "Senior Software Engineer",
            company: "Unilode Aviation Solutions",
            period: "2011 - 2018",
            description: "Designed comprehensive software solutions and data models. Evaluated and selected optimal programming languages and frameworks. Led coding implementation and conducted performance monitoring and tuning."
        },
        {
            role: "Application Analyst",
            company: "ExxonMobil",
            period: "2010 - 2011",
            description: "Planned, assessed, and executed upgrades for ExxonMobil applications. Provided critical application support for the APAC region, ensuring system stability and availability."
        },
        {
            role: "Development Lead",
            company: "Softscape Inc",
            period: "2005 - 2010",
            description: "Led the offshore development team, collaborating closely with Business Analysts, Project Managers, and QA teams to deliver high-quality software solutions."
        },
        {
            role: "Development Lead",
            company: "Progress Information Co., Ltd.",
            period: "2002 - 2005",
            description: "Led the development team in building a comprehensive E-learning web application, overseeing the full software development lifecycle."
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen p-4 sm:p-8">
            <div className={`p-4 sm:p-8 rounded-lg border-4 shadow-lg max-w-4xl w-full max-h-[85vh] md:max-h-[80vh] overflow-y-auto transition-colors duration-500 ${isNightMode
                ? 'bg-slate-800/95 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/90 border-black text-black'
                }`}>
                <h2 className={`text-2xl md:text-3xl font-pixel mb-6 md:mb-8 text-center border-b-4 pb-4 sticky top-0 ${isNightMode ? 'bg-slate-800 border-white/50' : 'bg-white border-black'} z-10`}>Experience</h2>
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
