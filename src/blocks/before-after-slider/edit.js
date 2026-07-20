import { __ } from '@wordpress/i18n';
import { useBlockProps, MediaPlaceholder } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useState, useRef, useEffect } from '@wordpress/element';
import { useMergeRefs } from '@wordpress/compose';
import Inspector from './inspector';
import './editor.scss';

export default function Edit({ attributes, setAttributes, advancedControls, clientId }) {
    const { beforeImage, afterImage, sliderPosition, beforeLabel, afterLabel } = attributes;
    const [localSliderPos, setLocalSliderPos] = useState(sliderPosition || 50);
    const containerRef = useRef(null);

    const blockProps = useBlockProps({
        ref: useMergeRefs([containerRef]),
        className: 'blockish-before-after-slider',
        style: {
            '--slider-pos': `${localSliderPos}%`
        }
    });

    useEffect(() => {
        setLocalSliderPos(sliderPosition || 50);
    }, [sliderPosition]);

    const dragHandlers = useRef({});

    if (!dragHandlers.current.start) {
        dragHandlers.current.move = (e) => {
            if (!containerRef.current) return;
            
            const containerRect = containerRef.current.getBoundingClientRect();
            let clientX = e.clientX;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
            }

            let x = clientX - containerRect.left;
            let percentage = (x / containerRect.width) * 100;

            // Clamp between 0 and 100
            percentage = Math.max(0, Math.min(percentage, 100));
            setLocalSliderPos(percentage);
        };

        dragHandlers.current.end = () => {
            const docWindow = containerRef.current?.ownerDocument?.defaultView || window;
            docWindow.removeEventListener('mousemove', dragHandlers.current.move);
            docWindow.removeEventListener('mouseup', dragHandlers.current.end);
            docWindow.removeEventListener('touchmove', dragHandlers.current.move);
            docWindow.removeEventListener('touchend', dragHandlers.current.end);
        };

        dragHandlers.current.start = (e) => {
            e.preventDefault(); // Prevent text selection/image dragging
            const docWindow = containerRef.current?.ownerDocument?.defaultView || window;
            docWindow.addEventListener('mousemove', dragHandlers.current.move);
            docWindow.addEventListener('mouseup', dragHandlers.current.end);
            docWindow.addEventListener('touchmove', dragHandlers.current.move, { passive: false });
            docWindow.addEventListener('touchend', dragHandlers.current.end);
        };
    }

    const onSelectBeforeImage = (media) => {
        if (media && media.url) {
            setAttributes({ beforeImage: { id: media.id, url: media.url, alt: media.alt } });
        }
    };

    const onSelectAfterImage = (media) => {
        if (media && media.url) {
            setAttributes({ afterImage: { id: media.id, url: media.url, alt: media.alt } });
        }
    };

    const removeBeforeImage = () => setAttributes({ beforeImage: undefined });
    const removeAfterImage = () => setAttributes({ afterImage: undefined });

    return (
        <>
            <Inspector
                attributes={attributes}
                setAttributes={setAttributes}
                advancedControls={advancedControls}
            />
            <div {...blockProps}>
                {(!beforeImage || !afterImage) && (
                    <div className="blockish-before-after-setup">
                        <div className="setup-column">
                            <h4>{__('Before Image', 'blockish')}</h4>
                            {!beforeImage ? (
                                <MediaPlaceholder
                                    onSelect={onSelectBeforeImage}
                                    allowedTypes={['image']}
                                    multiple={false}
                                    labels={{ title: 'Select Before Image' }}
                                />
                            ) : (
                                <div className="image-preview-wrapper">
                                    <img src={beforeImage.url} alt={beforeImage.alt || 'Before'} />
                                    <Button isDestructive variant="link" onClick={removeBeforeImage}>
                                        {__('Remove Image', 'blockish')}
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="setup-column">
                            <h4>{__('After Image', 'blockish')}</h4>
                            {!afterImage ? (
                                <MediaPlaceholder
                                    onSelect={onSelectAfterImage}
                                    allowedTypes={['image']}
                                    multiple={false}
                                    labels={{ title: 'Select After Image' }}
                                />
                            ) : (
                                <div className="image-preview-wrapper">
                                    <img src={afterImage.url} alt={afterImage.alt || 'After'} />
                                    <Button isDestructive variant="link" onClick={removeAfterImage}>
                                        {__('Remove Image', 'blockish')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {beforeImage && afterImage && (
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
                        <div 
                            className="blockish-slider-handle"
                            onMouseDown={dragHandlers.current.start}
                            onTouchStart={dragHandlers.current.start}
                        >
                            <div className="blockish-slider-handle-arrows">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 12L11 9V15L8 12Z" fill="currentColor"/>
                                    <path d="M16 12L13 9V15L16 12Z" fill="currentColor"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
