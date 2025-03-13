import {
    __experimentalVStack as VStack,
    __experimentalUseNavigator as useNavigator,
    __experimentalHeading as Heading,
    __experimentalItemGroup as ItemGroup,
    __experimentalItem as Item,
    __experimentalText as Text,
    Flex,
    FlexItem,
    FlexBlock,
    Icon
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const FontsCard = ({ fonts = [], onSelect, title }) => {
    const { goTo } = useNavigator();
    
    if (!fonts.length) {
        return (
            <VStack className="blockish-fonts-card">                {
                title && (
                    <Heading level={5} className="blockish-fonts-library-title">{title}</Heading>
                )
            }
                <Text className="blockish-fonts-library-empty">{__('No fonts found', 'blockish')}</Text>
            </VStack>
        )
    }

    return (
        <VStack className="blockish-fonts-card">
            {
                title && (
                    <Heading level={5} className="blockish-fonts-library-title">{title}</Heading>
                )
            }
            <ItemGroup className='blockish-fonts-library-list' isBordered isSeparated>
                {
                    fonts.map((font, index) => {
                        const settings = font?.font_family_settings;
                        const fontName = settings?.name;
                        const previweUrl = settings?.preview;
                        const variations = settings?.fontFace;

                        return (
                            <Item className="blockish-fonts-library-item" key={index} onClick={() => {
                                onSelect(font);
                                goTo('/font');
                            }}>
                                <Flex>
                                    <FlexBlock>
                                        {
                                            previweUrl ? (
                                                <img src={previweUrl} alt={fontName} className="blockish-fonts-library-font-preview" />
                                            ) : (
                                                <Text className="blockish-fonts-library-font-name">{fontName}</Text>
                                            )
                                        }
                                    </FlexBlock>
                                    <FlexItem>
                                        {
                                            variations?.length > 0 && (
                                                <Text>{`${variations?.length} variant`}</Text>
                                            )
                                        }
                                        <Icon icon={'arrow-right-alt2'} className="blockish-fonts-library-nav-icon" />
                                    </FlexItem>
                                </Flex>
                            </Item>
                        )
                    })
                }
            </ItemGroup>
        </VStack>
    )
}

export default FontsCard;