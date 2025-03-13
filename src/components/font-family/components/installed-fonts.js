import {
    __experimentalNavigatorProvider as NavigatorProvider,
    __experimentalNavigatorScreen as NavigatorScreen,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import InstalledFontsList from './installed-font-list';
import InstalledFontItem from './installed-font-item';

const InstalledFonts = () => {
    const [selectedFont, setSelectedFont] = useState(null);
    return (
        <div className="blockish-font-modal-installed-fonts">
            <NavigatorProvider initialPath='/'>
                <NavigatorScreen path='/'>
                    <InstalledFontsList selectedFont={selectedFont} setSelectedFont={setSelectedFont} />
                </NavigatorScreen>
                <NavigatorScreen path='/active-font'>
                    <InstalledFontItem font={selectedFont} />
                </NavigatorScreen>
            </NavigatorProvider>
        </div>
    );
};

export default InstalledFonts;