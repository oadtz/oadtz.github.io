import React from 'react';

interface MobileControlsProps {
    isNightMode?: boolean;
    onToggleNightMode?: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ isNightMode, onToggleNightMode }) => {
    const simulateKey = (code: string, type: 'keydown' | 'keyup') => {
        window.dispatchEvent(new KeyboardEvent(type, { code }));
    };

    const handleTouchStart = (code: string) => (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        simulateKey(code, 'keydown');
    };

    const handleTouchEnd = (code: string) => (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        simulateKey(code, 'keyup');
    };

    return (
        <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2 pointer-events-auto z-40">
            {/* Up Button - centered */}
            <button
                className="w-14 h-14 bg-white/70 hover:bg-white/90 rounded-lg border-2 border-gray-800 active:bg-white backdrop-blur-sm flex items-center justify-center text-2xl select-none shadow-lg"
                onTouchStart={handleTouchStart('ArrowUp')}
                onTouchEnd={handleTouchEnd('ArrowUp')}
                onMouseDown={handleTouchStart('ArrowUp')}
                onMouseUp={handleTouchEnd('ArrowUp')}
                onMouseLeave={handleTouchEnd('ArrowUp')}
                title="Fly Up (↑)"
            >
                ↑
            </button>

            {/* Left and Right Buttons */}
            <div className="flex gap-2">
                <button
                    className="w-14 h-14 bg-white/70 hover:bg-white/90 rounded-lg border-2 border-gray-800 active:bg-white backdrop-blur-sm flex items-center justify-center text-2xl select-none shadow-lg"
                    onTouchStart={handleTouchStart('ArrowLeft')}
                    onTouchEnd={handleTouchEnd('ArrowLeft')}
                    onMouseDown={handleTouchStart('ArrowLeft')}
                    onMouseUp={handleTouchEnd('ArrowLeft')}
                    onMouseLeave={handleTouchEnd('ArrowLeft')}
                    title="Turn Left (←)"
                >
                    ←
                </button>
                <button
                    className="w-14 h-14 bg-white/70 hover:bg-white/90 rounded-lg border-2 border-gray-800 active:bg-white backdrop-blur-sm flex items-center justify-center text-2xl select-none shadow-lg"
                    onTouchStart={handleTouchStart('ArrowRight')}
                    onTouchEnd={handleTouchEnd('ArrowRight')}
                    onMouseDown={handleTouchStart('ArrowRight')}
                    onMouseUp={handleTouchEnd('ArrowRight')}
                    onMouseLeave={handleTouchEnd('ArrowRight')}
                    title="Turn Right (→)"
                >
                    →
                </button>
            </div>

            {/* Night Mode Toggle */}
            <button
                className="w-14 h-14 mt-2 bg-white/70 hover:bg-white/90 rounded-lg border-2 border-gray-800 active:bg-white backdrop-blur-sm flex items-center justify-center text-2xl select-none shadow-lg transition-colors"
                onClick={onToggleNightMode}
                title={isNightMode ? "Switch to Day Mode" : "Switch to Night Mode"}
            >
                {isNightMode ? '☀️' : '🌙'}
            </button>
        </div>
    );
};
