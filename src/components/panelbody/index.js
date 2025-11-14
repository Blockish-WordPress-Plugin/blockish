import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * BlockishPanelBody Component
 * 
 * Renders a WordPress PanelBody component with a customizable title.
 * Additional props can be passed for further customization.
 * 
 * @param {string} title - The title of the PanelBody (default: 'Blockish Panel Body').
 * @param {ReactNode} children - The content inside the PanelBody.
 * @param {Object} props - Additional props passed to the PanelBody component.
 */
const BlockishPanelBody = ({ title = 'Blockish Panel Body', children, ...props }) => {
    return (
        <PanelBody title={title} initialOpen={props?.initialOpen || false} {...props}>
            <div className="blockish-panel-body-content">
                {children ? children : <p>{__( 'Add your content here.', 'blockish' )}</p>}
            </div>
        </PanelBody>
    );
};

export default BlockishPanelBody;
