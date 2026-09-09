import {
	useMemo,
	useState,
	useEffect,
	useRef,
	memo,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { parse } from '@wordpress/blocks';
import { BlockPreview } from '@wordpress/block-editor';
import {
	Button,
	Modal,
	SearchControl,
	Spinner,
} from '@wordpress/components';
import { plus } from '@wordpress/icons';

const VIEWPORT_WIDTH = 1200;

/**
 * Theme-builder-style preview CSS.
 * Also injected last into the preview iframe — Class Manager often
 * overrides `additionalStyles` on specificity/order.
 */
const PREVIEW_CSS = `
	body {
		padding: 24px !important;
		margin: 0 !important;
		background: #fff !important;
	}
	.block-list-appender,
	.block-editor-inserter,
	.block-editor-block-list__insertion-point {
		display: none !important;
	}
	.block-editor-block-list__layout {
		padding: 0 !important;
		margin: 0 !important;
	}
	.block-editor-block-list__block {
		max-width: none !important;
		margin-left: 0 !important;
		margin-right: 0 !important;
	}
	html body .wp-block-blockish-container,
	html body .blockish-container,
	html body .wp-block-group,
	html body .editor-styles-wrapper .wp-block-blockish-container,
	html body .editor-styles-wrapper .blockish-container,
	html body .editor-styles-wrapper .wp-block-group {
		min-height: 0 !important;
		height: auto !important;
		max-height: none !important;
	}
`;

const PREVIEW_STYLES = [ { css: PREVIEW_CSS } ];

const PREVIEW_STYLE_ID = 'blockish-megamenu-preview-styles';

/**
 * Force preview CSS into the iframe last so it beats Class Manager.
 *
 * @param {HTMLIFrameElement|null} iframe
 * @return {boolean} Whether styles were applied.
 */
function injectPreviewStyles( iframe ) {
	try {
		const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
		if ( ! doc?.head ) {
			return false;
		}
		let style = doc.getElementById( PREVIEW_STYLE_ID );
		if ( ! style ) {
			style = doc.createElement( 'style' );
			style.id = PREVIEW_STYLE_ID;
			doc.head.appendChild( style );
		}
		if ( style.textContent !== PREVIEW_CSS ) {
			style.textContent = PREVIEW_CSS;
		}
		// Keep our rules last if other styles are appended later.
		if ( style.nextSibling ) {
			doc.head.appendChild( style );
		}
		return true;
	} catch ( e ) {
		return false;
	}
}

/**
 * BlockPreview only scales by width. Recompute scale from real content
 * height so the full design fits the card (contain, top-left).
 *
 * @param {HTMLElement|null} wrap
 */
function applyHeightAwareScale( wrap ) {
	if ( ! wrap ) {
		return;
	}
	const contentEl = wrap.querySelector(
		'.block-editor-block-preview__content'
	);
	if ( ! contentEl ) {
		return;
	}

	const cw = wrap.clientWidth;
	const ch = wrap.clientHeight;
	if ( cw < 2 || ch < 2 ) {
		return;
	}

	const iframe = contentEl.querySelector( 'iframe' );
	injectPreviewStyles( iframe );

	let contentHeight = 0;
	try {
		const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
		const body = doc?.body;
		const html = doc?.documentElement;
		if ( body ) {
			contentHeight = Math.max(
				body.scrollHeight || 0,
				body.offsetHeight || 0,
				html?.scrollHeight || 0,
				1
			);
		}
	} catch ( e ) {
		// ignore
	}

	if ( ! contentHeight ) {
		const fallbackScale = cw / VIEWPORT_WIDTH;
		const rect = contentEl.getBoundingClientRect();
		contentHeight = Math.max( rect.height / ( fallbackScale || 1 ), 1 );
	}

	const scale = Math.min( cw / VIEWPORT_WIDTH, ch / contentHeight );
	const rounded = Math.round( scale * 10000 ) / 10000;
	const next = `scale(${ rounded })`;

	if (
		contentEl.style.transform === next &&
		contentEl.style.transformOrigin === 'top left' &&
		contentEl.style.width === `${ VIEWPORT_WIDTH }px`
	) {
		return;
	}

	contentEl.style.transformOrigin = 'top left';
	contentEl.style.transform = next;
	contentEl.style.width = `${ VIEWPORT_WIDTH }px`;
}

function PreviewLoading() {
	return (
		<div
			className="megamenu-preview-field megamenu-preview-field--loading"
			aria-busy="true"
			aria-live="polite"
		>
			<Spinner />
			<span className="megamenu-preview-field__loading-label">
				{ __( 'Loading preview…', 'blockish' ) }
			</span>
		</div>
	);
}

function MegamenuCardPreview( { content } ) {
	const wrapRef = useRef( null );
	const blocks = useMemo( () => {
		if ( ! content ) {
			return [];
		}
		return parse( content );
	}, [ content ] );

	useEffect( () => {
		if ( ! blocks.length ) {
			return;
		}
		const wrap = wrapRef.current;
		if ( ! wrap ) {
			return;
		}

		let raf = 0;
		const run = () => {
			cancelAnimationFrame( raf );
			raf = requestAnimationFrame( () =>
				applyHeightAwareScale( wrap )
			);
		};
		run();

		const ro = new ResizeObserver( run );
		ro.observe( wrap );

		const mo = new MutationObserver( run );
		mo.observe( wrap, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: [ 'style' ],
		} );

		const timers = [ 150, 400, 900 ].map( ( ms ) =>
			setTimeout( run, ms )
		);
		wrap.addEventListener( 'load', run, true );

		return () => {
			cancelAnimationFrame( raf );
			ro.disconnect();
			mo.disconnect();
			timers.forEach( clearTimeout );
			wrap.removeEventListener( 'load', run, true );
		};
	}, [ blocks ] );

	if ( ! blocks.length ) {
		return (
			<div className="megamenu-preview-field megamenu-preview-field--empty">
				{ __( 'Empty', 'blockish' ) }
			</div>
		);
	}

	return (
		<div className="megamenu-preview-field" ref={ wrapRef }>
			<BlockPreview.Async placeholder={ <PreviewLoading /> }>
				<BlockPreview
					blocks={ blocks }
					viewportWidth={ VIEWPORT_WIDTH }
					additionalStyles={ PREVIEW_STYLES }
				/>
			</BlockPreview.Async>
		</div>
	);
}

