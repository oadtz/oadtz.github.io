import type { GameState } from './GameState';
import type { InputState } from '../hooks/useInput';

export const GRAVITY = 0.0008;
export const FLAP_STRENGTH = -0.33;
export const SCROLL_SPEED = 0.33;
export const AUTO_SCROLL_SPEED = 0.055;
export const MAX_VELOCITY = 0.8;

export const updatePhysics = (state: GameState, input: InputState, deltaTime: number): GameState => {
    const newState = { ...state };

    if (state.status === 'IDLE') {
        if (input.space) {
            newState.status = 'PLAYING';
            return newState;
        }
        const time = Date.now() / 300;
        newState.bird.y = (window.innerHeight / 2) + Math.sin(time) * 10;
        newState.bird.velocity = 0;
        newState.bird.rotation = 0;
        newState.bird.frame = Math.floor(Date.now() / 150) % 4;
        return newState;
    }

    newState.bird.velocity += GRAVITY * deltaTime;
    newState.bird.velocity = Math.min(newState.bird.velocity, MAX_VELOCITY);

    if (state.status === 'PLAYING') {
        // Update direction based on input (toggle behavior)
        if (input.left) {
            newState.scrollDirection = -1;
        } else if (input.right) {
            newState.scrollDirection = 1;
        }
        // Note: We do NOT reset scrollDirection to 1 here, allowing it to persist

        // Check if bird is on ground
        let isOnGround = newState.bird.y >= window.innerHeight - 50;

        // Calculate base movement based on current direction
        // Only auto-scroll if bird is in the air
        let moveSpeed = isOnGround ? 0 : (AUTO_SCROLL_SPEED * deltaTime * newState.scrollDirection);

        // Apply manual boost if keys are held
        if (input.left) {
            moveSpeed -= SCROLL_SPEED * deltaTime;
        } else if (input.right) {
            moveSpeed += SCROLL_SPEED * deltaTime;
        }

        if (input.space) {
            newState.bird.velocity += (FLAP_STRENGTH * 0.05) * deltaTime;
            newState.bird.velocity = Math.max(newState.bird.velocity, FLAP_STRENGTH);
            newState.isFlying = true;
        } else {
            newState.isFlying = false;
        }

        const proposedScroll = newState.worldScroll + moveSpeed;
        let collision = false;
        const birdRect = {
            x: newState.bird.x + 5,
            y: newState.bird.y + 5,
            width: 20,
            height: 20
        };

        for (const pipe of newState.pipes) {
            const pipeScreenX = pipe.x - proposedScroll;
            if (pipeScreenX < birdRect.x + birdRect.width + 100 && pipeScreenX + pipe.width > birdRect.x - 100) {
                if (pipeScreenX < birdRect.x + birdRect.width && pipeScreenX + pipe.width > birdRect.x) {
                    if (birdRect.y < pipe.gapY || birdRect.y + birdRect.height > pipe.gapY + pipe.gapHeight) {
                        collision = true;
                        break;
                    }
                }
            }
        }

        if (!collision) {
            newState.worldScroll = proposedScroll;
            // Loop the world - wrap around when reaching the duplicate Home section
            // 8 sections total: 7 unique + 1 duplicate Home
            // Wrap at 7 sections so the duplicate Home visually transitions to real Home
            const maxScroll = 7 * window.innerWidth;

            // Reset loop flag
            newState.didLoop = false;

            if (newState.worldScroll < 0) {
                // Wrap to section 7 (duplicate Home)
                newState.worldScroll = maxScroll + newState.worldScroll;
                newState.didLoop = true;
            } else if (newState.worldScroll > maxScroll) {
                // Wrap to the start (real Home section)
                newState.worldScroll = newState.worldScroll - maxScroll;
                newState.didLoop = true;
            }
        }
    }

    newState.bird.y += newState.bird.velocity * deltaTime;

    // Re-calculate bird rect for vertical collision
    const birdRect = {
        x: newState.bird.x + 5,
        y: newState.bird.y + 5,
        width: 20,
        height: 20
    };

    for (const pipe of newState.pipes) {
        const pipeScreenX = pipe.x - newState.worldScroll;
        if (pipeScreenX < birdRect.x + birdRect.width && pipeScreenX + pipe.width > birdRect.x) {
            if (birdRect.y < pipe.gapY) {
                newState.bird.y = pipe.gapY - 5;
                newState.bird.velocity = 0.1;
            } else if (birdRect.y + birdRect.height > pipe.gapY + pipe.gapHeight) {
                newState.bird.y = pipe.gapY + pipe.gapHeight - birdRect.height - 5;
                newState.bird.velocity = -0.1;
            }
        }
    }

    const isOnGround = newState.bird.y >= window.innerHeight - 50;
    if (isOnGround) {
        newState.bird.y = window.innerHeight - 50;
        newState.bird.velocity = 0;

        if (state.status === 'PLAYING' && !input.left && !input.right && !input.space) {
            // Stop movement on ground if no keys pressed
        }
    }

    if (newState.bird.y < 0) {
        newState.bird.y = 0;
        newState.bird.velocity = 0;
    }

    if (state.status === 'GAME_OVER') {
        newState.bird.rotation = Math.PI / 2;
        newState.bird.frame = 0;
    } else {
        newState.bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (newState.bird.velocity * 0.1)));
        const flapSpeed = newState.bird.velocity < 0 ? 50 : 150;
        newState.bird.frame = Math.floor(Date.now() / flapSpeed) % 4;
    }

    return newState;
};
