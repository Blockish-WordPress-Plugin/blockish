import { createBlock } from '@wordpress/blocks';
const BLOCK_NAME = 'blockish/container';
const transforms = {
    from: [
        {
            type: 'block',
            isMultiBlock: true,
            blocks: ['*'],
            __experimentalConvert(blocks) {
                const conatinerInnerBlocks = blocks.map((block) => {
                    function getInnerBlocks(innerBlocks) {
                        if (innerBlocks) {
                            return innerBlocks.map((innerBlock) => createBlock(innerBlock.name, innerBlock.attributes, getInnerBlocks(innerBlock.innerBlocks)));
                        }
                        return [];
                    }
                    
                    return createBlock(
                        block.name,
                        block.attributes,
                        getInnerBlocks(block.innerBlocks)
                    );
                });

                return createBlock(
                    BLOCK_NAME,
                    {
                        isVariationPicked: true
                    },
                    conatinerInnerBlocks
                );
            },
        },
    ],
    ungroup: ( attributes, innerBlocks ) => innerBlocks,
    to: [
		{
			type: 'block',
			isMultiBlock: true,
			blocks: [ BLOCK_NAME, ],
			__experimentalConvert(blocks) {
                const conatinerInnerBlocks = blocks.map((block) => {
                    function getInnerBlocks(innerBlocks) {
                        if (innerBlocks) {
                            return innerBlocks.map((innerBlock) => createBlock(innerBlock.name, innerBlock.attributes, getInnerBlocks(innerBlock.innerBlocks)));
                        }
                        return [];
                    }
                    
                    return createBlock(
                        block.name,
                        block.attributes,
                        getInnerBlocks(block.innerBlocks)
                    );
                });

                return createBlock(
                    BLOCK_NAME,
                    {
                        isVariationPicked: true
                    },
                    conatinerInnerBlocks
                );
            },
		},
	],
};


export default transforms;