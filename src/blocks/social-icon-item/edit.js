import { useBlockProps } from '@wordpress/block-editor';
import Inspector from './inspector';
import { NETWORKS } from './networks';
import './editor.scss';

export default function Edit( {
	attributes,
	setAttributes,
	advancedControls,
} ) {
	const { BlockishIcon, getLinkProps } = window.blockish.helpers;
	const linkAttributes = getLinkProps( attributes?.link );
	const Tag = linkAttributes?.href ? 'a' : 'span';

	const blockProps = useBlockProps( {
		className: 'blockish-social-icon-item',
		style: {
			'--blockish-social-icon-official-color':
				attributes?.officialColor || '#1877F2',
		},
	} );

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				advancedControls={ advancedControls }
			/>
			<li { ...blockProps }>
				<Tag
					className="blockish-social-icon-item__link"
					{ ...linkAttributes }
					onClick={ ( event ) => event.preventDefault() }
					aria-label={ attributes?.label || 'Social icon' }
				>
					<span className="blockish-social-icon-item__icon" aria-hidden="true">
						<BlockishIcon
							icon={ attributes.icon === undefined && attributes.network ? NETWORKS[attributes.network?.value || attributes.network]?.icon : attributes?.icon }
							width={ 18 }
							height={ 18 }
							fill="currentColor"
						/>
					</span>
				</Tag>
			</li>
		</>
	);
}
