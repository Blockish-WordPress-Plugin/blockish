import { useBlockProps } from '@wordpress/block-editor';
import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';
import './editor.scss';

function getPreviewTitle( attributes ) {
	const type = attributes.type?.value || 'archive';
	const showPrefix = attributes.showPrefix !== false;
	const showSearchTerm = attributes.showSearchTerm !== false;

	if ( type === 'search' ) {
		return showSearchTerm
			? __( 'Search results for: “…”', 'blockish' )
			: __( 'Search results', 'blockish' );
	}

	if ( type === 'post-type' ) {
		return showPrefix
			? __( 'Post Type: “Post”', 'blockish' )
			: __( 'Post', 'blockish' );
	}

	return showPrefix
		? __( 'Category: “Archive Title”', 'blockish' )
		: __( 'Archive Title', 'blockish' );
}

function getContextHint( type, templateSlug ) {
	if ( ! templateSlug ) {
		return null;
	}

	const slug = String( templateSlug );
	const isSearch = slug === 'search' || slug.startsWith( 'search-' );
	const isArchive =
		slug === 'archive' ||
		slug.startsWith( 'archive-' ) ||
		slug.startsWith( 'category' ) ||
		slug.startsWith( 'tag' ) ||
		slug.startsWith( 'taxonomy-' ) ||
		slug.startsWith( 'author' ) ||
		slug.startsWith( 'date' );

	if ( type === 'search' && ! isSearch ) {
		return __(
			'Search title only renders on search results. It will be empty on other templates.',
			'blockish'
		);
	}

	if ( type === 'archive' && isSearch ) {
		return __(
			'Archive title only renders on archive templates. On search results it will be empty — switch Type to Search.',
			'blockish'
		);
	}

	if ( type === 'archive' && ! isArchive && ! isSearch ) {
		return __(
			'Archive title only renders on archive templates. It will be empty here on the front end.',
			'blockish'
		);
	}

	return null;
}

export default function Edit( props ) {
	const { attributes, context } = props;
	const Tag = attributes.tag?.value || 'h1';
	const type = attributes.type?.value || 'archive';
	const hint = getContextHint( type, context?.templateSlug );
	const blockProps = useBlockProps( {
		className: 'blockish-query-title',
	} );

	return (
		<>
			<Inspector { ...props } />
			{ hint && (
				<Notice
					status="warning"
					isDismissible={ false }
					className="blockish-query-title__hint"
				>
					{ hint }
				</Notice>
			) }
			<Tag { ...blockProps }>{ getPreviewTitle( attributes ) }</Tag>
		</>
	);
}
