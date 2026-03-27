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
import BlockishSelect from "./select";
import BlockishRangeUnit from "./range-unit";
import * as blockIcons from "./icons/block-icons";
import BlockishMediaUploader from "./media-uploader";
import BlockishBoxControl from "./box-control";
import BlockishBackground from "./background";
import BlockishBorder from "./border";
import BlockishBorderRadius from "./border-radius";
import BlockishBoxShadow from "./box-shadow";
import BlockishIconPicker from "./icon-picker";
import BlockishLink from "./link";
import BlockishNumber from "./number";
import BlockishDropdown from "./dropdown";
import BlockishToolsPanel from "./tools-panel";
import BlockishToggle from "./toggle";
import BlockishTypography from "./typography";
import BlockishFontFamily from "./font-family";
import BlockishImagePlaceholder from "./placeholder";
import BlockishCSSFilters from "./css-filters";
import BlockishDivider from "./divider";
import BlockishTextStroke from "./text-stroke";

if (window?.blockish?.screen) {
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
        BlockishSelect,
        BlockishRangeUnit,
        blockIcons,
        BlockishMediaUploader,
        BlockishBoxControl,
        BlockishBackground,
        BlockishBorder,
        BlockishBorderRadius,
        BlockishBoxShadow,
        BlockishIconPicker,
        BlockishLink,
        BlockishNumber,
        BlockishDropdown,
        BlockishToolsPanel,
        BlockishToggle,
        BlockishTypography,
        BlockishFontFamily,
        BlockishImagePlaceholder,
        BlockishCSSFilters,
        BlockishDivider,
        BlockishTextStroke,
    }
}
