import { useSelect } from '@wordpress/data';
import { CHAT_POST_TYPE } from '../constants';

export const useChats = (search = '') => {
	const { chats } = useSelect((select) => {
		const { getEntityRecords, getEditedEntityRecord } = select('core');
		const records = getEntityRecords('postType', CHAT_POST_TYPE, { search });
		return {
			chats:
				(records &&
					records.map((item) =>
						getEditedEntityRecord('postType', CHAT_POST_TYPE, item?.id)
					)) ||
				[],
		};
	}, [search]);

	return chats;
};

export const useChat = (id) => {
	const { chat } = useSelect((select) => {
		const { getEditedEntityRecord, getEntityRecord } = select('core');
		const record = getEntityRecord('postType', CHAT_POST_TYPE, id);
		return {
			chat:
				record &&
				getEditedEntityRecord('postType', CHAT_POST_TYPE, record?.id),
		};
	}, [id]);

	return chat;
};
