// Marks the menu item linking to the current page/post with `is-active`.
// Runs for every .blockish-block-navmenu-item on the page, so items in both
// the desktop nav menu and the offcanvas panel get highlighted.
const getCurrentEntityId = () => {
	for ( const className of document.body.classList ) {
		if ( className.startsWith( 'page-id-' ) ) {
			return className.replace( 'page-id-', '' );
		}

		if ( className.startsWith( 'postid-' ) ) {
			return className.replace( 'postid-', '' );
		}
	}

	return '';
};

const markActiveItems = () => {
	const currentEntityId = getCurrentEntityId();
	const currentUrl = window.location.href.replace( /\/$/, '' );

	document.querySelectorAll( '.blockish-block-navmenu-item' ).forEach( ( item ) => {
		// Prefer matching the linked post/page ID against the current entity
		// (robust to trailing slashes, query args, http/https). Falls back to
		// a plain URL match for custom/external links with no underlying post.
		const link = item.querySelector( '.blockish-navmenu-item-link' );
		const isActive =
			currentEntityId && item.dataset.id
				? item.dataset.id === currentEntityId
				: link?.href?.replace( /\/$/, '' ) === currentUrl;

		if ( isActive ) {
			item.classList.add( 'is-active' );
		}
	} );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', markActiveItems );
} else {
	markActiveItems();
}
