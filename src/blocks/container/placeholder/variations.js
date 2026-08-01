import { Column100, Column5050, Column333333, Column502525, Column25252525 } from './column-svg';

/** Nested column containers: full width so the section reads open in the editor. */
const childContainer = {
	isVariationPicked: true,
	widthType: {
		Desktop: { label: 'Full', value: '100%' },
	},
};

const variations = [
	{
		name: '100',
		icon: Column100,
		innerBlocks: [
			['blockish/container', { ...childContainer }],
		],
		scope: ['block'],
	},
	{
		name: '50-50',
		icon: Column5050,
		attributes: {
			flexDirection: {
				Mobile: 'column',
			},
			columnGap: {
				Desktop: '10px',
			},
			rowGap: {
				Mobile: '10px',
			},
		},
		innerBlocks: [
			['blockish/container', { ...childContainer }],
			['blockish/container', { ...childContainer }],
		],
		scope: ['block'],
	},
	{
		name: '33-33-33',
		icon: Column333333,
		attributes: {
			flexDirection: {
				Mobile: 'column',
			},
			columnGap: {
				Desktop: '10px',
			},
			rowGap: {
				Mobile: '10px',
			},
		},
		innerBlocks: [
			['blockish/container', { ...childContainer }],
			['blockish/container', { ...childContainer }],
			['blockish/container', { ...childContainer }],
		],
		scope: ['block'],
	},
	{
		name: '50-25-25',
		icon: Column502525,
		attributes: {
			flexWrap: {
				Tablet: 'wrap',
				Mobile: 'wrap',
			},
			flexDirection: {
				Mobile: 'column',
			},
			columnGap: {
				Desktop: '10px',
				Tablet: '10px',
			},
			rowGap: {
				Tablet: '10px',
				Mobile: '10px',
			},
		},
		innerBlocks: [
			['blockish/container', { ...childContainer }],
			['blockish/container', { ...childContainer }],
			['blockish/container', { ...childContainer }],
		],
		scope: ['block'],
	},
	{
		name: '25-25-25-25',
		icon: Column25252525,
		attributes: {
			flexWrap: {
				Tablet: 'wrap',
				Mobile: 'wrap',
			},
			flexDirection: {
				Mobile: 'column',
			},
			columnGap: {
				Desktop: '10px',
				Tablet: '10px',
			},
			rowGap: {
				Tablet: '10px',
				Mobile: '10px',
			},
		},
		innerBlocks: [
			['blockish/container', { ...childContainer }],
			['blockish/container', { ...childContainer }],
			['blockish/container', { ...childContainer }],
			['blockish/container', { ...childContainer }],
		],
		scope: ['block'],
	},
];

export default variations;
