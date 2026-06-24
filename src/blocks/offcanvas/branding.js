import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

// Editor-side preview of the offcanvas header branding. The frontend renders
// the equivalent in render.php (so site title/logo stay live), this just
// mirrors it inside the editor.
export default function Branding( { headerType, headerText, headerImage } ) {
	const { siteTitle, siteLogoUrl } = useSelect( ( select ) => {
		const site = select( 'core' ).getEntityRecord( 'root', 'site' );
		const logoId = site?.site_logo;
		const media = logoId ? select( 'core' ).getMedia( logoId ) : null;

		return {
			siteTitle: site?.title,
			siteLogoUrl: media?.source_url,
		};
	}, [] );

	if ( headerType === 'none' ) {
		return null;
	}

	if ( headerType === 'siteTitle' ) {
		return (
			<span className="blockish-offcanvas-site-title">
				{ siteTitle || __( 'Site Title', 'blockish' ) }
			</span>
		);
	}

	if ( headerType === 'siteLogo' ) {
		return siteLogoUrl ? (
			<img src={ siteLogoUrl } alt={ siteTitle || '' } />
		) : (
			<span className="blockish-offcanvas-site-title">
				{ __( 'No site logo set', 'blockish' ) }
			</span>
		);
	}

	if ( headerType === 'customImage' ) {
		return headerImage?.url ? (
			<img src={ headerImage.url } alt={ headerImage.alt || '' } />
		) : (
			<span className="blockish-offcanvas-site-title">
				{ __( 'Add a logo', 'blockish' ) }
			</span>
		);
	}

	if ( headerType === 'customText' ) {
		return (
			<span className="blockish-offcanvas-site-title">
				{ headerText || __( 'Add header text', 'blockish' ) }
			</span>
		);
	}

	return null;
}
