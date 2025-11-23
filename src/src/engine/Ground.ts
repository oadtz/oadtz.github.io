export class Ground {
    static draw(ctx: CanvasRenderingContext2D, scrollX: number, isNightMode: boolean = false) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const groundHeight = 50;
        const groundY = height - groundHeight;

        // Ground scroll matches world scroll exactly
        const groundOffset = scrollX % 40; // Repeating pattern every 40px

        // Base ground with gradient
        const groundGradient = ctx.createLinearGradient(0, groundY, 0, height);
        if (isNightMode) {
            groundGradient.addColorStop(0, '#4a3c2e'); // Darker medium brown
            groundGradient.addColorStop(0.5, '#5c4b3e'); // Darker light brown
            groundGradient.addColorStop(1, '#362922'); // Darker dark brown
        } else {
            groundGradient.addColorStop(0, '#8B7355'); // Medium brown
            groundGradient.addColorStop(0.5, '#A0826D'); // Light brown
            groundGradient.addColorStop(1, '#6B5344'); // Dark brown
        }

        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, groundY, width, groundHeight);

        // Grass layer with texture
        const grassHeight = 12;
        const grassGradient = ctx.createLinearGradient(0, groundY, 0, groundY + grassHeight);
        if (isNightMode) {
            grassGradient.addColorStop(0, '#3d7a00'); // Darker bright green
            grassGradient.addColorStop(0.5, '#4a7a4a'); // Darker light green
            grassGradient.addColorStop(1, '#114511'); // Darker forest green
        } else {
            grassGradient.addColorStop(0, '#7CFC00'); // Bright green
            grassGradient.addColorStop(0.5, '#90EE90'); // Light green
            grassGradient.addColorStop(1, '#228B22'); // Forest green
        }

        ctx.fillStyle = grassGradient;
        ctx.fillRect(0, groundY, width, grassHeight);

        // Grass blades
        ctx.strokeStyle = isNightMode ? '#114511' : '#228B22';
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

                if (isNightMode) {
                    brickColor = row % 2 === 0 ? '#5c4b3e' : '#4a3c2e';
                    brickDark = '#362922';
                    brickLight = '#756250';
                } else {
                    brickColor = row % 2 === 0 ? '#A0826D' : '#8B7355';
                    brickDark = '#6B5344';
                    brickLight = '#C9A88A';
                }

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
                ctx.strokeStyle = isNightMode ? '#362922' : '#654321';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, brickWidth, brickHeight);
            }
        }

        // Top border highlight
        ctx.fillStyle = isNightMode ? '#3d7a00' : '#7CFC00';
        ctx.fillRect(0, groundY, width, 2);

        // Bottom shadow
        ctx.fillStyle = isNightMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)'; // Darker shadow for night
        ctx.fillRect(0, height - 5, width, 5);
    }
}
