import { useEffect } from '@wordpress/element';

const useScrollIntoView = (selectedSelector, options = {}) => {
    const {
        delay = 200, // delay before scrolling
        containerSelector = null, // custom scroll container (optional)
        behavior = 'smooth', // scroll behavior
        block = 'center', // alignment
        inline = 'nearest',
    } = options;

    useEffect(() => {
        if (!selectedSelector) return;

        const timer = setTimeout(() => {
            const element = document.querySelector(selectedSelector);
            if (!element) return;

            const container = containerSelector
                ? document.querySelector(containerSelector)
                : null;

            if (container) {
                // Calculate relative position inside container
                const elementRect = element.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const scrollTop =
                    container.scrollTop +
                    (elementRect.top - containerRect.top) -
                    container.clientHeight / 2 +
                    element.clientHeight / 2;

                container.scrollTo({
                    top: scrollTop,
                    behavior,
                });
            } else {
                // Default behavior — scroll in viewport
                element.scrollIntoView({
                    behavior,
                    block,
                    inline,
                });
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [selectedSelector, delay, containerSelector, behavior, block, inline]);
};

export default useScrollIntoView;
