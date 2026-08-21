import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Card, CardBody, Button, TextControl, RadioControl, SelectControl, Notice, __experimentalHeading as Heading, __experimentalText as Text, __experimentalVStack as VStack, Flex } from '@wordpress/components';
import { zap } from '../../components/icons/block-icons';
import OverviewVideoModal, { getConnectVideoId } from './overview-video-modal';

export default function McpConfigPage() {
	const [step, setStep] = useState(0);
	const [os, setOs] = useState('mac');
	const [hasNode, setHasNode] = useState('yes');
	const [aiClient, setAiClient] = useState('claude-desktop');
	const [appPassword, setAppPassword] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const [isConnectVideoOpen, setIsConnectVideoOpen] = useState(false);
	const connectVideoId = getConnectVideoId();
	const hasConnectVideo = !!connectVideoId;

	useEffect(() => {
		const cachedPass = window.localStorage.getItem('blockish_mcp_password');
		if (cachedPass) {
			setAppPassword(cachedPass);
		}
	}, []);

	const adminUrl = window.blockishDashboardData?.siteUrl || window.location.origin;
	const siteUrl = adminUrl.replace(/\/wp-admin\/$/, '');
	const currentUser = window.blockishDashboardData?.currentUser || '';

	const handleNext = () => setStep((s) => s + 1);
	const handleBack = () => setStep((s) => s - 1);
	const handleRestart = () => {
		setStep(0);
		setIsCopied(false);
	};

	const handleCopy = () => {
		const textToCopy = generateCommand();
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(textToCopy);
		} else {
			const textArea = document.createElement('textarea');
			textArea.value = textToCopy;
			textArea.style.position = 'fixed';
			textArea.style.opacity = '0';
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			try {
				document.execCommand('copy');
			} catch (err) {
				console.error('Failed to copy command', err);
			}
			document.body.removeChild(textArea);
		}
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const handleGeneratePassword = async () => {
		setIsGenerating(true);
		try {
			const response = await apiFetch({
				path: '/blockish/v1/dashboard-tools/generate-mcp-password',
				method: 'POST',
			});
			if (response?.status === 'success' && response?.password) {
				setAppPassword(response.password);
				window.localStorage.setItem('blockish_mcp_password', response.password);
			} else {
				alert(response?.message || __('Failed to generate password.', 'blockish'));
			}
		} catch (error) {
			alert(error?.message || __('An error occurred while generating the password.', 'blockish'));
		} finally {
			setIsGenerating(false);
		}
	};

	const generateCommand = () => {
		const safeUrl = siteUrl.replace(/"/g, '\\"');
		const safeUser = currentUser.replace(/"/g, '\\"');
		const safePass = appPassword.replace(/"/g, '\\"');

		const baseCmd = `npx blockish-mcp-cli@latest -t ${aiClient} -s "${safeUrl}" -u "${safeUser}" -p "${safePass}" -f`;

		if (hasNode === 'yes') {
			return baseCmd;
		}

		if (os === 'win') {
			return `winget install OpenJS.NodeJS.LTS --quiet; $env:Path += ";C:\\Program Files\\nodejs\\"; ${baseCmd}`;
		}

		return `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh" && nvm install --lts && ${baseCmd}`;
	};

	const renderStep0 = () => (
		<VStack spacing={5}>
			<Flex align="center" gap={3} justify="flex-start">
				<div style={{ color: '#007cba', width: '32px', height: '32px' }}>{zap}</div>
				<Heading className="blockish-heading-secondary" level={2} style={{ margin: 0 }}>
					{__('Supercharge your AI Workflow', 'blockish')}
				</Heading>
			</Flex>
			<Text>
				{__('Blockish fully supports the Model Context Protocol (MCP). This means your AI assistant can directly read and write WordPress blocks right from your IDE or chat app!', 'blockish')}
			</Text>
			<Text>
				{__('We have built an interactive wizard to generate a single copy-paste terminal command that installs dependencies and securely configures your AI client automatically.', 'blockish')}
			</Text>
			<div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
				<Button variant="primary" onClick={handleNext}>
					{__('Start Configuration Wizard', 'blockish')}
				</Button>
				{hasConnectVideo ? (
					<Button variant="secondary" onClick={() => setIsConnectVideoOpen(true)}>
						{__('Watch how to connect', 'blockish')}
					</Button>
				) : null}
			</div>
		</VStack>
	);

	const renderStep1 = () => (
		<VStack spacing={6}>
			<Heading className="blockish-heading-secondary" level={2}>
				{__('Step 1: Your Environment', 'blockish')}
			</Heading>
			<RadioControl
				label={__('What Operating System are you using?', 'blockish')}
				selected={os}
				options={[
					{ label: 'Mac', value: 'mac' },
					{ label: 'Windows', value: 'win' },
					{ label: 'Linux', value: 'linux' },
				]}
				onChange={(val) => setOs(val)}
			/>
			<RadioControl
				label={__('Is Node.js already installed on this computer?', 'blockish')}
				help={__('If you are unsure, select No. The command will automatically install it for you.', 'blockish')}
				selected={hasNode}
				options={[
					{ label: 'Yes, I have Node.js and NPM', value: 'yes' },
					{ label: 'No (or I am not sure)', value: 'no' },
				]}
				onChange={(val) => setHasNode(val)}
			/>
			<Flex justify="flex-start" gap={3} style={{ marginTop: '16px' }}>
				<Button variant="secondary" onClick={handleBack}>{__('Back', 'blockish')}</Button>
				<Button variant="primary" onClick={handleNext}>{__('Next Step', 'blockish')}</Button>
			</Flex>
		</VStack>
	);

	const renderStep2 = () => (
		<VStack spacing={6}>
			<Heading className="blockish-heading-secondary" level={2}>
				{__('Step 2: Connection Details', 'blockish')}
			</Heading>
			<SelectControl
				label={__('Select your AI Client', 'blockish')}
				value={aiClient}
				options={[
					{ label: 'Claude Desktop', value: 'claude-desktop' },
					{ label: 'Claude Code', value: 'claude-code' },
					{ label: 'Cursor', value: 'cursor' },
					{ label: 'Codex', value: 'codex' },
					{ label: 'Cline (VS Code)', value: 'cline' },
					{ label: 'Devin (Windsurf)', value: 'devin' },
					{ label: 'Antigravity', value: 'antigravity' },
					{ label: 'Antigravity Chat', value: 'antigravity-chat' },
					{ label: 'Trae', value: 'trae' },
					{ label: 'Qwen Code', value: 'qwen-code' },
					{ label: 'Kimi Code', value: 'kimi-code' },
				]}
				onChange={(val) => setAiClient(val)}
			/>
			<VStack spacing={3}>
				<Heading level={4} className="blockish-heading-tertiary" style={{ margin: 0 }}>
					{__('Application Password', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{__('For security, your AI client connects using a dedicated Application Password instead of your main password.', 'blockish')}
				</Text>
				
				{appPassword ? (
					<VStack spacing={2}>
						<TextControl
							value={appPassword}
							onChange={(val) => {
								setAppPassword(val);
								window.localStorage.setItem('blockish_mcp_password', val);
							}}
							help={__('We have generated and securely saved this password locally on your computer.', 'blockish')}
						/>
						<div>
							<Button variant="link" onClick={handleGeneratePassword} isBusy={isGenerating} disabled={isGenerating} style={{ paddingLeft: 0 }}>
								{__('Generate a new one', 'blockish')}
							</Button>
						</div>
					</VStack>
				) : (
					<VStack spacing={2} align="flex-start">
						<Button variant="primary" onClick={handleGeneratePassword} isBusy={isGenerating} disabled={isGenerating}>
							{isGenerating ? __('Generating...', 'blockish') : __('Auto-Generate Password', 'blockish')}
						</Button>
						<div>
							<Button variant="link" href={adminUrl + 'profile.php'} target="_blank" style={{ paddingLeft: 0 }}>
								{__('Or click here to manually create one from your profile', 'blockish')}
							</Button>
						</div>
					</VStack>
				)}
			</VStack>
			
			<Flex justify="flex-start" gap={3} style={{ marginTop: '16px' }}>
				<Button variant="secondary" onClick={handleBack}>{__('Back', 'blockish')}</Button>
				<Button variant="primary" onClick={handleNext} disabled={!appPassword}>
					{__('Generate Command', 'blockish')}
				</Button>
			</Flex>
		</VStack>
	);

	const renderStep3 = () => (
		<VStack spacing={6}>
			<Flex align="center" gap={3} justify="flex-start">
				<div style={{ color: '#00a32a', width: '32px', height: '32px' }}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
				</div>
				<Heading className="blockish-heading-secondary" level={2} style={{ margin: 0 }}>
					{__('You are ready!', 'blockish')}
				</Heading>
			</Flex>
			
			<Text>
				{__('We have generated a custom one-liner just for you. Open your computer\'s Terminal application and paste this exact command:', 'blockish')}
			</Text>

			<div style={{ position: 'relative' }}>
				<div style={{ 
					background: '#1e1e1e', 
					color: '#d4d4d4', 
					padding: '24px', 
					paddingRight: '80px',
					borderRadius: '8px', 
					fontFamily: 'monospace', 
					fontSize: '14px',
					lineHeight: '1.5',
					overflowX: 'auto',
					userSelect: 'all',
					cursor: 'text',
					border: '1px solid #444'
				}}>
					<code>{generateCommand()}</code>
				</div>
				<Button
					variant="secondary"
					onClick={handleCopy}
					style={{
						position: 'absolute',
						top: '16px',
						right: '16px',
						backgroundColor: isCopied ? '#00a32a' : '#333',
						color: '#fff',
						border: 'none',
						padding: '4px 12px',
						minHeight: '32px'
					}}
				>
					{isCopied ? __('Copied!', 'blockish') : __('Copy', 'blockish')}
				</Button>
			</div>

			<Notice status="info" isDismissible={false}>
				<VStack spacing={1}>
					<Text style={{ fontWeight: 'bold' }}>{__('How to open your Terminal:', 'blockish')}</Text>
					{os === 'mac' && <Text>{__('Press Command (⌘) + Space, type "Terminal", and hit Enter.', 'blockish')}</Text>}
					{os === 'win' && <Text>{__('Press the Windows Key, type "PowerShell", and hit Enter.', 'blockish')}</Text>}
					{os === 'linux' && <Text>{__('Press Ctrl + Alt + T.', 'blockish')}</Text>}
				</VStack>
			</Notice>

			<Flex justify="flex-start" gap={3} style={{ marginTop: '16px' }}>
				<Button variant="secondary" onClick={handleRestart}>{__('Start Over', 'blockish')}</Button>
			</Flex>
		</VStack>
	);

	return (
		<VStack className="blockish-mcp-config-page" spacing={5}>
			<VStack spacing={1}>
				<Heading className="blockish-heading-primary" level={1}>
					{__('MCP Server Config', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{__('Connect Blockish to your AI client (Cursor, Claude, Codex, Windsurf, and others) using the Model Context Protocol (MCP).', 'blockish')}
				</Text>
			</VStack>

			<Card className="blockish-panel">
				<CardBody style={{ padding: '32px' }}>
					{step === 0 && renderStep0()}
					{step === 1 && renderStep1()}
					{step === 2 && renderStep2()}
					{step === 3 && renderStep3()}
				</CardBody>
			</Card>

			<OverviewVideoModal
				isOpen={isConnectVideoOpen}
				onClose={() => setIsConnectVideoOpen(false)}
				videoId={connectVideoId}
				title={__('How to connect', 'blockish')}
				iframeTitle={__('Blockish MCP connect walkthrough', 'blockish')}
			/>
		</VStack>
	);
}
