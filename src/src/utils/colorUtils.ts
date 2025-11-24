/**
 * Interpolates between two colors.
 * @param color1 Start color (Hex or RGBA string)
 * @param color2 End color (Hex or RGBA string)
 * @param factor Interpolation factor (0 to 1)
 * @returns Interpolated color string
 */
export const lerpColor = (color1: string, color2: string, factor: number): string => {
    const c1 = parseColor(color1);
    const c2 = parseColor(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    const a = c1.a + (c2.a - c1.a) * factor;

    return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const parseColor = (color: string): { r: number, g: number, b: number, a: number } => {
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return { r, g, b, a: 1 };
    } else if (color.startsWith('rgba')) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3]),
                a: match[4] ? parseFloat(match[4]) : 1
            };
        }
    }
    // Default fallback
    return { r: 0, g: 0, b: 0, a: 1 };
};
