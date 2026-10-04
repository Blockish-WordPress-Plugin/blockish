import {
	useMemo,
	useState,
	useCallback,
	useEffect,
	memo,
} from '@wordpress/element';
import { parse } from '@wordpress/blocks';
import { BlockPreview } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { EditorProvider } from '@wordpress/editor';
import {
	CLASS_CSS_REGEN_EVENT,
	fetchClassManagerCssBundle,
} from '../../class-manager/wrap-ai-preview';

const useClassManagerPreviewCss = () => {
	const [ classCss, setClassCss ] = useState( '' );

	const loadCss = useCallback( async () => {
		try {
			const bundle = await fetchClassManagerCssBundle( 0 );
			setClassCss( typeof bundle?.css === 'string' ? bundle.css : '' );
		} catch ( _err ) {
			// silent fallback
		}
	}, [] );

	useEffect( () => {
		loadCss();
		const onRegen = () => {
			loadCss();
		};
		window.addEventListener( CLASS_CSS_REGEN_EVENT, onRegen );
		return () => {
			window.removeEventListener( CLASS_CSS_REGEN_EVENT, onRegen );
		};
	}, [ loadCss ] );

	return classCss;
};

function PreviewLoading() {
	return (
		<div
			className="page-templates-preview-field--loading blockish-tb-preview blockish-tb-preview--loading"
			aria-busy="true"
			aria-live="polite"
		>
			<Spinner />
			<span className="blockish-tb-preview__loading-label">
				{ __( 'Loading preview…', 'blockish' ) }
			</span>
		</div>
	);
}

function ItemPreview( { item, content } ) {
	const classCss = useClassManagerPreviewCss();

	const editorSettings = useSelect( ( select ) => {
		return (
			select( 'core/block-editor' )?.getSettings?.() ||
			select( 'core/editor' )?.getEditorSettings?.() ||
			{}
		);
	}, [] );

	const settings = useMemo( () => {
		const baseStyles = Array.isArray( editorSettings.styles )
			? [ ...editorSettings.styles ]
			: [];
		if ( classCss ) {
			baseStyles.push( { css: classCss } );
		}
		return {
			...editorSettings,
			styles: baseStyles,
			isPreviewMode: true,
		};
	}, [ editorSettings, classCss ] );

	const backgroundColor = useMemo( () => {
		return editorSettings?.colors?.background || 'white';
	}, [ editorSettings ] );

	const rawContent = useMemo( () => {
		if ( content ) {
			return content;
		}
		if ( typeof item?.content === 'string' ) {
			return item.content;
		}
		return item?.content?.raw || item?.content?.rendered || '';
	}, [ item, content ] );

	const blocks = useMemo( () => {
		if ( ! rawContent ) {
			return [];
		}
		return parse( rawContent );
	}, [ rawContent ] );

	if ( ! blocks.length ) {
		return (
			<div className="page-templates-preview-field--empty blockish-tb-preview blockish-tb-preview--empty">
				{ __( 'Empty template', 'blockish' ) }
			</div>
		);
	}

	const postItem = item || {
		id: 0,
		type: 'wp_template',
		content: { raw: rawContent },
	};

	return (
		<EditorProvider post={ postItem } settings={ settings }>
			<div
				className="page-templates-preview-field blockish-tb-preview"
				style={ { backgroundColor } }
			>
				<BlockPreview.Async placeholder={ <PreviewLoading /> }>
					<BlockPreview blocks={ blocks } />
				</BlockPreview.Async>
			</div>
		</EditorProvider>
	);
}

export default memo( ItemPreview );
