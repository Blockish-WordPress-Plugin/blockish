import { InspectorControls } from '@wordpress/block-editor';
import {
	ToggleControl,
	TextControl,
	RangeControl,
} from '@wordpress/components';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	TYPE_OPTIONS,
	ICON_STYLE_OPTIONS,
	DATE_FORMAT_OPTIONS,
	TIME_FORMAT_OPTIONS,
	TAXONOMY_OPTIONS,
	createDefaultItem,
	getItemType,
	getIconStyle,
} from './icons';

const ItemFields = ( { item, update } ) => {
	const { BlockishSelect, BlockishIconPicker } =
		window?.blockish?.components || {};
	const type = getItemType( item );
	const iconStyle = getIconStyle( item );

	if ( ! BlockishSelect ) {
		return null;
	}

	return (
		<>
			<BlockishSelect
				label={ __( 'Type', 'blockish' ) }
				value={ item.type }
				onChange={ ( nextType ) => update( { type: nextType } ) }
				options={ TYPE_OPTIONS }
			/>
			<TextControl
				label={ __( 'Before Text', 'blockish' ) }
				value={ item.beforeText || '' }
				onChange={ ( beforeText ) => update( { beforeText } ) }
			/>
			{ type !== 'time' &&
				type !== 'reading-time' &&
				type !== 'word-count' && (
					<ToggleControl
						label={ __( 'Link', 'blockish' ) }
						checked={ !! item.link }
						onChange={ ( link ) => update( { link } ) }
					/>
				) }
			<BlockishSelect
				label={ __( 'Icon', 'blockish' ) }
				value={ item.icon }
				onChange={ ( icon ) => update( { icon } ) }
				options={ ICON_STYLE_OPTIONS }
			/>
			{ iconStyle === 'custom' && BlockishIconPicker && (
				<BlockishIconPicker
					label={ __( 'Custom Icon', 'blockish' ) }
					value={ item.customIcon }
					onChange={ ( customIcon ) => update( { customIcon } ) }
				/>
			) }
			{ type === 'author' && (
				<>
					<ToggleControl
						label={ __( 'Show Avatar', 'blockish' ) }
						checked={ !! item.showAvatar }
						onChange={ ( showAvatar ) => update( { showAvatar } ) }
					/>
					{ item.showAvatar && (
						<RangeControl
							label={ __( 'Avatar Size', 'blockish' ) }
							value={ item.avatarSize || 16 }
							onChange={ ( avatarSize ) =>
								update( { avatarSize } )
							}
							min={ 12 }
							max={ 96 }
						/>
					) }
				</>
			) }
			{ ( type === 'date' || type === 'modified' ) && (
				<BlockishSelect
					label={ __( 'Date Format', 'blockish' ) }
					value={ item.dateFormat }
					onChange={ ( dateFormat ) => update( { dateFormat } ) }
					options={ DATE_FORMAT_OPTIONS }
				/>
			) }
			{ type === 'time' && (
				<BlockishSelect
					label={ __( 'Time Format', 'blockish' ) }
					value={ item.timeFormat }
					onChange={ ( timeFormat ) => update( { timeFormat } ) }
					options={ TIME_FORMAT_OPTIONS }
				/>
			) }
			{ type === 'terms' && (
				<>
					<BlockishSelect
						label={ __( 'Taxonomy', 'blockish' ) }
						value={ item.taxonomy }
						onChange={ ( taxonomy ) => update( { taxonomy } ) }
						options={ TAXONOMY_OPTIONS }
					/>
					<RangeControl
						label={ __( 'Terms Count', 'blockish' ) }
						value={ item.termsCount || 3 }
						onChange={ ( termsCount ) => update( { termsCount } ) }
						min={ 1 }
						max={ 10 }
					/>
					<TextControl
						label={ __( 'Terms Separator', 'blockish' ) }
						value={ item.termsSeparator || ', ' }
						onChange={ ( termsSeparator ) =>
							update( { termsSeparator } )
						}
					/>
				</>
			) }
			{ type === 'reading-time' && (
				<RangeControl
					label={ __( 'Words Per Minute', 'blockish' ) }
					value={ item.wordsPerMinute || 200 }
					onChange={ ( wordsPerMinute ) =>
						update( { wordsPerMinute } )
					}
					min={ 100 }
					max={ 400 }
					step={ 10 }
				/>
			) }
		</>
	);
};

