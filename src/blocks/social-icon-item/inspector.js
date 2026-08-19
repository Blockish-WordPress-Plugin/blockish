import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { NETWORKS } from './networks';

const Inspector = ( { attributes, setAttributes, advancedControls } ) => {
	const { BlockishControl } = window?.blockish?.controls;

	const applyNetworkPreset = ( network ) => {
		
		const preset = NETWORKS?.[ network?.value ];
		
		if ( ! preset ) {
			setAttributes( { network } );
			return;
		}

		setAttributes( {
			network,
			label: preset.label,
			officialColor: preset.officialColor,
			icon: preset.icon,
		} );
	};

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'content', title: 'Content' },
					{ name: 'advanced', title: 'Advanced' },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Social Icon', 'blockish' ) }
								initialOpen={ true }
							indicatorSlugs={['network', 'label', 'icon', 'link']}>
								<BlockishControl
									type="BlockishSelect"
									label={ __( 'Network', 'blockish' ) }
									slug="network"
									value={ attributes?.network || { value: 'facebook', label: 'Facebook' } }
									onChange={ applyNetworkPreset }
									options={ Object.entries( NETWORKS ).map( ( [ key, network ] ) => ( {
										value: key,
										label: network.label,
									} ) ) }
								/>
								<BlockishControl
									type="TextControl"
									label={ __( 'Label', 'blockish' ) }
									slug="label"
									__next40pxDefaultSize
								/>
								<BlockishControl
									type="BlockishIconPicker"
									label={ __( 'Icon', 'blockish' ) }
									slug="icon"
								/>
								<BlockishControl
									type="BlockishLink"
									label={ __( 'Link', 'blockish' ) }
									slug="link"
								/>
							</BlockishControl>
						) }
						{ tabName === 'advanced' && advancedControls }
					</>
				) }
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo( Inspector );
