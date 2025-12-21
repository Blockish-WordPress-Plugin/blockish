import {
    __experimentalDropdownContentWrapper as DropdownContentWrapper,
    __experimentalItem as Item,
    __experimentalHStack as HStack,
    __experimentalHeading as Heading,
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl,
    Button,
    Dropdown,
    Flex,
    FlexItem,
    Icon,
    ColorPalette
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { lineSolid, shadow } from '@wordpress/icons';

const BlockishBoxShadowItem = ({ onChange, itemIndex, itemArray, exclude = [] }) => {
    const { BlockishToggleGroup } = window.blockish.components;
    return (
        <Item as="div" className="blockish-box-shadow-item">
            <Dropdown
                className="blockish-box-shadow-item-dropdown"
                contentClassName="blockish-box-shadow-item-dropdown-content"
                popoverProps={{ 
                    placement: 'left-start',
                    offset: 36,
                    shift: true, 
                }}
                renderToggle={({ isOpen, onToggle }) => (
                    <HStack onClick={onToggle}>
                        <Heading level={5}>
                            <Flex gap={0} align='center'>
                                <FlexItem>
                                    <Icon display={'block'} icon={shadow} />
                                </FlexItem>
                                <FlexItem>
                                    {__(`Shadow ${parseInt(itemIndex) + 1}`)}
                                </FlexItem>
                            </Flex>
                        </Heading>
                        <div className="blockish-box-shadow-remove-button-wrapper">
                            <Button
                                className="blockish-box-shadow-remove-button"
                                onClick={() => {
                                    const newArray = [...itemArray];
                                    newArray.splice(parseInt(itemIndex, 10), 1);
                                    onChange(JSON.stringify(newArray));
                                }}
                                size="small"
                                label={__('Remove Shadow')}
                                showTooltip
                            >
                                {itemArray?.length > 1 ? <Icon icon={lineSolid} /> : null}
                            </Button>
                        </div>
                    </HStack>
                )}
                renderContent={() => {
                    return (
                        <DropdownContentWrapper className="blockish-box-shadow-item-dropdown-content-wrapper" paddingSize="medium">
                            <ColorPalette
                                value={itemArray[itemIndex]?.color}
                                enableAlpha={true}
                                onChange={(newValue) => {
                                    const newArray = [...itemArray];
                                    newArray[itemIndex] = { ...newArray[itemIndex], color: newValue };
                                    onChange(JSON.stringify(newArray));
                                }}
                                clearable={false}
                            />
                            {!exclude.includes('inset') && (
                                <BlockishToggleGroup 
                                    options={[
                                        { value: 'inset', label: __('Inset') },
                                        { value: '', label: __('Outset') },
                                    ]}
                                    value={itemArray[itemIndex]?.inset || ''}
                                    onChange={(nextValue) => {
                                        const newArray = [...itemArray];
                                        newArray[itemIndex] = { ...newArray[itemIndex], inset: nextValue };
                                        onChange(JSON.stringify(newArray));
                                    }}
                                />
                            )}
                            <Grid>
                                {!exclude.includes('x') && (
                                    <UnitControl
                                        label={__('X', 'blockish')}
                                        value={itemArray[itemIndex]?.x}
                                        onChange={(nextValue) => {
                                            const newArray = [...itemArray];
                                            newArray[itemIndex] = { ...newArray[itemIndex], x: nextValue };
                                            onChange(JSON.stringify(newArray));
                                        }}
                                    />
                                )}
                                {!exclude.includes('y') && (
                                    <UnitControl
                                        label={__('Y', 'blockish')}
                                        value={itemArray[itemIndex]?.y}
                                        onChange={(nextValue) => {
                                            const newArray = [...itemArray];
                                            newArray[itemIndex] = { ...newArray[itemIndex], y: nextValue };
                                            onChange(JSON.stringify(newArray));
                                        }}
                                    />
                                )}
                                {!exclude.includes('blur') && (
                                    <UnitControl
                                        label={__('Blur', 'blockish')}
                                        value={itemArray[itemIndex]?.blur}
                                        onChange={(nextValue) => {
                                            const newArray = [...itemArray];
                                            newArray[itemIndex] = { ...newArray[itemIndex], blur: nextValue };
                                            onChange(JSON.stringify(newArray));
                                        }}
                                    />
                                )}
                                {!exclude.includes('spread') && (
                                    <UnitControl
                                        label={__('Spread', 'blockish')}
                                        value={itemArray[itemIndex]?.spread}
                                        onChange={(nextValue) => {
                                            const newArray = [...itemArray];
                                            newArray[itemIndex] = { ...newArray[itemIndex], spread: nextValue };
                                            onChange(JSON.stringify(newArray));
                                        }}
                                    />
                                )}
                            </Grid>
                        </DropdownContentWrapper>
                    )
                }}
            />
        </Item>
    );
}

export default BlockishBoxShadowItem;
