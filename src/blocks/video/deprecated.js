import metadata from './block.json';
import Save from './save';

const { posterImage, ...legacyAttributes } = metadata.attributes;

/**
 * @deprecated string `poster` — migrated to media object `posterImage`.
 */
const deprecated = [
	{
		attributes: {
			...legacyAttributes,
			poster: {
				type: 'string',
			},
		},
		supports: metadata.supports,
		isEligible( attributes ) {
			return (
				typeof attributes?.poster === 'string' &&
				attributes.poster !== '' &&
				! attributes?.posterImage?.url
			);
		},
		migrate( attributes ) {
			const { poster, ...rest } = attributes;
			return {
				...rest,
				posterImage: {
					url: poster,
					type: 'image',
				},
			};
		},
		save: Save,
	},
];

export default deprecated;
