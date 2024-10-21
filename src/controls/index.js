import BoilerplateControl from './control';
import BoilerplateResponsiveControl from './responsive-control';

if (window?.boilerplateBlocks?.screen) {
    window.boilerplateBlocks.controls = {
        BoilerplateControl,
        BoilerplateResponsiveControl
    }
}