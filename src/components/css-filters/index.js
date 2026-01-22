import { __ } from "@wordpress/i18n";
import { pencil, rotateRight } from "@wordpress/icons";
import { Button, __experimentalHStack as HStack, __experimentalText as Text, Flex, FlexItem, FlexBlock, __experimentalVStack as VStack, RangeControl } from "@wordpress/components";
import { useMemo } from "@wordpress/element";
import blur from "./images/blur.png";
import contrast from "./images/contrast.png";
import grayscale from "./images/grayscale.png";
import invert from "./images/invert.png";
import sepia from "./images/sepia.png";


const BlockishCSSFilters = ({ label = __('CSS Filters', 'blockish'), value, onChange, excludes = [] }) => {
    const { BlockishDropdown } = window.blockish.components;
    const excludeFilters = new Set(excludes);
    const usableValue = value && typeof value == 'string' ? JSON.parse(value) : value;
    const handleFilterChange = (filter) => {
        const newValue = {
            ...usableValue,
            ...filter
        };
        onChange(JSON.stringify(newValue));
    };
    const hasValue = useMemo(() => {
        if (!usableValue) return false;
        return Object.values(usableValue).some(value => value !== 0);
    }, [usableValue]);

    return (
        <div className="blockish-css-filters blockish-control blockish-group-control">
            <BlockishDropdown
                renderToggle={({ isOpen, onToggle }) => (
                    <Flex>
                        <FlexBlock>
                            <Button
                                className="blockish-css-filters-button blockish-css-filters-toggle"
                                variant="secondary"
                                onClick={onToggle}
                                aria-expanded={isOpen}
                            >
                                <HStack justify='center' gap={2}>
                                    {pencil}
                                    <Text>{label}</Text>
                                </HStack>
                            </Button>
                        </FlexBlock>
                        <FlexItem>
                            <Button
                                className="blockish-css-filters-button blockish-css-filters-reset"
                                variant="secondary"
                                icon={rotateRight}
                                onClick={() => onChange('')}
                                disabled={!hasValue}
                            />
                        </FlexItem>
                    </Flex>
                )}
            >
                <div className="blockish-css-filters-content">
                    <VStack>
                        {!excludeFilters.has('blur') && (
                            <div
                                className="blockish-css-filters-range blockish-css-filters-blur"
                                style={{ '--track-background': `url(${blur})` }}
                            >
                                <RangeControl
                                    label={__('Blur', 'blockish')}
                                    value={usableValue?.blur}
                                    onChange={(blur) => handleFilterChange({ blur })}
                                    min={0}
                                    max={10}
                                    step={0.1}
                                />
                            </div>
                        )}
                        {!excludeFilters.has('brightness') && (
                            <div
                                className="blockish-css-filters-range blockish-css-filters-brightness"
                            >
                                <RangeControl
                                    label={__('Brightness', 'blockish')}
                                    value={usableValue?.brightness}
                                    onChange={(brightness) => handleFilterChange({ brightness })}
                                    min={0}
                                    max={200}
                                />
                            </div>
                        )}
                        {!excludeFilters.has('contrast') && (
                            <div
                                className="blockish-css-filters-range blockish-css-filters-contrast"
                                style={{ '--track-background': `url(${contrast})` }}
                            >
                                <RangeControl
                                    label={__('Contrast', 'blockish')}
                                    value={usableValue?.contrast}
                                    onChange={(contrast) => handleFilterChange({ contrast })}
                                    min={0}
                                    max={200}
                                />
                            </div>
                        )}
                        {!excludeFilters.has('saturation') && (
                            <div
                                className="blockish-css-filters-range blockish-css-filters-saturation"
                            >
                                <RangeControl
                                    label={__('Saturation', 'blockish')}
                                    value={usableValue?.saturate}
                                    onChange={(saturate) => handleFilterChange({ saturate })}
                                    min={0}
                                    max={200}
                                />
                            </div>
                        )}
                        {!excludeFilters.has('hue') && (
                            <div
                                className="blockish-css-filters-range blockish-css-filters-hue"
                            >
                                <RangeControl
                                    label={__('Hue', 'blockish')}
                                    value={usableValue?.['hue-rotate']}
                                    onChange={(hueRotate) => handleFilterChange({ 'hue-rotate': hueRotate })}
                                    min={0}
                                    max={360}
                                />
                            </div>
                        )}
                        {!excludeFilters.has('invert') && (
                            <div
                                className="blockish-css-filters-range blockish-css-filters-invert"
                                style={{ '--track-background': `url(${invert})` }}
                            >
                                <RangeControl
                                    label={__('Invert', 'blockish')}
                                    value={usableValue?.invert}
                                    onChange={(invert) => handleFilterChange({ invert })}
                                    min={0}
                                    max={100}
                                />
                            </div>
                        )}
                        {!excludeFilters.has('grayscale') && (
                            <div
                                className="blockish-css-filters-range blockish-css-filters-grayscale"
                                style={{ '--track-background': `url(${grayscale})` }}
                            >
                                <RangeControl
                                    label={__('Grayscale', 'blockish')}
                                    value={usableValue?.grayscale}
                                    onChange={(grayscale) => handleFilterChange({ grayscale })}
                                    min={0}
                                    max={200}
                                />
                            </div>
                        )}
                        {!excludeFilters.has('sepia') && (
                            <div
                                className="blockish-css-filters-range blockish-css-filters-sepia"
                                style={{ '--track-background': `url(${sepia})` }}
                            >
                                <RangeControl
                                    label={__('Sepia', 'blockish')}
                                    value={usableValue?.sepia}
                                    onChange={(sepia) => handleFilterChange({ sepia })}
                                    min={0}
                                    max={100}
                                />
                            </div>
                        )}
                    </VStack>
                </div>
            </BlockishDropdown>
        </div>
    )
}

export default BlockishCSSFilters