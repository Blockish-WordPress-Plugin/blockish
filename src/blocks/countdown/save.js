import { Fragment } from '@wordpress/element';
import { RichText, useBlockProps } from '@wordpress/block-editor';
import CircularRing from './circular-ring';
import {
	getCountdownSettings,
	getDatasetFromAttributes,
	padUnitValue,
} from './utils';

export default function Save( { attributes } ) {
	const settings = getCountdownSettings( attributes );
	const {
		layout,
		padZeros,
		showLabels,
		separator,
		units,
		expiredMessage,
		showExpiredMessage,
	} = settings;
	const isFlip = layout === 'flip';

	const blockProps = useBlockProps.save( {
		className: `blockish-countdown is-layout-${ layout }`,
		...getDatasetFromAttributes( attributes ),
	} );

	return (
		<div { ...blockProps }>
			<div className="blockish-countdown__inner">
				{ isFlip ? (
					<div className="blockish-countdown__flipdown" />
				) : (
					<div
						className="blockish-countdown__units"
						aria-hidden="false"
					>
						{ units.map( ( unit, index ) => {
							const display = padUnitValue( 0, padZeros );
							const showSeparator =
								layout === 'inline' &&
								separator &&
								separator !== 'none' &&
								index < units.length - 1;

							return (
								<Fragment key={ unit.key }>
									<div
										className={ `blockish-countdown__unit is-unit-${ unit.key }` }
										data-unit={ unit.key }
										data-progress="0.0000"
									>
										<div className="blockish-countdown__unit-surface">
											{ layout === 'circular' && (
												<CircularRing progress={ 0 } />
											) }
											<span
												className="blockish-countdown__value"
												data-countdown-value=""
											>
												{ display }
											</span>
										</div>
										{ showLabels && (
											<span className="blockish-countdown__label">
												{ unit.label }
											</span>
										) }
									</div>
									{ showSeparator && (
										<span
											className="blockish-countdown__separator"
											aria-hidden="true"
										>
											{ separator }
										</span>
									) }
								</Fragment>
							);
						} ) }
					</div>
				) }

				{ showExpiredMessage && (
					<div
						className="blockish-countdown__expired-wrap is-hidden"
						aria-hidden="true"
					>
						<RichText.Content
							tagName="p"
							className="blockish-countdown__expired"
							value={ expiredMessage }
						/>
					</div>
				) }
			</div>
		</div>
	);
}
