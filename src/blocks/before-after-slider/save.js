import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { beforeImage, afterImage, sliderPosition, beforeLabel, afterLabel } = attributes;

    const blockProps = useBlockProps.save({
        className: 'blockish-before-after-slider',
        style: {
            '--slider-pos': `${sliderPosition || 50}%`
        }
    });

    if (!beforeImage || !afterImage) {
        return null;
    }

    return (
        <div {...blockProps}>
            <div className="blockish-slider-wrapper">
                <img 
                    src={afterImage.url} 
                    alt={afterImage.alt || 'After Image'} 
                    className="blockish-image-after blockish-image-base" 
                />
                {afterLabel && (
                    <span className="blockish-slider-label after-label">
                        {afterLabel}
                    </span>
                )}
                <div className="blockish-image-before-wrapper">
                    <img 
                        src={beforeImage.url} 
                        alt={beforeImage.alt || 'Before Image'} 
                        className="blockish-image-before blockish-image-base" 
                    />
                    {beforeLabel && (
                        <span className="blockish-slider-label before-label">
                            {beforeLabel}
                        </span>
                    )}
                </div>
                <div className="blockish-slider-handle">
                    <div className="blockish-slider-handle-arrows">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 12L11 9V15L8 12Z" fill="currentColor"/>
                            <path d="M16 12L13 9V15L16 12Z" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
