import { Inserter } from '@wordpress/block-editor';
import { Icon, plus } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

export default function SubmenuAppender( { rootClientId } ) {
	return (
		<Inserter
			rootClientId={ rootClientId }
			isAppender
			renderToggle={ ( { onToggle, isOpen } ) => (
				<button
					type="button"
					className="blockish-navmenu-submenu-appender"
					onClick={ onToggle }
					aria-expanded={ isOpen }
				>
					<Icon icon={ plus } size={ 16 } />
					{ __( 'Add Item', 'blockish' ) }
				</button>
			) }
		/>
	);
}
