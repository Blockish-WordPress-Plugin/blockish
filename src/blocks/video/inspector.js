import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	sourceOptions,
	suggestedVideosOptions,
	normalizeSuggestedVideosOption,
} from './utils';

const Inspector = ( { attributes, setAttributes, advancedControls } ) => {
	const { BlockishControl, BlockishResponsiveControl } =
		window?.blockish?.controls;
	const sourceType = attributes?.sourceType?.value;
	const currentSource =
		sourceType &&
		sourceOptions.find( ( option ) => option.value === sourceType );

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'content', title: 'Content' },
					{ name: 'style', title: 'Style' },
					{ name: 'advanced', title: 'Advanced' },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Video', 'blockish' ) }
									initialOpen={ true }
								>
									<BlockishControl
										type="BlockishSelect"
										label={ __( 'Source', 'blockish' ) }
										slug="sourceType"
										options={ sourceOptions }
									/>

									{ sourceType === 'selfHosted' && (
										<>
											<BlockishControl
												type="BlockishMediaUploader"
												label={ __(
													'Self Hosted Video',
													'blockish'
												) }
												placeholder={ __(
													'Upload Video',
													'blockish'
												) }
												allowedTypes={ [ 'video' ] }
												slug="selfHostedVideo"
											/>
										</>
									) }

									{ sourceType !== 'selfHosted' && (
										<BlockishControl
											type="TextControl"
											label={ currentSource?.label }
											slug={ `${ sourceType }Url` }
										/>
									) }
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Playback', 'blockish' ) }
									initialOpen={ true }
								>
									{ sourceType === 'selfHosted' && (
										<BlockishControl
											type="BlockishMediaUploader"
											label={ __(
												'Poster Image',
												'blockish'
											) }
											placeholder={ __(
												'Upload Poster Image',
												'blockish'
											) }
											allowedTypes={ [ 'image' ] }
											value={
												attributes?.poster
													? {
															url: attributes.poster,
															type: 'image',
													  }
													: null
											}
											onChange={ ( media ) => {
												setAttributes( {
													poster: media?.url || '',
												} );
											} }
										/>
									) }

									<BlockishControl
										type="BlockishNumber"
										label={ __(
											'Start Time (seconds)',
											'blockish'
										) }
										slug="startTime"
										min={ 0 }
									/>
									{ sourceType !== 'vimeo' && (
										<BlockishControl
											type="BlockishNumber"
											label={ __(
												'End Time (seconds)',
												'blockish'
											) }
											slug="endTime"
											min={ 0 }
										/>
									) }
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Autoplay', 'blockish' ) }
										slug="autoplay"
									/>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Mute', 'blockish' ) }
										slug="muted"
									/>
									<BlockishControl
										type="ToggleControl"
										label={ __(
											'Play on Mobile',
											'blockish'
										) }
										slug="playOnMobile"
									/>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Loop', 'blockish' ) }
										slug="loop"
									/>
									{ attributes?.sourceType?.value !==
										'selfHosted' && (
										<BlockishControl
											type="ToggleControl"
											label={ __(
												'Privacy Mode',
												'blockish'
											) }
											slug="privacyMode"
											help={ __(
												"When you turn on privacy mode, YouTube/Vimeo won't store information about visitors on your website unless they play the video.",
												'blockish'
											) }
										/>
									) }
									{ sourceType !== 'vimeo' && (
										<BlockishControl
											type="ToggleControl"
											label={ __(
												'Controls',
												'blockish'
											) }
											slug="controls"
										/>
									) }

									{ sourceType === 'youtube' && (
										<BlockishControl
											type="ToggleControl"
											label={ __(
												'Captions',
												'blockish'
											) }
											slug="captions"
										/>
									) }

									{ sourceType === 'youtube' && (
										<>
											<BlockishControl
												type="ToggleControl"
												label={ __(
													'Lazy Load',
													'blockish'
												) }
												slug="lazyLoad"
											/>
											<BlockishControl
												type="BlockishSelect"
												label={ __(
													'Suggested Videos',
													'blockish'
												) }
												value={ normalizeSuggestedVideosOption(
													attributes?.suggestedVideos
												) }
												options={
													suggestedVideosOptions
												}
												onChange={ ( option ) => {
													setAttributes( {
														suggestedVideos:
															option ||
															suggestedVideosOptions[ 0 ],
													} );
												} }
											/>
										</>
									) }
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Image Overlay', 'blockish' ) }
									initialOpen={ false }
								>
									<BlockishControl
										type="ToggleControl"
										label={ __(
											'Enable Overlay',
											'blockish'
										) }
										slug="showOverlay"
									/>
									{ attributes?.showOverlay && (
										<>
											<BlockishControl
												type="BlockishMediaUploader"
												label={ __(
													'Overlay Image',
													'blockish'
												) }
												placeholder={ __(
													'Upload Overlay Image',
													'blockish'
												) }
												allowedTypes={ [ 'image' ] }
												value={
													attributes?.overlayImage
												}
												onChange={ ( media ) => {
													setAttributes( {
														overlayImage:
															media || undefined,
													} );
												} }
											/>
											<BlockishControl
												type="ToggleControl"
												label={ __(
													'Show Play Icon',
													'blockish'
												) }
												slug="showOverlayPlayIcon"
											/>
										</>
									) }
								</BlockishControl>
							</>
						) }

						{ tabName === 'style' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Video', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={ __( 'Alignment', 'blockish' ) }
									slug="alignment"
									left="65px"
									options={ [
										{
											value: 'left',
											label: __( 'Left', 'blockish' ),
										},
										{
											value: 'center',
											label: __( 'Center', 'blockish' ),
										},
										{
											value: 'right',
											label: __( 'Right', 'blockish' ),
										},
									] }
								/>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Width', 'blockish' ) }
									slug="videoWidth"
									left="40px"
								/>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Height', 'blockish' ) }
									slug="videoHeight"
									left="44px"
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
