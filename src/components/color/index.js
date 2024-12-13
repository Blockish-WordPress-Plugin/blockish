import { __ } from '@wordpress/i18n';
import { PanelColorSettings, __experimentalPanelColorGradientSettings as PanelColorGradientSettings } from '@wordpress/block-editor';

const BlockishColor = ({ label, value, onChange, alpha, labelBlock = 'inline', isGradient = false, ...props }) => {
    return (
        <>
            <div className="blockish-color-control blockish-control">
                {
                    isGradient ? (
                        <PanelColorGradientSettings
                            __experimentalIsRenderedInSidebar
                            settings={[
                                {
                                    gradientValue: value,
                                    label: label,
                                    onGradientChange: (value) => onChange(value),
                                }
                            ]}
                            {...props}
                        />
                    ) : (
                        <PanelColorSettings
                            __experimentalIsRenderedInSidebar
                            title={""}
                            enableAlpha={alpha ? alpha : true}
                            colorSettings={[
                                {
                                    value: value,
                                    onChange: (value) => onChange(value),
                                    label: label,
                                }
                            ]}
                            {...props}
                        />
                    )
                }

            </div>
        </>
    );
}

export default BlockishColor;