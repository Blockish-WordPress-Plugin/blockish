import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const NETWORKS = {
	facebook: {
		label: 'Facebook',
		officialColor: '#1877F2',
		icon: {
			viewBox: [ 0, 0, 320, 512 ],
			path: 'M279.14 288l14.22-92.66h-88.91V135.08c0-25.35 12.42-50.06 52.24-50.06H297V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z',
		},
	},
	x: {
		label: 'X',
		officialColor: '#000000',
		icon: {
			viewBox: [ 0, 0, 512, 512 ],
			path: 'M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8l164.9-188.5L26 48h145.6l100.7 132.8zm-24.8 373.8h39.1L150.4 88.3h-42z',
		},
	},
	instagram: {
		label: 'Instagram',
		officialColor: '#E4405F',
		icon: {
			viewBox: [ 0, 0, 448, 512 ],
			path: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9S160.5 370.8 224.1 370.8 339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.3 0-74.7-33.4-74.7-74.7s33.4-74.7 74.7-74.7 74.7 33.4 74.7 74.7-33.4 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zM398.8 80c-31.7-31.7-74-49.6-118.8-49.6H168c-44.8 0-87.1 17.9-118.8 49.6C17.5 111.7-.4 154 .4 198.8v114.4c-.8 44.8 17.1 87.1 48.8 118.8 31.7 31.7 74 49.6 118.8 49.6h112c44.8 0 87.1-17.9 118.8-49.6 31.7-31.7 49.6-74 49.6-118.8V198.8c0-44.8-17.9-87.1-49.6-118.8zM357 314.1c.3 31.4-10.9 61.8-31.2 84.7-20.3 20.3-47.7 31.5-76.5 31.2H198.7c-28.8.3-56.2-10.9-76.5-31.2-20.3-22.9-31.5-53.3-31.2-84.7V197.9c-.3-31.4 10.9-61.8 31.2-84.7 20.3-20.3 47.7-31.5 76.5-31.2h50.6c28.8-.3 56.2 10.9 76.5 31.2 20.3 22.9 31.5 53.3 31.2 84.7v116.2z',
		},
	},
	linkedin: {
		label: 'LinkedIn',
		officialColor: '#0A66C2',
		icon: {
			viewBox: [ 0, 0, 448, 512 ],
			path: 'M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8S24.1-.5 53.8-.5 107.6 24.1 107.6 53.8 83.5 108.1 53.8 108.1zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.2-79.2-48.3 0-55.7 37.7-55.7 76.6V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.6-48.2 87.6-48.2 93.7 0 111 61.7 111 141.9V448z',
		},
	},
	youtube: {
		label: 'YouTube',
		officialColor: '#FF0000',
		icon: {
			viewBox: [ 0, 0, 576, 512 ],
			path: 'M549.7 124.1c-6.3-23.7-24.9-42.3-48.6-48.6C458.8 64 288 64 288 64S117.2 64 74.9 75.5C51.2 81.8 32.6 100.4 26.3 124.1 14.8 166.4 14.8 256 14.8 256s0 89.6 11.5 131.9c6.3 23.7 24.9 42.3 48.6 48.6C117.2 448 288 448 288 448s170.8 0 213.1-11.5c23.7-6.3 42.3-24.9 48.6-48.6C561.2 345.6 561.2 256 561.2 256s0-89.6-11.5-131.9zM232.1 337.8V174.2L375.5 256l-143.4 81.8z',
		},
	},
};

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
