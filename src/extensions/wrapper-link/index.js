import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

const BlockishWrapperLink = createHigherOrderComponent(
	( TabContent ) => ( props ) => {
		if ( props?.tabName !== 'advanced' ) {
			return <TabContent { ...props } />;
		}

		const { BlockishPanelBody } = window?.blockish?.components || {};
		const { BlockishControl } = window?.blockish?.controls || {};

		if ( ! BlockishPanelBody || ! BlockishControl ) {
			return <TabContent { ...props } />;
		}

		return (
			<TabContent { ...props }>
				{ props.children }
				<BlockishPanelBody title={ __( 'Wrapper Link', 'blockish' ) }>
					<BlockishControl
						type="BlockishLink"
						label={ __( 'Link', 'blockish' ) }
						slug="wrapperLink"
					/>
				</BlockishPanelBody>
			</TabContent>
		);
	},
	'BlockishWrapperLink'
);

addFilter(
	'blockish.tabs.after-tab',
	'blockish/wrapper-link/controls',
	BlockishWrapperLink
);

