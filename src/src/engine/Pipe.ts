export interface PipeData {
    x: number;
    gapY: number;
    gapHeight: number;
    width: number;
    passed: boolean;
}

export class Pipe {
    static draw(ctx: CanvasRenderingContext2D, pipe: PipeData, scrollX: number, isNightMode: boolean = false) {
        const screenX = pipe.x - scrollX;

        // Don't draw if off screen
        if (screenX + pipe.width < 0 || screenX > ctx.canvas.width) return;

        let pipeColor, pipeDark, pipeLight, pipeHighlight;

        if (isNightMode) {
            pipeColor = '#1a6b1a'; // Darker Green
            pipeDark = '#0d360d'; // Very Dark Green
            pipeLight = '#228B22'; // Normal Green (as highlight)
            pipeHighlight = '#32CD32'; // Light Green (as top highlight)
        } else {
            pipeColor = '#228B22'; // Green
            pipeDark = '#1a6b1a'; // Dark Green
            pipeLight = '#32CD32'; // Light Green
            pipeHighlight = '#90EE90'; // Very Light Green
        }

        // Helper function to draw a pipe segment with 3D effect
        const drawPipeSegment = (x: number, y: number, width: number, height: number) => {
            // Main pipe body with gradient
            const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
            gradient.addColorStop(0, pipeDark);
            gradient.addColorStop(0.3, pipeColor);
            gradient.addColorStop(0.7, pipeColor);
            gradient.addColorStop(1, pipeDark);

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, height);

            // Left highlight
            ctx.fillStyle = pipeLight;
            ctx.fillRect(x, y, 4, height);

            // Right shadow
            ctx.fillStyle = pipeDark;
            ctx.fillRect(x + width - 4, y, 4, height);

            // Vertical stripes for texture
            ctx.strokeStyle = isNightMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < width; i += 8) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i, y + height);
                ctx.stroke();
            }
        };

        // Helper function to draw pipe cap with 3D effect
        const drawPipeCap = (x: number, y: number, width: number, height: number) => {
            // Cap gradient
            const capGradient = ctx.createLinearGradient(x, y, x, y + height);
            capGradient.addColorStop(0, pipeHighlight);
            capGradient.addColorStop(0.5, pipeLight);
            capGradient.addColorStop(1, pipeColor);

            ctx.fillStyle = capGradient;
            ctx.fillRect(x - 4, y, width + 8, height);

            // Top highlight
            ctx.fillStyle = pipeHighlight;
            ctx.fillRect(x - 4, y, width + 8, 3);

            // Bottom shadow
            ctx.fillStyle = pipeDark;
            ctx.fillRect(x - 4, y + height - 3, width + 8, 3);

            // Border
            ctx.strokeStyle = pipeDark;
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 4, y, width + 8, height);
        };

        // Top Pipe
        drawPipeSegment(screenX, 0, pipe.width, pipe.gapY - 25);

        // Top Pipe Cap
        drawPipeCap(screenX, pipe.gapY - 25, pipe.width, 25);

        // Bottom Pipe
        const bottomPipeY = pipe.gapY + pipe.gapHeight;
        const bottomPipeHeight = ctx.canvas.height - bottomPipeY - 25;

        // Bottom Pipe Cap
        drawPipeCap(screenX, bottomPipeY, pipe.width, 25);

        // Bottom Pipe Body
        drawPipeSegment(screenX, bottomPipeY + 25, pipe.width, bottomPipeHeight);
    }
}
