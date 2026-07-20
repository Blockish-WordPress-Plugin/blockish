const initBeforeAfterSliders = () => {
    const sliders = document.querySelectorAll('.blockish-before-after-slider');

    sliders.forEach(slider => {
        // Prevent multiple initializations
        if (slider.dataset.initialized) return;
        slider.dataset.initialized = 'true';

        const wrapper = slider.querySelector('.blockish-slider-wrapper');
        if (!wrapper) return;

        let isDragging = false;

        const onDragStart = (e) => {
            isDragging = true;
            e.preventDefault(); // Prevent text selection/image dragging
        };

        const onDragEnd = () => {
            isDragging = false;
        };

        const onDragMove = (e) => {
            if (!isDragging) return;

            const rect = wrapper.getBoundingClientRect();
            let clientX = e.clientX;
            
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
            }

            let x = clientX - rect.left;
            let percentage = (x / rect.width) * 100;

            // Clamp between 0 and 100
            percentage = Math.max(0, Math.min(percentage, 100));
            
            slider.style.setProperty('--slider-pos', `${percentage}%`);
        };

        wrapper.addEventListener('mousedown', onDragStart);
        wrapper.addEventListener('touchstart', onDragStart, { passive: false });

        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('touchmove', onDragMove, { passive: false });

        window.addEventListener('mouseup', onDragEnd);
        window.addEventListener('touchend', onDragEnd);
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBeforeAfterSliders);
} else {
    initBeforeAfterSliders();
}
