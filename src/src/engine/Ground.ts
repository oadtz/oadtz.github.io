import { lerpColor } from '../utils/colorUtils';

export class Ground {
    static draw(ctx: CanvasRenderingContext2D, scrollX: number, nightFactor: number) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const groundHeight = 50;
        const groundY = height - groundHeight;

        // Ground scroll matches world scroll exactly
        const groundOffset = scrollX % 40; // Repeating pattern every 40px

        // Base ground with gradient
        const groundGradient = ctx.createLinearGradient(0, groundY, 0, height);
        
        groundGradient.addColorStop(0, lerpColor('#8B7355', '#4a3c2e', nightFactor));
        groundGradient.addColorStop(0.5, lerpColor('#A0826D', '#5c4b3e', nightFactor));
        groundGradient.addColorStop(1, lerpColor('#6B5344', '#362922', nightFactor));

        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, groundY, width, groundHeight);

        // Grass layer with texture
        const grassHeight = 12;
        const grassGradient = ctx.createLinearGradient(0, groundY, 0, groundY + grassHeight);
        
        grassGradient.addColorStop(0, lerpColor('#7CFC00', '#3d7a00', nightFactor));
        grassGradient.addColorStop(0.5, lerpColor('#90EE90', '#4a7a4a', nightFactor));
        grassGradient.addColorStop(1, lerpColor('#228B22', '#114511', nightFactor));

        ctx.fillStyle = grassGradient;
        ctx.fillRect(0, groundY, width, grassHeight);

        // Grass blades
        ctx.strokeStyle = lerpColor('#228B22', '#114511', nightFactor);
        ctx.lineWidth = 2;
        for (let i = -10; i < width + 10; i += 6) {
            const x = i - (groundOffset * 0.5) % 6;
            const bladeHeight = 4 + Math.sin(i * 0.5) * 2;
            ctx.beginPath();
            ctx.moveTo(x, groundY + grassHeight);
            ctx.lineTo(x, groundY + grassHeight - bladeHeight);
            ctx.stroke();
        }

        // Brick pattern
        const brickWidth = 40;
        const brickHeight = 10;
        const brickY = groundY + grassHeight;

        for (let row = 0; row < Math.ceil((groundHeight - grassHeight) / brickHeight); row++) {
            const y = brickY + row * brickHeight;
            const offset = (row % 2) * (brickWidth / 2);

            for (let col = -1; col < Math.ceil(width / brickWidth) + 1; col++) {
                const x = col * brickWidth + offset - (groundOffset % brickWidth);

                // Brick color variation
                let brickColor, brickDark, brickLight;

                if (row % 2 === 0) {
                    brickColor = lerpColor('#A0826D', '#5c4b3e', nightFactor);
                } else {
                    brickColor = lerpColor('#8B7355', '#4a3c2e', nightFactor);
                }
                
                brickDark = lerpColor('#6B5344', '#362922', nightFactor);
                brickLight = lerpColor('#C9A88A', '#756250', nightFactor);

                // Brick body
                ctx.fillStyle = brickColor;
                ctx.fillRect(x + 1, y + 1, brickWidth - 2, brickHeight - 2);

                // Brick highlight (top-left)
                ctx.fillStyle = brickLight;
                ctx.fillRect(x + 1, y + 1, brickWidth - 2, 2);
                ctx.fillRect(x + 1, y + 1, 2, brickHeight - 2);

                // Brick shadow (bottom-right)
                ctx.fillStyle = brickDark;
                ctx.fillRect(x + 1, y + brickHeight - 3, brickWidth - 2, 2);
                ctx.fillRect(x + brickWidth - 3, y + 1, 2, brickHeight - 2);

                // Mortar (gaps between bricks)
                ctx.strokeStyle = lerpColor('#654321', '#362922', nightFactor);
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, brickWidth, brickHeight);
            }
        }

        // Top border highlight
        ctx.fillStyle = lerpColor('#7CFC00', '#3d7a00', nightFactor);
        ctx.fillRect(0, groundY, width, 2);

        // Bottom shadow
        ctx.fillStyle = lerpColor('rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.5)', nightFactor);
        ctx.fillRect(0, height - 5, width, 5);
    }
}
