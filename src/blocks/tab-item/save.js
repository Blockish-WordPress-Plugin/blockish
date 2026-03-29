import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import clsx from 'clsx';

export default function Save({ attributes }) {
	const iconViewBox = Array.isArray(attributes?.tabIcon?.viewBox)
		? attributes.tabIcon.viewBox.join(' ')
		: '';

	const blockProps = useBlockProps.save({
		className: clsx('blockish-block-tab-item'),
		'data-title': attributes?.title || '',
		'data-icon-path': attributes?.tabIcon?.path || '',
		'data-icon-viewbox': iconViewBox,
		'data-default-active': attributes?.defaultActive ? 'true' : 'false',
		role: 'tabpanel',
	});

	const innerBlocksProps = useInnerBlocksProps.save(blockProps);

	return <div {...innerBlocksProps} />;
}
