import { Button, Dropdown, __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';

const BlockishDropdown = ({ label, icon = null, children, ...props }) => {
    return (
        <Dropdown
            className="blockish-dropdown"
            contentClassName="blockish-dropdown-content"
            popoverProps={{ placement: 'left-start', shift: true, offset: 36 }}
            renderToggle={({ isOpen, onToggle }) => (
                <Button
                    variant="secondary"
                    onClick={onToggle}
                    aria-expanded={isOpen}
                >
                    <HStack justify='flex-start' gap={4}>
                        {icon}
                        <Text>{label}</Text>
                    </HStack>
                </Button>
            )}
            renderContent={() => {
                return children;
            }}
            {...props}
        />
    )
}

export default BlockishDropdown;