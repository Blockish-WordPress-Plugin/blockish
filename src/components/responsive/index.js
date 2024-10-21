import { __ } from '@wordpress/i18n';
import { DropdownMenu } from '@wordpress/components';
import { useRef, memo } from '@wordpress/element';
const BoilerplateResponsive = ({ children }) => {

    const { useDeviceList, setDeviceType, useDeviceType } = window.boilerplateBlocks.helpers;
    const responsiveRef = useRef();
    const deviceList = useDeviceList();
    const deviceType = useDeviceType();
    const deviceIcon = deviceList.find((device) => device.slug === deviceType)?.icon;

    return (
        <div className='boilerplate-responsive-dropdown' ref={responsiveRef}>
            <DropdownMenu
                icon={deviceIcon}
                label={__("Select a device", "boilerplate-blocks")}
                className='boilerplate-responsive-dropdown-menu'
                popoverProps={{ className: 'boilerplate-responsive-dropdown-popover' }}
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
            {children}
        </div>
    )
}

export default memo(BoilerplateResponsive);