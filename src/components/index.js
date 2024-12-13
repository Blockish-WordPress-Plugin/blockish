import "./scss/main.scss";

import BlockishColor from "./color";
import BlockishFontSizePicker from "./fontsize-picker";
import BlockishPanelBody from "./panelbody";
import BlockishSpacingSizes from "./spacing-sizes";
import BlockishStyleTag from "./style-tag";
import BlockishToggleGroup from "./toggle-group";
import BlockishTab from "./tab";
import BlockishConditionalWrapper from "./conditional-wrapper";
import BlockishResponsive from "./responsive";
import BlockishRangeControl from "./range-control";
import BlockishTextareaControl from "./textarea-control";
import BlockishSelectControl from "./select-control";

if(window?.blockish?.screen) {
    window.blockish.components = {
        ...window?.wp?.components,
        BlockishColor,
        BlockishFontSizePicker,
        BlockishPanelBody,
        BlockishSpacingSizes,
        BlockishStyleTag,
        BlockishToggleGroup,
        BlockishTab,
        BlockishConditionalWrapper,
        BlockishResponsive,
        BlockishRangeControl,
        BlockishTextareaControl,
        BlockishSelectControl
    }
}