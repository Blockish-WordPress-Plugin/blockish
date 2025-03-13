import { __ } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';
import InstalledFonts from './installed-fonts';
import FontsLibrary from './fonts-library';
const FontModal = ({ isOpen, onClose }) => {
    const { BlockishTab } = window.blockish.components;

    return (
        isOpen && (
            <Modal
                title={__('Fonts', 'blockish')}
                onRequestClose={onClose}
                isFullScreen
                className="font-library-modal"
            >
                <BlockishTab
                    tabs={[
                        {
                            name: 'install',
                            title: __('Install Fonts', 'blockish'),
                        },
                        {
                            name: 'library',
                            title: __('Library', 'blockish'),
                        },
                    ]}
                >
                    {
                        ({ name }) => {
                            switch (name) {
                                case 'install':
                                    return <InstalledFonts />;
                                case 'library':
                                    return <FontsLibrary />;
                                default:
                                    return null;
                            }
                        }
                    }
                </BlockishTab>
            </Modal>
        )
    );
};

export default FontModal;