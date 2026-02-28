import {
    MediaUpload,
    MediaUploadCheck
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import {
    Button,
    __experimentalHStack as HStack,
    BaseControl
} from '@wordpress/components';
import { useRef } from '@wordpress/element';

const instructions = (
    <p>
        {__(
            'To edit the image, you need permissions to upload media.',
            'blockish'
        )}
    </p>
);

const ALLOWED_MEDIA_TYPES = ['image'];

const BlockishMediaUploader = ({ label = __('Image', 'blockish'), placeholder = __('Upload Image', 'blockish'), value, onChange, allowedTypes = ALLOWED_MEDIA_TYPES, isInheritedValue = false }) => {
    const toggleRef = useRef();
    const videoRef = useRef();
    const backgroundImageStyleProps = {};
    if (value?.url) {
        backgroundImageStyleProps.backgroundImage = `url(${value?.url})`;

        if (isInheritedValue){
            backgroundImageStyleProps.opacity = '0.5';
        }
    }
    
    return (
        <div className="blockish-control blockish-media-uploader">
            <BaseControl label={label} __nextHasNoMarginBottom={true}>
                <MediaUploadCheck fallback={instructions}>
                    <MediaUpload
                        title={label}
                        value={value?.id}
                        onSelect={(media) => {
                            onChange({
                                id: media.id,
                                url: media.url,
                                alt: media.alt,
                                title: media.title,
                                caption: media.caption,
                                description: media.description,
                                width: media.width,
                                height: media.height,
                                sizes: media.sizes,
                                type: media.type,
                            });
                        }}
                        allowedTypes={allowedTypes}
                        modalClass="blockish-media-uploader-modal"
                        render={({ open }) => (
                            <div className="blockish-media-uploader-wrapper">
                                <Button
                                    ref={toggleRef}
                                    className={
                                        !value?.id ? 'blockish-media-uploader-toggle' : 'blockish-media-uploader-preview'
                                    }
                                    __next40pxDefaultSize
                                    onClick={open}
                                    aria-label={
                                        !value?.id
                                            ? null
                                            : __('Edit or replace the image')
                                    }
                                    aria-describedby={
                                        !value?.id
                                            ? null
                                            : `blockish-media-uploader-${value?.id}-describedby`
                                    }
                                >
                                    {backgroundImageStyleProps?.backgroundImage && value?.type !== 'video' && (
                                        <div className="blockish-media-uploader-image-wrapper">
                                            <div
                                                className="blockish-media-uploader-image"
                                                style={backgroundImageStyleProps}
                                            ></div>
                                        </div>
                                    )}
                                    {value?.type === 'video' && value?.url && (
                                        <video
                                            onContextMenu={(e) => e.preventDefault()}
                                        >
                                            <source src={`${value?.url}?muted=1&controls=0&autoplay=0&t=0`} />
                                        </video>
                                    )}
                                    {!value?.id && placeholder}
                                </Button>
                                {!!value?.id && (
                                    <HStack className="blockish-media-uploader-actions">
                                        <Button
                                            className="blockish-media-uploader-image-action"
                                            onClick={open}
                                            aria-hidden="true"
                                        >
                                            {__('Replace')}
                                        </Button>
                                        <Button
                                            className="blockish-media-uploader-image-action"
                                            onClick={() => {
                                                onChange(null);
                                                toggleRef.current.focus();
                                            }}
                                        >
                                            {__('Remove')}
                                        </Button>
                                    </HStack>
                                )}
                            </div>
                        )}
                    />
                </MediaUploadCheck>
            </BaseControl>
        </div>
    )
}

export default BlockishMediaUploader;