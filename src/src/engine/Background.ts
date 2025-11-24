import { lerpColor } from '../utils/colorUtils';

export class Background {
    static draw(ctx: CanvasRenderingContext2D, scrollX: number, nightFactor: number) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // Sky Color (Semi-transparent to show HTML content)
        // Day Colors
        const daySkyTop = 'rgba(135, 206, 235, 0.3)';
        const daySkyBottom = 'rgba(224, 246, 255, 0.2)';
        
        // Night Colors
        const nightSkyTop = 'rgba(10, 10, 42, 0.8)';
        const nightSkyBottom = 'rgba(26, 26, 74, 0.6)';

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, lerpColor(daySkyTop, nightSkyTop, nightFactor));
        gradient.addColorStop(1, lerpColor(daySkyBottom, nightSkyBottom, nightFactor));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Stars (Fade in based on nightFactor)
        if (nightFactor > 0) {
            ctx.fillStyle = '#ffffff';
            const starOffset = scrollX * 0.05; // Parallax for stars
            for (let i = 0; i < 50; i++) {
                const x = ((i * 137) % width + starOffset) % width; // Random-ish positions
                const y = (i * 67) % (height / 2);
                const size = (i % 3) + 1;
                // Base opacity is nightFactor, plus twinkle effect
                const twinkle = 0.5 + Math.sin(Date.now() * 0.001 + i) * 0.5;
                ctx.globalAlpha = nightFactor * twinkle; 
                ctx.fillRect(x, y, size, size);
            }
            ctx.globalAlpha = 1.0;
        }

        // Clouds (Parallax)
        const cloudSpeed = 0.2;
        const cloudOffset = scrollX * cloudSpeed;

        const dayCloudColor = 'rgba(255, 255, 255, 0.8)';
        const nightCloudColor = 'rgba(255, 255, 255, 0.3)';
        ctx.fillStyle = lerpColor(dayCloudColor, nightCloudColor, nightFactor);

        // Draw some simple clouds
        const drawCloud = (x: number, y: number, size: number) => {
            const screenX = (x - cloudOffset) % (width + 200);
            const drawX = screenX < -200 ? screenX + width + 200 : screenX;

            ctx.beginPath();
            ctx.arc(drawX, y, size, 0, Math.PI * 2);
            ctx.arc(drawX + size * 0.8, y - size * 0.5, size * 0.8, 0, Math.PI * 2);
            ctx.arc(drawX + size * 1.5, y, size * 0.9, 0, Math.PI * 2);
            ctx.fill();
        };

        drawCloud(100, 100, 30);
        drawCloud(400, 150, 40);
        drawCloud(800, 80, 35);
        drawCloud(1200, 120, 45);
    }
}
