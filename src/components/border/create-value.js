const createValue = (original, device) => {
    const border = {
        left: {},
        right: {},
        top: {},
        bottom: {}
    }

    if ((width in original)) {
        for (const key in border) {
            border[key].width = {
                [device]: original?.width
            }

            border[key].color = original?.color || '#000000';
            border[key].style = original?.style || 'solid';
        }
    }else{
        for (const key in border) {
            if(original?.[key].width){
                border[key].width = {
                    [device]: original?.[key].width
                }

                border[key].color = original?.[key].color || '#000000';
                border[key].style = original?.[key].style || 'solid';
            }
        }
    }

    return JSON.stringify(border);
}
export default createValue;