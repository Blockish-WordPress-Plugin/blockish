import {
    __experimentalVStack as VStack,
    __experimentalHStack as HStack,
    __experimentalHeading as Heading,
    Button,
    __experimentalItemGroup as ItemGroup,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import BlockishBoxShadowItem from './item';
const BlockishBoxShadow = ({ value, onChange, label = __('Drop Shadow', 'blockish'), exclude = [], ...props }) => {
    // Safely parse the value - handle empty strings and undefined
    let usableBoxShadow;
    try {
        usableBoxShadow = (value && value !== '') ? JSON.parse(value) : [{ x: 0, y: 0, blur: 0, spread: 0, color: 'rgba(0, 0, 0, 0.2)' }];
    } catch (e) {
        usableBoxShadow = [{ x: 0, y: 0, blur: 0, spread: 0, color: 'rgba(0, 0, 0, 0.2)' }];
    }
    return (
        <div className="blockish-box-shadow blockish-control blockish-group-control">
            <VStack className="components-tools-panel">
                <HStack>
                    <Heading level={5}>{label}</Heading>
                    <div className="blockish-box-shadow-add-button-wrapper">
                        <Button
                            className="blockish-box-shadow-add-button"
                            onClick={() => {
                                const newBoxShadow = [...usableBoxShadow, { x: 0, y: 0, blur: 0, spread: 0, color: 'rgba(0, 0, 0, 0.2)' }];
                                onChange(JSON.stringify(newBoxShadow));
                            }}
                            size='small'
                            label={__('Add Shadow', 'blockish')}
                            showTooltip
                        >
                            <Icon icon={plus} />
                        </Button>
                    </div>
                </HStack>
                {
                    usableBoxShadow.length > 0 ? (
                        <ItemGroup isBordered isSeparated className="blockish-box-shadow-item-group">
                            {
                                usableBoxShadow.map((shadowObject, index, array) => {
                                    return (
                                        <BlockishBoxShadowItem
                                            key={index}
                                            currentBoxShadow={shadowObject}
                                            onChange={onChange}
                                            itemIndex={index}
                                            itemArray={array}
                                            exclude={exclude}
                                        />
                                    )
                                })
                            }
                        </ItemGroup>
                    ) : null
                }
            </VStack>
        </div>
    )
};

export default BlockishBoxShadow;