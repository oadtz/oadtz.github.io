import type { PipeData } from './Pipe';

export class LevelGenerator {
    static generateLevel(sectionCount: number, sectionWidth: number, gapWidth: number = 0): PipeData[] {
        const pipes: PipeData[] = [];
        const pipeWidth = 60;
        const gapHeight = 200; // Generous gap
        const minGapY = 100;
        const maxGapY = window.innerHeight - 100 - gapHeight;

        // Generate pipes between sections
        for (let i = 1; i < sectionCount; i++) {
            // Calculate position: sum of previous sections + sum of previous gaps + half of current gap - half pipe width
            // i sections before this gap (0 to i-1)
            // i-1 gaps before this gap
            // center of current gap = (i * sectionWidth) + ((i - 1) * gapWidth) + (gapWidth / 2)
            // simplified: i * sectionWidth + (i - 0.5) * gapWidth

            const x = (i * sectionWidth) + ((i - 0.5) * gapWidth) - (pipeWidth / 2);

            // Randomize gap position
            const gapY = Math.floor(Math.random() * (maxGapY - minGapY + 1)) + minGapY;

            pipes.push({
                x,
                gapY,
                gapHeight,
                width: pipeWidth,
                passed: false
            });
        }

        return pipes;
    }
}
