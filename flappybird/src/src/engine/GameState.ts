import type { PipeData } from './Pipe';

export interface BirdState {
    x: number;
    y: number;
    velocity: number;
    rotation: number;
    frame: number; // 0, 1, 2, 3
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'GAME_OVER';

export interface GameState {
    bird: BirdState;
    worldScroll: number;
    isFlying: boolean;
    scrollDirection: 1 | -1;
    pipes: PipeData[];
    status: GameStatus;
    didLoop?: boolean;
}

export const INITIAL_STATE: GameState = {
    bird: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        velocity: 0,
        rotation: 0,
        frame: 0,
    },
    worldScroll: 0,
    isFlying: false,
    scrollDirection: 1,
    pipes: [],
    status: 'IDLE',
    didLoop: false,
};
