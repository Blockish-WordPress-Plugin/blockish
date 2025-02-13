import BlockishControl from './control';
import BlockishResponsiveControl from './responsive-control';
import BlockishGroupControl from './group-control';

if (window?.blockish?.screen) {
    window.blockish.controls = {
        BlockishControl,
        BlockishResponsiveControl,
        BlockishGroupControl
    }
}