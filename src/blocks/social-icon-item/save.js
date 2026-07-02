import { useBlockProps } from '@wordpress/block-editor';
import { NETWORKS } from './networks';

export default function Save( { attributes } ) {
	const { BlockishIcon, getLinkProps } = window.blockish.helpers;
	const linkAttributes = getLinkProps( attributes?.link );
	const Tag = linkAttributes?.href ? 'a' : 'span';

	const blockProps = useBlockProps.save( {
		className: 'blockish-social-icon-item',
		style: {
			'--blockish-social-icon-official-color':
				attributes?.officialColor || '#1877F2',
		},
	} );

	return (
		<li { ...blockProps }>
			<Tag
				className="blockish-social-icon-item__link"
				{ ...linkAttributes }
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
	);
}
