import { __ } from '@wordpress/i18n';
import { rotateRight } from '@wordpress/icons';

const Transform = ({ attributes }) => {
    const { BlockishControl, BlockishResponsiveControl } = window?.blockish?.controls;
    const { useDeviceType, getResponsiveValue } = window?.blockish?.helpers;
    const device = useDeviceType();
    return (
        <BlockishControl type='BlockishPanelBody' title={__('Transform', 'blockish')}>
            <BlockishControl
                type="BlockishTab"
                tabs={[
                    {
                        name: 'transform-normal',
                        title: 'Normal'
                    },
                    {
                        name: 'transform-hover',
                        title: 'Hover'
                    }
                ]}
            >
                {({ name: tabName }) => (
                    <>
                        {
                            tabName === 'transform-normal' && (
                                <>
                                    <BlockishControl
                                        type="BlockishDropdown"
                                        label={__('Rotation', 'blockish')}
                                        icon={rotateRight}
                                    >
                                        <BlockishResponsiveControl
                                            type='BlockishRangeUnit'
                                            label={__('Rotation', 'blockish')}
                                            slug='transformRotation'
                                            left="55px"
                                            splitOnAxis={true}
                                            min="-360"
                                            max="360"
                                            step="15"
                                            unit="deg"
                                        />
                                    </BlockishControl>
                                </>
                            )
                        }
                    </>
                )}
            </BlockishControl>
        </BlockishControl>
    )
}
export default Transform;