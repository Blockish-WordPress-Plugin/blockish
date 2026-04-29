import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { CHAT_POST_TYPE, CHAT_SESSION_KEY } from '../constants';
const useSelectedChat = () => {
	const [ selectedChatId, setSelectedChatId ] = useState( null );

	useEffect( () => {
		const chatId = window.sessionStorage.getItem( CHAT_SESSION_KEY );
		if ( chatId ) {
			setSelectedChatId( chatId );
		}
	}, [] );

	const selectedChat = useSelect(
		( select ) => {
			const { getEditedEntityRecord } = select( 'core' );
			return (
				getEditedEntityRecord(
					'postType',
					CHAT_POST_TYPE,
					selectedChatId
				) || null
			);
		},
		[ selectedChatId ]
	);

	return selectedChat;
};

export default useSelectedChat;
