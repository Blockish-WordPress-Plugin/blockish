import BlockishControl from './control';
import BlockishResponsiveControl from './responsive-control';

if (window?.blockish?.screen) {
    window.blockish.controls = {
        BlockishControl,
        BlockishResponsiveControl
    }
}