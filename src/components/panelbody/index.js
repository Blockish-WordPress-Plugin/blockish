import { PanelBody } from '@wordpress/components';

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
        <PanelBody title={title} {...props}>
            <div className="blockish-panel-body-content">
                {children ? children : <p>Add your content here.</p>}
            </div>
        </PanelBody>
    );
};

export default BlockishPanelBody;
