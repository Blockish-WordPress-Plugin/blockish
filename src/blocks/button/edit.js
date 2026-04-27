import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import './editor.scss';
import Inspector from './inspector';

export default function Edit({ attributes, setAttributes, advancedControls }) {
    const { getLinkProps, BlockishIcon } = window.blockish.helpers;

    const blockProps = useBlockProps({
        className: 'blockish-button',
    });

    const linkProps = {
        ...getLinkProps(attributes.url),
        className: 'blockish-button-link',
    }

    return (
        <>
            <Inspector attributes={attributes} setAttributes={setAttributes} advancedControls={advancedControls} />
            <div {...blockProps}>
                <a {...linkProps}>
                    <RichText
                        tagName="span"
                        value={attributes?.text}
                        allowedFormats={[]}
                        onChange={(value) => setAttributes({ text: value })}
                        placeholder={__('Button Text', 'blockish')}
                    />
                    <BlockishIcon className="blockish-button-icon" icon={attributes?.icon} fill="currentColor" />
                </a>
            </div>
        </>
    );
}
