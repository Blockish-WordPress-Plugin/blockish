import Save from './save';

const deprecated = [
	{
		attributes: {
			network: {
				type: 'string',
				default: 'facebook',
			},
			label: {
				type: 'string',
				default: 'Facebook',
			},
			icon: {
				type: 'object',
			},
			officialColor: {
				type: 'string',
				default: '#1877F2',
			},
			link: {
				type: 'object',
			},
			dynamicData: {
				type: 'object',
			},
		},
		supports: {
			html: true,
			anchor: true,
		},
		save: Save,
		migrate( attributes ) {
			return {
				...attributes,
				network:
					typeof attributes.network === 'string'
						? {
								value: attributes.network,
								label:
									attributes.network.charAt( 0 ).toUpperCase() +
									attributes.network.slice( 1 ),
						  }
						: attributes.network,
			};
		},
	},
];

export default deprecated;
