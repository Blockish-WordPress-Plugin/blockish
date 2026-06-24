import { registerPlugin } from '@wordpress/plugins';
import './editor.scss';
import ApplyPendingSchema from './apply-pending-schema';

registerPlugin('blockish-mcp-ai', {
    render: ApplyPendingSchema,
});
