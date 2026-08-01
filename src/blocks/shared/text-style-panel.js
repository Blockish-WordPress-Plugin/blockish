/**
 * Shared Style panel for text-like blocks (typography + color + text shadow).
 *
 * @param {Object} props
 * @param {string} props.title Panel title.
 */
import { __ } from '@wordpress/i18n';

export default function TextStylePanel( { title } ) {
	const { BlockishControl, BlockishGroupControl } =
		window?.blockish?.controls || {};

	if ( ! BlockishControl ) {
		return null;
	}

	return (
		<BlockishControl
			type="BlockishPanelBody"
			title={ title }
			initialOpen={ true }
		>
			<BlockishControl
				type="BlockishTypography"
				label={ __( 'Typography', 'blockish' ) }
				slug="typography"
			/>
			<BlockishControl
				type="BlockishTab"
				tabs={ [
					{
						name: 'normal',
						title: __( 'Normal', 'blockish' ),
					},
					{
						name: 'hover',
						title: __( 'Hover', 'blockish' ),
					},
				] }
			>
				{ ( { name } ) => (
					<>
						{ name === 'normal' && (
							<>
								<BlockishControl
									type="BlockishColor"
									label={ __( 'Color', 'blockish' ) }
									slug="color"
								/>
								{ BlockishGroupControl && (
									<BlockishGroupControl
										type="BlockishBoxShadow"
										label={ __(
											'Text Shadow',
											'blockish'
										) }
										slug="textShadow"
										exclude={ [ 'inset', 'spread' ] }
									/>
								) }
							</>
						) }
						{ name === 'hover' && (
							<>
								<BlockishControl
									type="BlockishColor"
									label={ __( 'Hover Color', 'blockish' ) }
									slug="hoverColor"
								/>
								{ BlockishGroupControl && (
									<BlockishGroupControl
										type="BlockishBoxShadow"
										label={ __(
											'Text Shadow',
											'blockish'
										) }
										slug="textShadowHover"
										exclude={ [ 'inset', 'spread' ] }
									/>
								) }
							</>
						) }
					</>
				) }
			</BlockishControl>
		</BlockishControl>
	);
}
