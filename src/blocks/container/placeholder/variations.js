import { Column100, Column5050, Column333333, Column502525, Column25252525, Column2575, Column157015, Column8020, Column20202020, Column33333333, Column2525_2525, Column505010, Column80208020, Column80202080, Column20808020 } from './column-svg';

const variations = [
    {
        name: '100',
        icon: Column100,
        innerBlocks: [
            ['gutenkit/container', { containerWidth: 'alignfull', variationSeleted: true }]
        ],
        scope: ['block'],
    },
    {
        name: '50-50',
        icon: Column5050,
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 50, unit: "%"}, customWidthTablet: {size: 50, unit: "%"}, customWidthMobile: {size: 50, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 50, unit: "%"}, customWidthTablet: {size: 50, unit: "%"}, customWidthMobile: {size: 50, unit: "%"}, variationSeleted: true },
            ]
        ],
        scope: ['block'],
    },
    {
        name: '33-33-33',
        icon: Column333333,
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 33, unit: "%"}, customWidthTablet: {size: 33, unit: "%"}, customWidthMobile: {size: 33, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 33, unit: "%"}, customWidthTablet: {size: 33, unit: "%"}, customWidthMobile: {size: 33, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 33, unit: "%"}, customWidthTablet: {size: 33, unit: "%"}, customWidthMobile: {size: 33, unit: "%"}, variationSeleted: true },
            ],
        ],
        scope: ['block'],
    },
    {
        name: '50-25-25',
        icon: Column502525,
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 50, unit: "%"}, customWidthTablet: {size: 50, unit: "%"}, customWidthMobile: {size: 50, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ]
        ],
        scope: ['block'],
    },
    {
        name: '25-25-25-25',
        icon: Column25252525,
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size:25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ]
        ],
        scope: ['block'],
    },
    {
        name: '25-75',
        icon: Column2575,
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 75, unit: "%"}, customWidthTablet: {size: 75, unit: "%"}, customWidthMobile: {size: 75, unit: "%"}, variationSeleted: true },
            ],
        ],
        scope: ['block'],
    },
	{
        name: '15-70-15',
        icon: Column157015,
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 15, unit: "%"}, customWidthTablet: {size: 15, unit: "%"}, customWidthMobile: {size: 15, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 70, unit: "%"}, customWidthTablet: {size: 70, unit: "%"}, customWidthMobile: {size: 70, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 15, unit: "%"}, customWidthTablet: {size: 15, unit: "%"}, customWidthMobile: {size: 15, unit: "%"}, variationSeleted: true },
            ]
        ],
        scope: ['block'],
    },
	{
        name: '80-20',
        icon: Column8020,
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 80, unit: "%"}, customWidthTablet: {size: 80, unit: "%"}, customWidthMobile: {size: 80, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 20, unit: "%"}, customWidthTablet: {size: 20, unit: "%"}, customWidthMobile: {size: 20, unit: "%"}, variationSeleted: true },
            ]
        ],
        scope: ['block'],
    },
	{
        name: '20-20-20-20',
        icon: Column20202020,
		attributes: {
			directionDesktop: 'row',
			wrapDesktop: 'wrap',
			wrapMobile: 'wrap',
		},
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 50, unit: "%"}, customWidthTablet: {size: 50, unit: "%"}, customWidthMobile: {size: 50, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 50, unit: "%"}, customWidthTablet: {size: 50, unit: "%"}, customWidthMobile: {size: 50, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 50, unit: "%"}, customWidthTablet: {size: 50, unit: "%"}, customWidthMobile: {size: 50, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 50, unit: "%"}, customWidthTablet: {size: 50, unit: "%"}, customWidthMobile: {size: 50, unit: "%"}, variationSeleted: true },
            ]
        ],
        scope: ['block'],
    },
	{
        name: '33-33-33-33',
        icon: Column33333333,
		attributes: {
			directionDesktop: 'row',
			wrapDesktop: 'wrap',
			wrapMobile: 'wrap',
		},
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 33, unit: "%"}, customWidthTablet: {size: 33, unit: "%"}, customWidthMobile: {size: 33, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 33, unit: "%"}, customWidthTablet: {size: 33, unit: "%"}, customWidthMobile: {size: 33, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 33, unit: "%"}, customWidthTablet: {size: 33, unit: "%"}, customWidthMobile: {size: 33, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 33, unit: "%"}, customWidthTablet: {size: 33, unit: "%"}, customWidthMobile: {size: 33, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 33, unit: "%"}, customWidthTablet: {size: 33, unit: "%"}, customWidthMobile: {size: 33, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 33, unit: "%"}, customWidthTablet: {size: 33, unit: "%"}, customWidthMobile: {size: 33, unit: "%"}, variationSeleted: true },
            ],
        ],
        scope: ['block'],
    },
	{
        name: '25-25 25-25',
        icon: Column2525_2525,
		attributes: {
			directionDesktop: 'row',
			wrapDesktop: 'wrap',
			wrapMobile: 'wrap',
		},
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 25, unit: "%"}, customWidthTablet: {size: 25, unit: "%"}, customWidthMobile: {size: 25, unit: "%"}, variationSeleted: true },
            ],
        ],
        scope: ['block'],
    },
	{
        name: '505010',
        icon: Column505010,
		attributes: {
			directionDesktop: 'row',
			wrapDesktop: 'wrap',
			wrapMobile: 'wrap',
		},
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 50, unit: "%"}, customWidthTablet: {size: 50, unit: "%"}, customWidthMobile: {size: 50, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 50, unit: "%"}, customWidthTablet: {size: 50, unit: "%"}, customWidthMobile: {size: 50, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 100, unit: "%"}, customWidthTablet: {size: 100, unit: "%"}, customWidthMobile: {size: 100, unit: "%"}, variationSeleted: true },
            ],
        ],
        scope: ['block'],
    },
	{
        name: '80208020',
        icon: Column80208020,
		attributes: {
			directionDesktop: 'row',
			wrapDesktop: 'wrap',
			wrapMobile: 'wrap',
		},
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 80, unit: "%"}, customWidthTablet: {size: 80, unit: "%"}, customWidthMobile: {size: 80, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 20, unit: "%"}, customWidthTablet: {size: 20, unit: "%"}, customWidthMobile: {size: 20, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 80, unit: "%"}, customWidthTablet: {size: 80, unit: "%"}, customWidthMobile: {size: 80, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 20, unit: "%"}, customWidthTablet: {size: 20, unit: "%"}, customWidthMobile: {size: 20, unit: "%"}, variationSeleted: true },
            ]
        ],
        scope: ['block'],
    },
	{
        name: '80202080',
        icon: Column80202080,
		attributes: {
			directionDesktop: 'row',
			wrapDesktop: 'wrap',
			wrapMobile: 'wrap',
		},
        innerBlocks: [
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 80, unit: "%"}, customWidthTablet: {size: 80, unit: "%"}, customWidthMobile: {size: 80, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 20, unit: "%"}, customWidthTablet: {size: 20, unit: "%"}, customWidthMobile: {size: 20, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 20, unit: "%"}, customWidthTablet: {size: 20, unit: "%"}, customWidthMobile: {size: 20, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 80, unit: "%"}, customWidthTablet: {size: 80, unit: "%"}, customWidthMobile: {size: 80, unit: "%"}, variationSeleted: true },
            ],
        ],
        scope: ['block'],
    },
	{
        name: '20808020',
        icon: Column20808020,
		attributes: {
			directionDesktop: 'row',
			wrapDesktop: 'wrap',
			wrapMobile: 'wrap',
		},
        innerBlocks: [
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 20, unit: "%"}, customWidthTablet: {size: 20, unit: "%"}, customWidthMobile: {size: 20, unit: "%"}, variationSeleted: true },
            ],
            [
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 80, unit: "%"}, customWidthTablet: {size: 80, unit: "%"}, customWidthMobile: {size: 80, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 80, unit: "%"}, customWidthTablet: {size: 80, unit: "%"}, customWidthMobile: {size: 80, unit: "%"}, variationSeleted: true },
            ],
			[
                'gutenkit/container',
                { containerWidth: 'gkit-block-custom-wide', customWidthDesktop: {size: 20, unit: "%"}, customWidthTablet: {size: 20, unit: "%"}, customWidthMobile: {size: 20, unit: "%"}, variationSeleted: true },
            ],
        ],
        scope: ['block'],
    },
];
export default variations;

