import blockNameCamelcase from "./block-name-camelcase";
import generateBackgroundControlStyles from "./generate-background-control-styles";
import generateCssString from "./generate-css-string";
import generateStyles from "./generate-styles";
import { getSpacingValue } from "./get-css";
import getResponsiveValue from "./get-responsive-value";
import isResponsiveValue from "./is-responsive-value";
import replaceCssPlaceholders from "./replace-css-placeholder";
import replaceString from "./replace-string";
import reservedPlaceholder from "./reserved-placeholder";
import { setDeviceType } from "./set-device-type";
import setResponsiveValue from "./set-responsive-value";
import useDeviceList from "./use-device-list";
import useDeviceType from "./use-device-type";
import useGenerateStyles from "./use-generate-style";
import useInheritResponsiveValue from "./use-inherit-responsive-value";

if( window?.blockish?.screen ){
    window.blockish.helpers = {
        generateStyles,
        useGenerateStyles,
        getSpacingValue,
        blockNameCamelcase,
        useDeviceType,
        setDeviceType,
        useDeviceList,
        getResponsiveValue,
        setResponsiveValue,
        replaceCssPlaceholders,
        replaceString,
        reservedPlaceholder,
        generateCssString,
        isResponsiveValue,
        useInheritResponsiveValue,
        generateBackgroundControlStyles
    }
}