const Inspector = ( { attributes, setAttributes, advancedControls } ) => {
	const { BlockishControl, BlockishResponsiveControl } =
		window?.blockish?.controls || {};
	const { BlockishRepeater } = window?.blockish?.components || {};

	if ( ! BlockishControl || ! BlockishRepeater ) {
		return null;
	}

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'content', title: __( 'Content', 'blockish' ) },
					{ name: 'style', title: __( 'Style', 'blockish' ) },
					{ name: 'advanced', title: __( 'Advanced', 'blockish' ) },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Layout', 'blockish' ) }
									initialOpen={ true }
								indicatorSlugs={['layout', 'separator']}>
									<BlockishControl
										type="BlockishSelect"
										label={ __( 'Direction', 'blockish' ) }
										slug="layout"
										options={ [
											{
												value: 'row',
												label: __( 'Row', 'blockish' ),
											},
											{
												value: 'column',
												label: __(
													'Column',
													'blockish'
												),
											},
										] }
									/>
									<BlockishControl
										type="BlockishSelect"
										label={ __( 'Separator', 'blockish' ) }
										slug="separator"
										options={ [
											{
												value: 'none',
												label: __( 'None', 'blockish' ),
											},
											{
												value: 'dot',
												label: __( 'Dot', 'blockish' ),
											},
											{
												value: 'pipe',
												label: __( 'Pipe', 'blockish' ),
											},
											{
												value: 'line',
												label: __( 'Line', 'blockish' ),
											},
										] }
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Items', 'blockish' ) }
									initialOpen={ true }
								indicatorSlugs={['items']}>
									<BlockishRepeater
										repeaterItems={ attributes.items || [] }
										onChange={ ( items ) =>
											setAttributes( { items } )
										}
										newItem={ () => createDefaultItem() }
										addLabel={ __(
											'Add Meta Item',
											'blockish'
										) }
										defaultLabel={ __(
											'Meta Item',
											'blockish'
										) }
										itemLabelName="type"
										sortable={ true }
										addUniqueId={ true }
									>
										{ ( item, index, update ) => (
											<ItemFields
												item={ item }
												update={ update }
											/>
										) }
									</BlockishRepeater>
								</BlockishControl>
							</>
						) }
						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Layout', 'blockish' ) }
									initialOpen={ true }
								indicatorSlugs={['alignment', 'alignItems', 'gap']}>
									<BlockishResponsiveControl
										type="BlockishSelect"
										label={ __( 'Alignment', 'blockish' ) }
										slug="alignment"
										left="66px"
										options={ [
											{
												value: 'flex-start',
												label: __(
													'Start',
													'blockish'
												),
											},
											{
												value: 'center',
												label: __(
													'Center',
													'blockish'
												),
											},
											{
												value: 'flex-end',
												label: __( 'End', 'blockish' ),
											},
											{
												value: 'space-between',
												label: __(
													'Space Between',
													'blockish'
												),
											},
											{
												value: 'space-around',
												label: __(
													'Space Around',
													'blockish'
												),
											},
											{
												value: 'space-evenly',
												label: __(
													'Space Evenly',
													'blockish'
												),
											},
										] }
									/>
									<BlockishResponsiveControl
										type="BlockishSelect"
										label={ __(
											'Align Items',
											'blockish'
										) }
										slug="alignItems"
										left="80px"
										options={ [
											{
												value: 'flex-start',
												label: __(
													'Start',
													'blockish'
												),
											},
											{
												value: 'center',
												label: __(
													'Center',
													'blockish'
												),
											},
											{
												value: 'flex-end',
												label: __( 'End', 'blockish' ),
											},
											{
												value: 'stretch',
												label: __(
													'Stretch',
													'blockish'
												),
											},
										] }
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Gap', 'blockish' ) }
										slug="gap"
										left="28px"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Text', 'blockish' ) }
									initialOpen={ false }
								indicatorSlugs={['typography', 'color', 'hoverColor']}>
									<BlockishControl
										type="BlockishTypography"
										label={ __( 'Typography', 'blockish' ) }
										slug="typography"
									/>
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Color', 'blockish' ) }
										slug="color"
									/>
									<BlockishControl
										type="BlockishColor"
										label={ __(
											'Link Hover Color',
											'blockish'
										) }
										slug="hoverColor"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Icon', 'blockish' ) }
									initialOpen={ false }
								indicatorSlugs={['iconColor', 'iconSize', 'iconGap']}>
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Icon Color', 'blockish' ) }
										slug="iconColor"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Icon Size', 'blockish' ) }
										slug="iconSize"
										left="60px"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Icon Gap', 'blockish' ) }
										slug="iconGap"
										left="56px"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Separator', 'blockish' ) }
									initialOpen={ false }
								indicatorSlugs={['separatorColor']}>
									<BlockishControl
										type="BlockishColor"
										label={ __(
											'Separator Color',
											'blockish'
										) }
										slug="separatorColor"
									/>
								</BlockishControl>
							</>
						) }
						{ tabName === 'advanced' && advancedControls }
					</>
				) }
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo( Inspector );
