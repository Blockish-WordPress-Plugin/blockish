import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import clsx from 'clsx';

export default function Save({ attributes }) {
	const directionClass = `is-direction-${attributes?.direction?.Desktop || 'column'}`;
	const blockProps = useBlockProps.save({
		className: clsx('blockish-block-tab'),
		'data-default-tab': attributes?.defaultActiveTab || 0,
	});

	const innerBlocksProps = useInnerBlocksProps.save({
		className: 'blockish-block-tab-items',
	});

	return (
		<div {...blockProps}>
			<div className={clsx('blockish-block-tab-layout', directionClass)}>
				<div
					className="blockish-block-tab-nav"
					role="tablist"
					aria-label="Tabs"
				/>
				<div {...innerBlocksProps} />
			</div>
		</div>
	);
}
