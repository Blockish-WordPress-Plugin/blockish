import {
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import './editor.scss';

const TEMPLATE = [
	[ 'blockish/navmenu-item', { label: __( 'Home', 'blockish' ), url: '#' } ],
	[ 'blockish/navmenu-item', { label: __( 'About', 'blockish' ), url: '#' } ],
	[ 'blockish/navmenu-item', { label: __( 'Contact', 'blockish' ), url: '#' } ],
];

export default function Edit( props ) {
	const { attributes, clientId, advancedControls } = props;

	const blockProps = useBlockProps( {
		className: clsx( 'blockish-block-navmenu', {
			'is-vertical': attributes?.isVertical,
		} ),
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'blockish-block-navmenu-nav' },
		{
			template: TEMPLATE,
			orientation: 'horizontal',
		}
	);

	return (
		<div { ...blockProps }>
			<Inspector { ...props } />
			<div className="blockish-block-navmenu-wrapper">
				<nav { ...innerBlocksProps } aria-label={ __( 'Navigation', 'blockish' ) } />
			</div>
		</div>
	);
}
