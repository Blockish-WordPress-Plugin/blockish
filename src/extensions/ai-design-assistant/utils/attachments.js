import { __ } from '@wordpress/i18n';

const maxImageSize = 1024 * 1024;

export const readImageAttachment = (file) => new Promise((resolve, reject) => {
	if (!file.type?.startsWith('image/')) {
		reject(new Error(__('Please choose an image file.', 'blockish')));
		return;
	}

	if (file.size > maxImageSize) {
		reject(new Error(__('Image must be smaller than 1MB.', 'blockish')));
		return;
	}

	const reader = new FileReader();
	reader.onload = () => {
		resolve({
			id: `${Date.now()}-${file.name}`,
			type: 'image',
			name: file.name,
			mimeType: file.type,
			size: file.size,
			url: reader.result,
		});
	};
	reader.onerror = () => {
		reject(new Error(__('Could not read the image.', 'blockish')));
	};
	reader.readAsDataURL(file);
});
