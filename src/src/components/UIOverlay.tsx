import React from 'react';
import type { GameStatus } from '../engine/GameState';

interface UIOverlayProps {
    status: GameStatus;
    onStart: () => void;
    onRestart: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ status, onStart, onRestart }) => {
    // Add Enter key listener
    React.useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (status === 'IDLE') {
                    onStart();
                } else if (status === 'GAME_OVER') {
                    onRestart();
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [status, onStart, onRestart]);

    if (status === 'PLAYING') return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
            <div className="bg-white p-8 rounded-lg border-4 border-black shadow-2xl text-center max-w-md">
                {status === 'IDLE' && (
                    <>
                        <h1 className="text-4xl font-pixel mb-6 text-sky-600">READY?</h1>
                        <div className="space-y-4 mb-8 text-left font-mono text-sm bg-gray-100 p-4 rounded">
                            <p>🎮 <span className="font-bold">Controls:</span></p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-bold">SPACE / ↑</span>: Fly Up</li>
                                <li><span className="font-bold">← / →</span>: Change Direction</li>
                            </ul>
                            <p className="mt-2 text-xs text-gray-500">
                                Navigate through the pipes to explore my portfolio sections!
                            </p>
                        </div>
                        <button
                            onClick={onStart}
                            className="bg-green-500 hover:bg-green-600 text-white font-pixel py-4 px-12 rounded border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all text-xl animate-pulse"
                        >
                            ENTER
                        </button>
                        <p className="mt-4 text-xs text-gray-500 font-mono">Press ENTER or click to start</p>
                    </>
                )}

                {status === 'GAME_OVER' && (
                    <>
                        <h1 className="text-4xl font-pixel mb-6 text-sky-600">CONTACT</h1>
                        <p className="mb-8 font-pixel text-gray-700">Let's work together!</p>
                        <button
                            onClick={onRestart}
                            className="bg-sky-500 hover:bg-sky-600 text-white font-pixel py-4 px-12 rounded border-b-4 border-sky-700 active:border-b-0 active:translate-y-1 transition-all text-xl"
                        >
                            RESTART
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
