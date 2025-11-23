import { useEffect, useState } from 'react';

export interface InputState {
    space: boolean;
    left: boolean;
    right: boolean;
}

export const useInput = () => {
    const [input, setInput] = useState<InputState>({
        space: false,
        left: false,
        right: false,
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault(); // Prevent scrolling
                setInput((prev) => ({ ...prev, space: true }));
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                setInput((prev) => ({ ...prev, left: true }));
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                setInput((prev) => ({ ...prev, right: true }));
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                setInput((prev) => ({ ...prev, space: false }));
            } else if (e.code === 'ArrowLeft') {
                setInput((prev) => ({ ...prev, left: false }));
            } else if (e.code === 'ArrowRight') {
                setInput((prev) => ({ ...prev, right: false }));
            }
        };

        // Touch support
        const handleTouchStart = () => {
            // Simple touch implementation: any touch is like space
            // For more complex controls, we'd need overlay buttons
            setInput((prev) => ({ ...prev, space: true }));
        };

        const handleTouchEnd = () => {
            setInput((prev) => ({ ...prev, space: false }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return input;
};
