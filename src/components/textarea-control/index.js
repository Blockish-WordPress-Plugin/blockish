import { TextareaControl } from '@wordpress/components';

const BlockishTextareaControl = ({ label = 'Textarea', value, onChange, ...props }) => {

    return (
        <div className="blockish-control blockish-textarea-control">
            <TextareaControl
                __nextHasNoMarginBottom={true}
                label={ label }
                value={ value }
                onChange={ onChange }
                { ...props }
            />
        </div>
    );
}

export default BlockishTextareaControl