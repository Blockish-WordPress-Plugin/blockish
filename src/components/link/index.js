import { TextControl, Button, CheckboxControl, Spinner, BaseControl, Flex, FlexItem, FlexBlock } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import apifetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

const BlockishLink = ({ value, onChange, label, help = '' }) => {
    const [searchInput, setSearchInput] = useState(value?.url || '')
    const [searchResultSuggestion, setSearchResultSuggestion] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    let urlObject = {
        ...value,
        url: value?.url || '',
        newTab: value?.newTab ? value.newTab : false,
        noFollow: value?.noFollow ? value.noFollow : false,
        customAttributes: value?.customAttributes || '',
    }

    useEffect(() => {
        setIsLoading(true);

        if (!searchInput || searchInput.length <= 1) {
            setSearchResultSuggestion([]);
            setIsLoading(false);
            return;
        }

        if (searchInput.includes('.') || searchInput.includes('#') || searchInput.includes('http://') || searchInput.includes('https://')) {
            setSearchResultSuggestion([]);
            setIsLoading(false);
            return;
        }

        const searchData = async (searchInput) => {
            try {
                const response = await apifetch({
                    path: `/wp/v2/search?search=${searchInput}&per_page=-1`,
                })

                if (response) {
                    setSearchResultSuggestion(response);
                }
                setIsLoading(false);
            } catch (e) {
                setIsLoading(false);
            }
        }

        let timer;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            searchData(searchInput);
        }, 1000);
        return () => {
            clearTimeout(timer);
        }
    }, [searchInput]);

    const blockishLinkRef = useRef(null);
    const handleSettingsButton = (e) => {
        setSearchResultSuggestion([]);
        const wrapper = blockishLinkRef.current;
        if (wrapper) {
            const settingsWrapper = wrapper.querySelector('.blockish-link-settings');
            settingsWrapper.classList.toggle('is-opened');
            if (e.target.nodeName === 'BUTTON') {
                e.target.classList.toggle('is-active');
            } else {
                e.target.closest('.blockish-link-settings-button').classList.toggle('is-active');
            }
        }
    }

    useEffect(() => {
        document.addEventListener('click', (e) => {
            const wrapper = blockishLinkRef.current;
            if (wrapper && !wrapper.contains(e.target)) {
                setSearchResultSuggestion([]);
            }
        })
    }, [])

    const handleSearchInput = (value) => {
        setSearchInput(value);
        urlObject = {
            ...urlObject,
            url: value
        };
        onChange(urlObject);
    }

    const handleChange = (key, value) => {
        urlObject = {
            ...urlObject,
            [key]: value
        };
        onChange(urlObject);
    }

    const handleCustomAttributes = (value) => {
        const attributes = value.split(',')
            .map(attr => attr.replace(/\s/g, '')); // Remove spaces from each attribute

        urlObject = {
            ...urlObject,
            customAttributes: attributes.length ? attributes : []
        };
        onChange(urlObject);
    }

    return (
        <div className="blockish-control blockish-link" ref={blockishLinkRef}>
            <BaseControl label={label || __('Link', 'blockish')} help={help} __nextHasNoMarginBottom>
                <Flex gap={0}>
                    <FlexBlock className='blockish-link-input-wrapper'>
                        <TextControl
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                            placeholder="https://www.example.com"
                            type='url'
                            className='blockish-link-input'
                            id='blockish-link-input'
                            autoComplete='off'
                            onChange={handleSearchInput}
                            help={help}
                            value={searchInput || value?.url || ''}
                        />
                        {isLoading ? <Spinner className='blockish-link-spinner' /> : null}
                    </FlexBlock>
                    <FlexItem>
                        <Button className="blockish-link-settings-button" icon={'admin-generic'} onClick={handleSettingsButton} />
                    </FlexItem>
                </Flex>
            </BaseControl>
            {
                searchResultSuggestion.length && searchInput && searchInput.length > 1 ? (
                    <div className="blockish-link-suggestions">
                        {
                            searchResultSuggestion.map((item, index) => {
                                const handleUrlSuggestionClick = () => {
                                    urlObject = {
                                        ...urlObject,
                                        url: item?.url
                                    }
                                    onChange(urlObject);
                                    setSearchInput(item?.url);
                                    setSearchResultSuggestion([]);
                                }
                                return (
                                    <Button className="blockish-link-suggestion" key={index} onClick={handleUrlSuggestionClick}>
                                        <span className="blockish-link-suggestion-title">{item?.title ? item?.title : "No Title"}</span>
                                        {
                                            item?.subtype ? <span className="blockish-link-suggestion-posttype">{item?.subtype}</span> : null
                                        }
                                    </Button>
                                )
                            })
                        }
                    </div>
                ) : null
            }
            <div className="blockish-link-settings">
                <CheckboxControl
                    __nextHasNoMarginBottom
                    className='blockish-link-settings-checkbox blockish-link-settings-checkbox-new-tab'
                    label={__('Open in new tab', 'blockish')}
                    checked={urlObject?.newTab}
                    onChange={value => handleChange('newTab', value)}
                />
                <CheckboxControl
                    __nextHasNoMarginBottom
                    className='blockish-link-settings-checkbox blockish-link-settings-checkbox-nofollow'
                    label={__('No follow', 'blockish')}
                    checked={urlObject?.noFollow}
                    onChange={value => handleChange('noFollow', value)}
                />
                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    className='blockish-link-settings-custom-attributes'
                    label={__('Custom Attributes', 'blockish')}
                    value={urlObject?.customAttributes}
                    onChange={handleCustomAttributes}
                    placeholder='link|text'
                    help={__('Set custom attributes for the link element. Separate attribute keys from values using the | (pipe) character like ( link|text ). Separate key-value pairs with a comma.', 'blockish')}
                />
            </div>
        </div>
    )
}

export default BlockishLink;