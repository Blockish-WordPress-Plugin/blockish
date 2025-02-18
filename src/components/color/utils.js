import { useMemo } from '@wordpress/element';
import { _x } from '@wordpress/i18n';

export function useColorsPerOrigin(settings) {
    const customColors = settings?.color?.palette?.custom;
    const themeColors = settings?.color?.palette?.theme;
    const defaultColors = settings?.color?.palette?.default;
    const shouldDisplayDefaultColors = settings?.color?.defaultPalette;

    return useMemo(() => {
        let result = []
        if (themeColors && themeColors.length) {
            result = [...result, ...themeColors];
        }
        if (
            shouldDisplayDefaultColors &&
            defaultColors &&
            defaultColors.length
        ) {
            result = [...result, ...defaultColors];
        }
        if (customColors && customColors.length) {
            result = [...result, ...customColors];
        }

        return result;
    }, [
        customColors,
        themeColors,
        defaultColors,
        shouldDisplayDefaultColors,
    ]);
}

export function useGradientsPerOrigin(settings) {
    const customGradients = settings?.color?.gradients?.custom;
    const themeGradients = settings?.color?.gradients?.theme;
    const defaultGradients = settings?.color?.gradients?.default;
    const shouldDisplayDefaultGradients = settings?.color?.defaultGradients;

    return useMemo(() => {
        let result = [];
        if (themeGradients && themeGradients.length) {
            result = [...result, ...themeGradients];
        }
        if (
            shouldDisplayDefaultGradients &&
            defaultGradients &&
            defaultGradients.length
        ) {
            result = [...result, ...defaultGradients];
        }
        if (customGradients && customGradients.length) {
            result = [...result, ...customGradients];
        }

        return result;
    }, [
        customGradients,
        themeGradients,
        defaultGradients,
        shouldDisplayDefaultGradients,
    ]);
}

export const getColorValue = (value) => {
    if (value && typeof value === 'string' && value.includes('|')) {
        let splitValue = value.split('|');
        let color = splitValue[1];

        return color;
    }

    return value;
};

export const createColorValue = (colors = [], value, property = 'color') => {
    let colorObject = colors.find(color => color[property] === value);
    if (colorObject) {
        return `--wp--preset--${property}--${colorObject?.slug}|${colorObject[property]}`;
    }

    return value;
}