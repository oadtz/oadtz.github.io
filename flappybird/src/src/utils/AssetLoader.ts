export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

export const loadAssets = async (assets: Record<string, string>) => {
    const loadedAssets: Record<string, HTMLImageElement> = {};
    const promises = Object.entries(assets).map(async ([key, src]) => {
        loadedAssets[key] = await loadImage(src);
    });
    await Promise.all(promises);
    return loadedAssets;
};
