import {
    __experimentalUseNavigator as useNavigator,
    __experimentalSpacer as Spacer,
    Button
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getFontByID } from '../includes';
import FontItem from './font-item';
const InstalledFontItem = ({ font }) => {
    const { goTo } = useNavigator();
    const [fontFullData, setFontFullData] = useState(null);
    const [selectedFontFaces, setSelectedFontFaces] = useState(font?.meta?.font_faces || []);
    const [currentPath, setCurrentPath] = useState('/');
    const [successNotice, setSuccessNotice] = useState(false);
    useEffect(() => {
        const getFont = async () => {
            if (font?.slug) {
                const fontData = await getFontByID(font.slug);
                if (fontData) {
                    setFontFullData(fontData);
                }
            }
        };

        getFont();
    }, [font?.slug]);

    if (!fontFullData) {
        return null;
    }

    return (
        <>
            <FontItem
                selectedFont={fontFullData}
                setSelectedFont={setFontFullData}
                selectedFontFaces={selectedFontFaces}
                setSelectedFontFaces={setSelectedFontFaces}
                setCurrentPath={setCurrentPath}
                notice={successNotice}
                setNotice={setSuccessNotice}
            />
            <Spacer />
            <Button
                className="blockish-font-item-update-button"
                variant='primary'
                onClick={() => {
                    goTo("/");
                    setCurrentPath('/');
                }}
            >
                {__('Update', 'blockish')}
            </Button>
        </>
    );
}
export default InstalledFontItem;