import {
    Icon,
    Flex,
    FlexItem,
    FlexBlock,
    __experimentalText as Text,
    __experimentalVStack as VStack,
    __experimentalSpacer as Spacer,
    __experimentalUseNavigator as useNavigator,
    __experimentalItemGroup as ItemGroup,
    __experimentalItem as Item,
    CheckboxControl,
    Notice
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const FontItem = ({ selectedFont, selectedFontFaces, setSelectedFontFaces, setSelectedFont, setCurrentPath, notice, setNotice }) => {
    const { goTo } = useNavigator();
    
    const settings = selectedFont?.font_family_settings;
    const fontName = settings?.name;
    
    return (
        <VStack className="blockish-font-item">
            <Flex
                className="blockish-font-item-header"
                onClick={() => {
                    goTo("/");
                    setCurrentPath('/');
                    setSelectedFont(null);
                    setSelectedFontFaces([]);
                }}
            >
                <FlexItem>
                    <Icon icon={'arrow-left-alt2'} />
                </FlexItem>
                <FlexBlock>
                    <Text className="blockish-font-item-name">{fontName}</Text>
                </FlexBlock>
            </Flex>
            {
                notice && (
                    <Notice
                        className="blockish-font-item-notice"
                        status={'success'}
                        onDismiss={() => {
                            setNotice(false);
                        }}
                    >
                        { __("Fonts were installed successfully.", 'blockish') }
                    </Notice>
                )
            }
            <Text>{__('Select font variants to install.', 'blockish')}</Text>
            <Spacer marginTop={5} />
            <VStack>
                <CheckboxControl
                    label={__('Select all', 'blockish')}
                    checked={selectedFontFaces?.length === settings?.fontFace?.length}
                    className="blockish-font-item-checkbox"
                    __nextHasNoMarginBottom={true}
                    onChange={(checked) => {
                        if (checked) {
                            setSelectedFontFaces(settings?.fontFace);
                        } else {
                            setSelectedFontFaces([]);
                        }
                    }}
                />
                <ItemGroup isBordered isSeparated className="blockish-font-item-font-variants">
                    {
                        settings?.fontFace.map((fontFace, index) => {
                            return (
                                <Item key={index}>
                                    <CheckboxControl
                                        label={<img src={fontFace.preview} alt={`${fontFace.fontFamily} ${fontFace.fontWeight} ${fontFace.fontStyle}`} />}
                                        __nextHasNoMarginBottom={true}
                                        checked={selectedFontFaces?.length > 0 && selectedFontFaces.findIndex(font => JSON.stringify(font) === JSON.stringify(fontFace)) !== -1}
                                        className="blockish-font-item-checkbox"
                                        onChange={(checked) => {
                                            if (checked) {
                                                setSelectedFontFaces([...selectedFontFaces, fontFace]);
                                            } else {
                                                setSelectedFontFaces(selectedFontFaces.filter(font => JSON.stringify(font) !== JSON.stringify(fontFace)));
                                            }
                                        }}
                                    />
                                </Item>
                            )
                        })
                    }
                </ItemGroup>
            </VStack>
        </VStack>
    )
}
export default FontItem;