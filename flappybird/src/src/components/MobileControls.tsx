import React from 'react';

interface MobileControlsProps {
    onToggleNightMode?: (source?: 'manual' | 'auto') => void;
    isFlying?: boolean;
    themeMode?: 'auto' | 'day' | 'night';
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onToggleNightMode, isFlying, themeMode = 'auto' }) => {
    const [showHint, setShowHint] = React.useState(true);

    React.useEffect(() => {
        if (isFlying && showHint) {
            setShowHint(false);
        }
    }, [isFlying, showHint]);

    const simulateKey = (code: string, type: 'keydown' | 'keyup') => {
        window.dispatchEvent(new KeyboardEvent(type, { code }));
    };

    const handleInteraction = () => {
        if (showHint) setShowHint(false);
    };

    const handleTouchStart = (code: string) => (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        handleInteraction();
        simulateKey(code, 'keydown');
    };

    const handleTouchEnd = (code: string) => (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        simulateKey(code, 'keyup');
    };

    const getThemeIcon = () => {
        switch (themeMode) {
            case 'day': return '☀️';
            case 'night': return '🌙';
            case 'auto': return '🌓';
            default: return '🌓';
        }
    };

    const getThemeTitle = () => {
        switch (themeMode) {
            case 'auto': return 'Mode: Auto (Tap for Day)';
            case 'day': return 'Mode: Day (Tap for Night)';
            case 'night': return 'Mode: Night (Tap for Auto)';
            default: return 'Mode: Auto';
        }
    };

    return (
        <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2 pointer-events-auto z-40">
            {/* Up Button - centered */}
            <div className="relative">
                {showHint && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap animate-bounce">
                        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded font-pixel">
                            Tap to Fly!
                        </div>
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/80 mx-auto"></div>
                    </div>
                )}
                <button
                    className={`w-14 h-14 bg-white/70 hover:bg-white/90 rounded-lg border-2 border-gray-800 active:bg-white backdrop-blur-sm flex items-center justify-center text-2xl select-none shadow-lg ${showHint ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}
                    style={{ touchAction: 'none' }}
                    onTouchStart={handleTouchStart('ArrowUp')}
                    onTouchEnd={handleTouchEnd('ArrowUp')}
                    onTouchCancel={handleTouchEnd('ArrowUp')}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={handleTouchStart('ArrowUp')}
                    onMouseUp={handleTouchEnd('ArrowUp')}
                    onMouseLeave={handleTouchEnd('ArrowUp')}
                    title="Fly Up (↑)"
                >
                    ↑
                </button>
            </div>

            {/* Left and Right Buttons */}
            <div className="flex gap-2">
                <button
                    className="w-14 h-14 bg-white/70 hover:bg-white/90 rounded-lg border-2 border-gray-800 active:bg-white backdrop-blur-sm flex items-center justify-center text-2xl select-none shadow-lg"
                    style={{ touchAction: 'none' }}
                    onTouchStart={handleTouchStart('ArrowLeft')}
                    onTouchEnd={handleTouchEnd('ArrowLeft')}
                    onTouchCancel={handleTouchEnd('ArrowLeft')}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={handleTouchStart('ArrowLeft')}
                    onMouseUp={handleTouchEnd('ArrowLeft')}
                    onMouseLeave={handleTouchEnd('ArrowLeft')}
                    title="Turn Left (←)"
                >
                    ←
                </button>
                <button
                    className="w-14 h-14 bg-white/70 hover:bg-white/90 rounded-lg border-2 border-gray-800 active:bg-white backdrop-blur-sm flex items-center justify-center text-2xl select-none shadow-lg"
                    style={{ touchAction: 'none' }}
                    onTouchStart={handleTouchStart('ArrowRight')}
                    onTouchEnd={handleTouchEnd('ArrowRight')}
                    onTouchCancel={handleTouchEnd('ArrowRight')}
                    onContextMenu={(e) => e.preventDefault()}
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
                onClick={() => onToggleNightMode?.('manual')}
                title={getThemeTitle()}
            >
                {getThemeIcon()}
            </button>
        </div>
    );
};
