import React, { useEffect, useRef, useState } from 'react';
import { Bird } from '../engine/Bird';
import type { BirdState } from '../engine/GameState';

export const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Bird animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const startTime = Date.now();

        const render = () => {
            const elapsed = Date.now() - startTime;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Mock bird state for animation
            const mockBird: BirdState = {
                x: canvas.width / 2,
                y: canvas.height / 2,
                velocity: 0,
                rotation: 0,
                frame: Math.floor(elapsed / 100) % 4 // Cycle frames every 100ms
            };

            // Draw bird
            // Scale up slightly for visibility on loading screen
            ctx.save();
            ctx.translate(mockBird.x, mockBird.y);
            ctx.scale(2, 2); // 2x scale
            ctx.translate(-mockBird.x, -mockBird.y);
            
            // Add a bounce effect
            const bounceY = Math.sin(elapsed / 200) * 10;
            mockBird.y += bounceY;

            Bird.draw(ctx, mockBird, 1);
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Loading progress simulation
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
            <div className="mb-8 relative">
                <canvas 
                    ref={canvasRef} 
                    width={200} 
                    height={200}
                    className="animate-bounce"
                />
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
