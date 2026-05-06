import type { BirdState } from './GameState';

export class Bird {
    static draw(ctx: CanvasRenderingContext2D, bird: BirdState, direction: 1 | -1) {
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.rotation * direction); // Rotate based on direction too? No, rotation is pitch.
        ctx.scale(direction, 1); // Flip horizontally based on direction

        // Placeholder Bird (Yellow Box)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-15, -15, 30, 30);

        // Eye
        ctx.fillStyle = 'white';
        ctx.fillRect(5, -10, 10, 10);
        ctx.fillStyle = 'black';
        ctx.fillRect(10, -8, 4, 4);

        // Beak
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(10, 0, 10, 8);

        // Wing (Animated)
        ctx.fillStyle = '#F0E68C';
        const wingOffset = [0, -5, 0, 5][bird.frame] || 0;
        ctx.fillRect(-10, 5 + wingOffset, 15, 10);

        ctx.restore();
    }
}
