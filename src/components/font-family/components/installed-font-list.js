import {
    __experimentalUseNavigator as useNavigator,
    __experimentalVStack as VStack,
    __experimentalItemGroup as ItemGroup,
    __experimentalItem as Item,
    __experimentalText as Text,
    Flex,
    FlexItem,
    FlexBlock,
    Spinner,
    Icon
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEntityRecords } from '@wordpress/core-data';

const InstalledFontsList = ({ setSelectedFont }) => {
    const { records, isResolving } = useEntityRecords(
        'postType',
        'blockish-fonts',
        {
            per_page: -1
        }
    )

    const { goTo } = useNavigator();

    if (isResolving) {
        return (
            <VStack>
                <Spinner />
            </VStack>
        )
    }
    return (
        <VStack>
            <ItemGroup className='blockish-fonts-library-list' isBordered isSeparated>
                {
                    records?.map((font, index) => {
                        const preview = font?.meta?.preview;
                        const fontFaces = font?.meta?.font_faces;
                        const totalVariations = font?.meta?.total_variants;
                        const title = font?.title?.rendered;
                        return (
                            <Item 
                                key={index} 
                                className="blockish-fonts-library-item"
                                onClick={() => {
                                    goTo('/active-font');
                                    setSelectedFont(font);
                                }}
                            >
                                <Flex>
                                    <FlexBlock>
                                        <img src={preview} alt={title} />
                                    </FlexBlock>
                                    <FlexItem>
                                        <Flex>
                                            <Text>{`${fontFaces?.length}/${totalVariations} variants active`}</Text>
                                            <Icon icon='arrow-right-alt2' />
                                        </Flex>
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

export default InstalledFontsList;