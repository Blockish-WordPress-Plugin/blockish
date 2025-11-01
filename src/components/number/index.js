import { __experimentalNumberControl as NumberControl } from '@wordpress/components';

const BlockishNumber = ({ label, value, onChange, ...props }) => {

    return (
        <div className="blockish-control blockish-number">
            <NumberControl
                __next40pxDefaultSize={true}
                label={label}
                value={value}
                onChange={onChange}
                {...props}
            />
        </div>
    );
}

export default BlockishNumber;