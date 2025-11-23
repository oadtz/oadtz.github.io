export class Background {
    static draw(ctx: CanvasRenderingContext2D, scrollX: number, isNightMode: boolean = false) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // Sky Color (Semi-transparent to show HTML content)
        if (isNightMode) {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(10, 10, 42, 0.8)'); // Deep dark blue (semi-transparent)
            gradient.addColorStop(1, 'rgba(26, 26, 74, 0.6)'); // Lighter dark blue
            ctx.fillStyle = gradient;
        } else {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(135, 206, 235, 0.3)'); // Sky Blue with transparency
            gradient.addColorStop(1, 'rgba(224, 246, 255, 0.2)'); // Light Blue with transparency
            ctx.fillStyle = gradient;
        }
        ctx.fillRect(0, 0, width, height);

        // Stars (Night Mode only)
        if (isNightMode) {
            ctx.fillStyle = '#ffffff';
            const starOffset = scrollX * 0.05; // Parallax for stars
            for (let i = 0; i < 50; i++) {
                const x = ((i * 137) % width + starOffset) % width; // Random-ish positions
                const y = (i * 67) % (height / 2);
                const size = (i % 3) + 1;
                ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.001 + i) * 0.5; // Twinkle
                ctx.fillRect(x, y, size, size);
            }
            ctx.globalAlpha = 1.0;
        }

        // Clouds (Parallax)
        const cloudSpeed = 0.2;
        const cloudOffset = scrollX * cloudSpeed;

        ctx.fillStyle = isNightMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)';

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
