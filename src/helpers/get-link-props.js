import { prependHTTP } from '@wordpress/url';
import { escapeAttribute } from '@wordpress/escape-html';
const getLinkProps = (link) => {
    let origialUrl = link?.url;
    if (origialUrl && (!origialUrl.startsWith('http:') || !origialUrl.startsWith('https:') || origialUrl.startsWith('#'))) {
        origialUrl = prependHTTP(origialUrl);
    }
    let linkAttributes = {
        href: origialUrl,
        onClick: e => e.preventDefault(),
    }

    if (link?.newTab) {
        linkAttributes.target = '_blank';
        linkAttributes.rel = 'noopener'; // to handle wp default behavior
    }

    if (link?.noFollow) {
        linkAttributes.rel = linkAttributes.target == '_blank' ? 'nofollow noopener' : 'nofollow';
    }

    if (link?.customAttributes && link?.customAttributes.length > 0) {
        link?.customAttributes.forEach((attr) => {
            const [key, value] = attr.split('|');
            linkAttributes[key] = escapeAttribute(value);
        });
    }

    // If the link is dynamic content, add a data attribute to linkAttributes.
    if (link?.isDynamicContent) {
        linkAttributes['data-dynamic-content-url'] = JSON.stringify({...link, url: origialUrl});
        return linkAttributes;
    }


    return linkAttributes?.href ? linkAttributes : null;
}
export default getLinkProps;