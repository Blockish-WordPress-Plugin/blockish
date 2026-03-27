const getAccordionSchemaData = ( element ) => {
	const items = Array.from(
		element.querySelectorAll( '.blockish-accordion-item' )
	)
		.map( ( item ) => {
			const question = item
				.querySelector( '.blockish-accordion-item-title-text' )
				?.textContent?.trim();
			const answer = item
				.querySelector( '.blockish-accordion-item-content-inner' )
				?.textContent?.trim();

			if ( ! question || ! answer ) {
				return null;
			}

			return {
				'@type': 'Question',
				name: question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: answer,
				},
			};
		} )
		.filter( Boolean );

	if ( ! items.length ) {
		return null;
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items,
	};
};

const syncItemState = ( item, isOpen ) => {
	const details = item.querySelector( '.blockish-accordion-item-details' );
	const trigger = item.querySelector( '.blockish-accordion-item-trigger' );

	if ( ! details || ! trigger ) {
		return;
	}

	details.open = isOpen;
};

const mountAccordion = ( element ) => {
	const items = Array.from(
		element.querySelectorAll( '.blockish-accordion-item' )
	);
	const maxExpanded = element.dataset.maxExpanded || 'one';

	items.forEach( ( item ) => {
		const details = item.querySelector( '.blockish-accordion-item-details' );
		const trigger = item.querySelector( '.blockish-accordion-item-trigger' );

		if ( ! details || ! trigger ) {
			return;
		}

		syncItemState( item, details.open );

		trigger.addEventListener( 'click', ( event ) => {
			event.preventDefault();

			const willOpen = ! details.open;

			if ( willOpen && maxExpanded === 'one' ) {
				items.forEach( ( sibling ) => {
					if ( sibling !== item ) {
						syncItemState( sibling, false );
					}
				} );
			}

			syncItemState( item, willOpen );
		} );
	} );

	if ( element.dataset.faqSchema !== 'true' ) {
		return;
	}

	if ( element.querySelector( 'script[data-blockish-faq-schema]' ) ) {
		return;
	}

	const schema = getAccordionSchemaData( element );

	if ( ! schema ) {
		return;
	}

	const script = document.createElement( 'script' );
	script.type = 'application/ld+json';
	script.dataset.blockishFaqSchema = 'true';
	script.textContent = JSON.stringify( schema );
	element.appendChild( script );
};

const initAccordions = () => {
	document
		.querySelectorAll( '.wp-block-blockish-accordion' )
		.forEach( ( element ) => mountAccordion( element ) );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initAccordions );
} else {
	initAccordions();
}
