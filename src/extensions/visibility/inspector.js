import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';

const DEVICES = [
	{
		key: 'Desktop',
		label: __( 'Hide on Desktop', 'blockish' ),
	},
	{
		key: 'Tablet',
		label: __( 'Hide on Tablet', 'blockish' ),
	},
	{
		key: 'Mobile',
		label: __( 'Hide on Mobile', 'blockish' ),
	},
];

function VisibilityPanel( { clientId } ) {
	const { useExtensionsAttributes } = window?.blockish?.helpers || {};
	const BlockishControl = window?.blockish?.controls?.BlockishControl;

	if ( ! BlockishControl || ! useExtensionsAttributes ) {
		return null;
	}

	const { attributes, setAttributes } = useExtensionsAttributes( clientId );
	const hideOn = attributes?.hideOn && typeof attributes.hideOn === 'object'
		? attributes.hideOn
		: { Desktop: false, Tablet: false, Mobile: false };

	const updateDevice = ( device, value ) => {
		setAttributes( {
			hideOn: {
				...hideOn,
				[ device ]: !! value,
			},
		} );
	};

	return (
		<BlockishControl
			type="BlockishPanelBody"
			title={ __( 'Visibility', 'blockish' ) }
			initialOpen={ false }
		>
			<p className="blockish-visibility-help">
				{ __(
					'Hide this block on selected devices. In the editor it dims only while that device preview is active, so you can still select it.',
					'blockish'
				) }
			</p>
			{ DEVICES.map( ( device ) => (
				<ToggleControl
					key={ device.key }
					label={ device.label }
					checked={ !! hideOn[ device.key ] }
					onChange={ ( value ) =>
						updateDevice( device.key, value )
					}
					__nextHasNoMarginBottom
				/>
			) ) }
		</BlockishControl>
	);
}

const withVisibilityInspector = createHigherOrderComponent(
	( WrappedComponent ) => {
		return ( props ) => {
			const { tabName, blockName, clientId } = props;

			if (
				tabName !== 'advanced' ||
				! blockName ||
				! blockName.startsWith( 'blockish' )
			) {
				return <WrappedComponent { ...props } />;
			}

			return (
				<>
					<WrappedComponent { ...props } />
					<VisibilityPanel clientId={ clientId } />
				</>
			);
		};
	},
	'withVisibilityInspector'
);

export default withVisibilityInspector;

addFilter(
	'blockish.tabs.after-tab-content',
	'blockish/visibility-inspector',
	withVisibilityInspector,
	15
);
