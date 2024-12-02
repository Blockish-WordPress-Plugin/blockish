import { TextareaControl } from '@wordpress/components';

const BoilerplateTextareaControl = ({ label = 'Textarea', value, onChange, ...props }) => {

    return (
        <div className="boilerplate-blocks-control boilerplate-blocks-textarea-control">
            <TextareaControl
                __nextHasNoMarginBottom
                label={ label }
                value={ value }
                onChange={ onChange }
                { ...props }
            />
        </div>
    );
}

export default BoilerplateTextareaControl