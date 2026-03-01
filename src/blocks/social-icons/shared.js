export const SHAPE_OPTIONS = [ 'square', 'rounded', 'circle' ];
export const COLOR_MODES = [ 'official', 'custom' ];

export const getValidShape = ( shape ) =>
	SHAPE_OPTIONS.includes( shape ) ? shape : 'circle';

export const getValidColorMode = ( colorMode ) =>
	COLOR_MODES.includes( colorMode ) ? colorMode : 'official';
