import { addFilter } from '@wordpress/hooks';
import Inspector from './inspector';
import "./editor.scss";
import withClassManagerWrapperProp from './add-class';
import './edit';

addFilter('blockish.tabs.before-tab', 'blockish/class-manager/inspector-controls', Inspector, 10);
addFilter('blockish.blockWrapper.attributes', 'blockish/class-manager/addClass', withClassManagerWrapperProp, 10);
