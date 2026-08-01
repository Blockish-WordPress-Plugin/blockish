import { addFilter } from '@wordpress/hooks';
import './inspector';
import withVisibilityWrapperProp from './add-class';
import './editor.scss';
import './style.scss';

addFilter(
	'blockish.blockWrapper.attributes',
	'blockish/visibility/addClass',
	withVisibilityWrapperProp,
	20
);
