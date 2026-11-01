/**
 * The controls row (filter buttons, then search), shared by save and the
 * editor preview so both render the same markup. On the front end the
 * buttons are created by view.js from the items' terms; `buttons` is only
 * passed by the editor preview.
 *
 * @param {Object}   props            Component props.
 * @param {Object}   props.attributes Block attributes.
 * @param {string[]} [props.buttons]  Editor preview: terms to show as buttons.
 * @param {boolean}  [props.preview]  Editor preview: render inert controls.
 */
export default function Controls( { attributes, buttons, preview = false } ) {
	const { showSearch, searchPlaceholder, showFilters, allLabel } = attributes;
	if ( ! showSearch && ! showFilters ) {
		return null;
	}

	return (
		<div className="blockish-filter-controls" aria-hidden={ preview ? 'true' : undefined }>
			{ showFilters && (
				<div
					className="blockish-filter-buttons"
					role={ preview ? undefined : 'group' }
					aria-label={ preview ? undefined : allLabel }
					data-all-label={ preview ? undefined : allLabel }
				>
					{ buttons && (
						<>
							<span className="blockish-filter-button is-active">{ allLabel }</span>
							{ buttons.map( ( term ) => (
								<span key={ term } className="blockish-filter-button">
									{ term }
								</span>
							) ) }
						</>
					) }
				</div>
			) }
			{ showSearch && (
				<div className="blockish-filter-search-box">
					<svg
						className="blockish-filter-search-icon"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.6"
						aria-hidden="true"
					>
						<circle cx="7" cy="7" r="5"></circle>
						<path d="M11 11l3.5 3.5"></path>
					</svg>
					<input
						type="search"
						className="blockish-filter-search"
						placeholder={ searchPlaceholder }
						aria-label={ preview ? undefined : searchPlaceholder }
						readOnly={ preview || undefined }
						tabIndex={ preview ? -1 : undefined }
					/>
				</div>
			) }
		</div>
	);
}
