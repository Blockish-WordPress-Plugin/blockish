import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Flex, FlexItem, FlexBlock } from '@wordpress/components';
import BlockishResetButton from '../reset-button';

const BlockishNumber = ({ label, value, onChange, showReset = true, ...props }) => {
    const hasValue = value !== undefined && value !== null && value !== '';

    return (
        <div className="blockish-control blockish-number">
            <Flex align="flex-end">
                <FlexBlock>
                    <NumberControl
                        label={label}
                        value={value}
                        onChange={onChange}
                        {...props}
                    />
                </FlexBlock>
                {showReset && (
                    <FlexItem>
                        <BlockishResetButton
                            onClick={() => onChange(undefined)}
                            disabled={!hasValue}
                            label={__('Reset', 'blockish')}
                        />
                    </FlexItem>
                )}
            </Flex>
        </div>
    );
}

export default BlockishNumber;
