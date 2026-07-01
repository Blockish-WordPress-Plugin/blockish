import { registerPlugin } from '@wordpress/plugins';
import './editor.scss';
import ApplyPendingSchema from './apply-pending-schema';
import './ai-preview-block';
registerPlugin('blockish-mcp-ai', {
    render: ApplyPendingSchema,
});
