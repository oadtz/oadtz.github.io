import React, { useEffect, useState } from 'react';

export const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 500); // Small delay before unmounting
                    return 100;
                }
                return prev + 5; // Simulate loading
            });
        }, 50);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-sky-300 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-yellow-400 mb-8 animate-bounce rounded-sm border-4 border-black relative">
                <div className="absolute top-2 right-2 w-4 h-4 bg-white border-2 border-black rounded-full"></div>
                <div className="absolute top-8 right-[-8px] w-6 h-4 bg-orange-500 border-2 border-black rounded-r-md"></div>
                <div className="absolute top-6 left-[-10px] w-8 h-6 bg-white border-2 border-black rounded-full opacity-50 -z-10"></div>
            </div>

            <h1 className="font-pixel text-4xl text-white mb-4 drop-shadow-md">LOADING...</h1>

            <div className="w-64 h-8 bg-black/20 rounded-full border-4 border-white overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <p className="mt-4 font-pixel text-white text-sm">{progress}%</p>
        </div>
    );
};
