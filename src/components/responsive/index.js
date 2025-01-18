import { __ } from '@wordpress/i18n';
import { DropdownMenu } from '@wordpress/components';
import { useRef, memo } from '@wordpress/element';
const BlockishResponsive = ({ children, left }) => {

    const { useDeviceList, setDeviceType, useDeviceType } = window.blockish.helpers;
    const responsiveRef = useRef();
    const deviceList = useDeviceList();
    const deviceType = useDeviceType();
    const deviceIcon = deviceList.find((device) => device.slug === deviceType)?.icon;

    return (
        <div className='blockish-responsive-dropdown' ref={responsiveRef}>
            <div className='blockish-responsive-dropdown-menu' style={{ '--from-left': left }}>
                <DropdownMenu
                    icon={deviceIcon}
                    label={__("Select a device", "blockish")}
                    popoverProps={{ className: 'blockish-responsive-dropdown-popover' }}
                    controls={
                        deviceList.map((device) => {
                            return {
                                icon: device.icon,
                                onClick: () => {
                                    setDeviceType(device.slug);
                                }
                            }
                        })
                    }
                >
                </DropdownMenu>
            </div>
            {children}
        </div>
    )
}

export default memo(BlockishResponsive);