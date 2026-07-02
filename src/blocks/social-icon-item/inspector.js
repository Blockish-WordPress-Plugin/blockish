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
							>
								<BlockishControl
									type="BlockishSelect"
									label={ __( 'Network', 'blockish' ) }
									slug="network"
									value={ attributes?.network || 'facebook' }
									onChange={ applyNetworkPreset }
									options={ [
										{ value: 'facebook', label: 'Facebook' },
										{ value: 'x', label: 'X' },
										{ value: 'instagram', label: 'Instagram' },
										{ value: 'linkedin', label: 'LinkedIn' },
										{ value: 'youtube', label: 'YouTube' },
									] }
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