const MemoMegamenuCardPreview = memo( MegamenuCardPreview );

export default function MegamenuPickerModal( {
	items,
	hasResolved,
	currentId = 0,
	onApply,
	onCancel,
	onCreateNew,
} ) {
	const [ search, setSearch ] = useState( '' );
	const [ selectedId, setSelectedId ] = useState( currentId || 0 );

	const filtered = useMemo( () => {
		const query = search.trim().toLowerCase();
		const list = items || [];
		if ( ! query ) {
			return list;
		}
		return list.filter( ( item ) => {
			const title = ( item.title?.rendered || '' ).toLowerCase();
			return title.includes( query );
		} );
	}, [ items, search ] );

	return (
		<Modal
			title={ __( 'Select Mega Menu', 'blockish' ) }
			onRequestClose={ onCancel }
			className="blockish-megamenu-picker-modal"
			size="large"
		>
			<div className="blockish-megamenu-picker-modal__layout">
				<div className="blockish-megamenu-picker-modal__toolbar">
					<SearchControl
						value={ search }
						onChange={ setSearch }
						placeholder={ __( 'Search mega menus…', 'blockish' ) }
						__nextHasNoMarginBottom
					/>
				</div>

				<div className="blockish-megamenu-picker-modal__body">
					{ ! hasResolved ? (
						<div className="blockish-megamenu-picker-modal__loading">
							<Spinner />
						</div>
					) : null }

					{ hasResolved && filtered.length === 0 ? (
						<p className="blockish-megamenu-picker-modal__empty">
							{ __( 'No mega menus found.', 'blockish' ) }
						</p>
					) : null }

					{ hasResolved && filtered.length > 0 ? (
						<div className="blockish-megamenu-picker-modal__grid">
							{ filtered.map( ( item ) => {
								const isSelected = selectedId === item.id;
								return (
									<button
										key={ item.id }
										type="button"
										className={ `blockish-megamenu-picker-card${
											isSelected ? ' is-selected' : ''
										}` }
										onClick={ () =>
											setSelectedId( item.id )
										}
										aria-pressed={ isSelected }
									>
										<div className="blockish-megamenu-picker-card__preview">
											<MemoMegamenuCardPreview
												content={
													item.content?.raw ||
													item.content?.rendered ||
													''
												}
											/>
										</div>
										<span className="blockish-megamenu-picker-card__title">
											{ item.title?.rendered ||
												__(
													'(Untitled)',
													'blockish'
												) }
										</span>
									</button>
								);
							} ) }
						</div>
					) : null }
				</div>

				<div className="blockish-megamenu-picker-modal__footer">
					<Button
						variant="secondary"
						icon={ plus }
						onClick={ onCreateNew }
					>
						{ __( 'Create new', 'blockish' ) }
					</Button>
					<div className="blockish-megamenu-picker-modal__footer-actions">
						<Button variant="tertiary" onClick={ onCancel }>
							{ __( 'Cancel', 'blockish' ) }
						</Button>
						<Button
							variant="primary"
							disabled={ ! selectedId }
							onClick={ () => onApply( selectedId ) }
						>
							{ __( 'Apply', 'blockish' ) }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
