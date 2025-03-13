import {
    __experimentalNavigatorProvider as NavigatorProvider,
    __experimentalNavigatorScreen as NavigatorScreen,
    __experimentalVStack as VStack,
    __experimentalHStack as HStack,
    __experimentalHeading as Heading,
    __experimentalText as Text,
    __experimentalSpacer as Spacer,
    SearchControl,
    SelectControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { fetchFonts } from '../includes';
import { __ } from '@wordpress/i18n';
import FontsCard from './fonts-card';
import FontLibraryFooter from './font-library-footer';
import FontItem from './font-item';
const FontsLibrary = () => {
    const [fontsCollection, setFontsCollection] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [category, setCategory] = useState('');
    const [selectedFont, setSelectedFont] = useState(null);
    const [selectedFontFaces, setSelectedFontFaces] = useState([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [successNotice, setSuccessNotice] = useState(false);
    
    useEffect(() => {
        const getFonts = async () => {
            const fontsData = await fetchFonts({
                per_page: 10,
                page: currentPage,
                search: searchInput,
                category: category
            });
            setFontsCollection(fontsData);
        }

        getFonts();
    }, [searchInput, currentPage, category]);

    return (
        <div className="blockish-fonts-library">
            {
                currentPath === '/' ? (
                    <VStack className="blockish-fonts-library-header">
                        <Heading level={5} className="blockish-fonts-library-title">{__('Google Fonts', 'blockish')}</Heading>
                        <Text className="blockish-fonts-library-description">
                            {
                                __('Install from Google Fonts. Fonts are copied to and served from your site.', 'blockish')
                            }
                        </Text>
                        <HStack>
                            <VStack>
                                <Heading level={5} className="blockish-fonts-library-title">{__('Google Fonts', 'blockish')}</Heading>
                                <SearchControl
                                    __nextHasNoMarginBottom
                                    value={searchInput}
                                    onChange={setSearchInput}
                                />
                            </VStack>
                            <VStack>
                                <Heading level={5} className="blockish-fonts-library-title">{__('Category', 'blockish')}</Heading>
                                <SelectControl
                                    __nextHasNoMarginBottom
                                    value={category}
                                    onChange={setCategory}
                                    options={[
                                        { label: __('All', 'blockish'), value: '' },
                                        { label: __('Serif', 'blockish'), value: 'serif' },
                                        { label: __('Sans Serif', 'blockish'), value: 'sans-serif' },
                                        { label: __('Display', 'blockish'), value: 'display' },
                                        { label: __('Handwriting', 'blockish'), value: 'handwriting' },
                                        { label: __('Monospace', 'blockish'), value: 'monospace' },
                                    ]}
                                />
                            </VStack>
                        </HStack>
                        <Spacer marginTop={4} />
                    </VStack>
                ) : null
            }
            <NavigatorProvider initialPath='/'>
                <NavigatorScreen path='/'>
                    <FontsCard
                        fonts={fontsCollection?.fonts || []}
                        onSelect={(font) => {
                            setSelectedFont(font);
                            setCurrentPath('/font');
                        }}
                    />
                </NavigatorScreen>
                <NavigatorScreen path='/font'>
                    <FontItem
                        selectedFont={selectedFont}
                        selectedFontFaces={selectedFontFaces}
                        setSelectedFontFaces={setSelectedFontFaces}
                        setSelectedFont={setSelectedFont}
                        setCurrentPath={setCurrentPath}
                        setNotice={setSuccessNotice}
                        notice={successNotice}
                    />
                </NavigatorScreen>
            </NavigatorProvider>
            <Spacer marginTop={17.5} />
            <FontLibraryFooter
                currentPath={currentPath}
                fontsCollection={fontsCollection}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                selectedFont={selectedFont}
                selectedFontFaces={selectedFontFaces}
                setSelectedFontFaces={setSelectedFontFaces}
                setNotice={setSuccessNotice}
            />
        </div>
    )
}

export default FontsLibrary;