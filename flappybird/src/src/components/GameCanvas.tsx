import React, { useRef, useEffect, useState } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useInput } from '../hooks/useInput';
import { INITIAL_STATE, type GameState } from '../engine/GameState';
import { updatePhysics } from '../engine/Physics';
import { Bird } from '../engine/Bird';
import { Pipe } from '../engine/Pipe';
import { Background } from '../engine/Background';
import { Ground } from '../engine/Ground';
import { LevelGenerator } from '../engine/LevelGenerator';
import { UIOverlay } from './UIOverlay';
import { MobileControls } from './MobileControls';

interface GameCanvasProps {
    width?: number;
    height?: number;
    contentRef?: React.RefObject<HTMLDivElement | null>;
    isNightMode?: boolean;
    onToggleNightMode?: (source?: 'manual' | 'auto') => void;
    themeMode?: 'auto' | 'day' | 'night';
}

const GameCanvas: React.FC<GameCanvasProps> = ({ contentRef, isNightMode, onToggleNightMode, themeMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const gameStateRef = useRef<GameState>({ ...INITIAL_STATE });
    const [gameStatus, setGameStatus] = useState<GameState['status']>('IDLE'); // Sync state for UI
    const input = useInput();

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const isMobile = width < 768;
            const gapWidth = isMobile ? width * 0.25 : 0;

            setDimensions({ width, height: window.innerHeight });
            gameStateRef.current.bird.x = width / 2;

            // Regenerate level only if not playing? For now, just regenerate.
            if (gameStateRef.current.status === 'IDLE') {
                gameStateRef.current.pipes = LevelGenerator.generateLevel(8, width, gapWidth);
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleStart = () => {
        gameStateRef.current.status = 'PLAYING';
        setGameStatus('PLAYING');
    };

    const handleRestart = () => {
        const width = window.innerWidth;
        const isMobile = width < 768;
        const gapWidth = isMobile ? width * 0.25 : 0;

        gameStateRef.current = {
            ...INITIAL_STATE,
            pipes: LevelGenerator.generateLevel(8, window.innerWidth, gapWidth),
            bird: { ...INITIAL_STATE.bird, x: window.innerWidth / 2, y: window.innerHeight / 2 }
        };
        setGameStatus('IDLE');
    };

    const nightFactorRef = useRef(0);

    useGameLoop((deltaTime) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Update Physics
        gameStateRef.current = updatePhysics(gameStateRef.current, input, deltaTime);
        const state = gameStateRef.current;

        // Check for loop and toggle night mode
        if (state.didLoop && onToggleNightMode) {
            onToggleNightMode('auto');
        }

        // Smoothly update nightFactor
        const targetFactor = isNightMode ? 1 : 0;
        const speed = 0.02 * deltaTime; // Adjust speed as needed
        if (nightFactorRef.current < targetFactor) {
            nightFactorRef.current = Math.min(nightFactorRef.current + speed, targetFactor);
        } else if (nightFactorRef.current > targetFactor) {
            nightFactorRef.current = Math.max(nightFactorRef.current - speed, targetFactor);
        }
        const nightFactor = nightFactorRef.current;

        // Sync React state if changed (throttled check could be better, but this is simple)
        if (state.status !== gameStatus) {
            setGameStatus(state.status);
        }

        // Sync DOM content scroll
        if (contentRef?.current) {
            contentRef.current.style.transform = `translateX(${-state.worldScroll}px)`;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Background
        Background.draw(ctx, state.worldScroll, nightFactor);

        // Draw Pipes
        state.pipes.forEach(pipe => {
            Pipe.draw(ctx, pipe, state.worldScroll, nightFactor);
        });

        // Draw Ground
        Ground.draw(ctx, state.worldScroll, nightFactor);

        // Draw Bird
        Bird.draw(ctx, state.bird, state.scrollDirection);
    });

    return (
        <div className="relative w-full h-full">
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="block"
            />
            <UIOverlay
                status={gameStatus}
                onStart={handleStart}
                onRestart={handleRestart}
            />
            {gameStatus === 'PLAYING' && (
                <MobileControls
                    onToggleNightMode={onToggleNightMode}
                    isFlying={input.space}
                    themeMode={themeMode}
                />
            )}
        </div>
    );
};

export default GameCanvas;
