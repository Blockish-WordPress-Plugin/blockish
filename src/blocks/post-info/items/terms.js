import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import MetaIcon from './meta-icon';

/** Map taxonomy slug → post entity attribute (REST). */
const TAXONOMY_POST_KEYS = {
	category: 'categories',
	post_tag: 'tags',
};

export default function TermsItem( { item, postId, postType } ) {
	const taxonomy = item?.taxonomy?.value || item?.taxonomy || 'category';
	const termsCount = item.termsCount || 3;
	const separator = item.termsSeparator || ', ';
	const postKey = TAXONOMY_POST_KEYS[ taxonomy ] || taxonomy;

	const terms = useSelect(
		( select ) => {
			const post = select( coreStore ).getEditedEntityRecord(
				'postType',
				postType,
				postId
			);
			const ids = post?.[ postKey ] || [];
			if ( ! ids.length ) {
				return [];
			}

			return ids
				.map( ( id ) =>
					select( coreStore ).getEntityRecord(
						'taxonomy',
						taxonomy,
						id
					)
				)
				.filter( Boolean )
				.slice( 0, termsCount );
		},
		[ postId, postType, taxonomy, postKey, termsCount ]
	);

	if ( ! terms.length ) {
		return (
			<span className="blockish-post-info__item is-type-terms">
				<MetaIcon item={ item } />
				<span className="blockish-post-info__text">
					{ item.beforeText }
					{ __( 'Terms', 'blockish' ) }
				</span>
			</span>
		);
	}

	return (
		<span className="blockish-post-info__item is-type-terms">
			<MetaIcon item={ item } />
			<span className="blockish-post-info__text">
				{ item.beforeText }
				{ terms.map( ( term, index ) => (
					<span key={ term.id }>
						{ item.link ? (
							<a
								href={ term.link }
								onClick={ ( event ) => event.preventDefault() }
							>
								{ term.name }
							</a>
						) : (
							term.name
						) }
						{ index < terms.length - 1 ? separator : null }
					</span>
				) ) }
			</span>
		</span>
	);
}
