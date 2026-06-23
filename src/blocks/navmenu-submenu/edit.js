import {
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';
import SubmenuAppender from './submenu-appender';
import './editor.scss';

const TEMPLATE = [
	[ 'blockish/navmenu-item', { label: __( 'Submenu Item', 'blockish' ), url: '#' } ],
];

export default function Edit( props ) {
	const { clientId } = props;

	const blockProps = useBlockProps( {
		className: 'blockish-navmenu-submenu',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		orientation: 'vertical',
		renderAppender: () => <SubmenuAppender rootClientId={ clientId } />,
	} );

	return (
		<>
			<Inspector { ...props } />
			<ul { ...innerBlocksProps } />
		</>
	);
}
