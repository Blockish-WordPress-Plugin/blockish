import { Fragment, useEffect, useMemo, useState } from '@wordpress/element';
import { RichText, useBlockProps } from '@wordpress/block-editor';
import Inspector from './inspector';
import CircularRing from './circular-ring';
import FlipClockEditor from './flip-clock-editor';
import {
	getCountdownSettings,
	getDatasetFromAttributes,
	getRemainingParts,
	getUnitProgress,
	padUnitValue,
} from './utils';
import { getFlipClockHeadings } from './flip-clock-mount';
import './editor.scss';

export default function Edit( {
	attributes,
	setAttributes,
	advancedControls,
} ) {
	const settings = useMemo(
		() => getCountdownSettings( attributes ),
		[
			attributes?.dueDate,
			attributes?.layout?.value,
			attributes?.padZeros,
			attributes?.showLabels,
			attributes?.separator?.value,
			attributes?.circularDaysMax,
			attributes?.expiredMessage,
			attributes?.showExpiredMessage,
			attributes?.showDays,
			attributes?.showHours,
			attributes?.showMinutes,
			attributes?.showSeconds,
			attributes?.daysLabel,
			attributes?.hoursLabel,
			attributes?.minutesLabel,
			attributes?.secondsLabel,
		]
	);

	const [ now, setNow ] = useState( () => Date.now() );
	const isFlip = settings.layout === 'flip';

	useEffect( () => {
		if ( isFlip ) {
			return undefined;
		}

		const timer = window.setInterval( () => {
			setNow( Date.now() );
		}, 1000 );

		return () => window.clearInterval( timer );
	}, [ isFlip ] );

	const parts = useMemo(
		() => getRemainingParts( settings.dueDate, now ),
		[ settings.dueDate, now ]
	);

	const {
		layout,
		padZeros,
		showLabels,
		separator,
		units,
		showExpiredMessage,
	} = settings;

	const flipHeadings = useMemo(
		() => getFlipClockHeadings( settings ),
		[
			attributes?.daysLabel,
			attributes?.hoursLabel,
			attributes?.minutesLabel,
			attributes?.secondsLabel,
		]
	);

	const blockProps = useBlockProps( {
		className: `blockish-countdown is-layout-${ layout }${
			! isFlip && parts.expired ? ' is-expired' : ''
		}`,
		...getDatasetFromAttributes( attributes ),
	} );

	return (
		<>
			<Inspector
				attributes={ attributes }
				advancedControls={ advancedControls }
			/>
			<div { ...blockProps }>
				<div className="blockish-countdown__inner">
					{ isFlip ? (
						<FlipClockEditor
							dueDate={ settings.dueDate }
							headings={ flipHeadings }
						/>
					) : (
						<div
							className={ `blockish-countdown__units${
								parts.expired ? ' is-hidden' : ''
							}` }
							aria-hidden={ parts.expired ? 'true' : 'false' }
						>
							{ units.map( ( unit, index ) => {
								const rawValue = parts[ unit.key ] || 0;
								const display = padUnitValue(
									rawValue,
									padZeros
								);
								const progress = getUnitProgress(
									unit.key,
									rawValue,
									unit.max
								);
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
											data-progress={ progress.toFixed(
												4
											) }
										>
											<div className="blockish-countdown__unit-surface">
												{ layout === 'circular' && (
													<CircularRing
														progress={ progress }
													/>
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
							className={ `blockish-countdown__expired-wrap${
								! isFlip && parts.expired ? '' : ' is-hidden'
							}` }
							aria-hidden={
								! isFlip && parts.expired ? 'false' : 'true'
							}
						>
							<RichText
								tagName="p"
								className="blockish-countdown__expired"
								value={ attributes?.expiredMessage }
								onChange={ ( value ) =>
									setAttributes( { expiredMessage: value } )
								}
								placeholder="Expired message"
								allowedFormats={ [] }
							/>
						</div>
					) }
				</div>
			</div>
		</>
	);
}
