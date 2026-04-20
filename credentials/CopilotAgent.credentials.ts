import type { ICredentialType, INodeProperties } from 'n8n-workflow';

const isCopilotDebugEnabled =
	(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.
		COPILOT_AGENT_DEBUG === '1';

if (isCopilotDebugEnabled) {
	globalThis.console?.error('[copilot-agent][debug] CopilotAgent.credentials.ts loaded');
}

export class CopilotAgentApi implements ICredentialType {
	name = 'copilotAgentApi';
	displayName = 'GitHub Copilot API';
	documentationUrl = 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens';
	properties: INodeProperties[] = [
		{
			displayName: 'CLI Server URL',
			name: 'cliUrl',
			type: 'string',
			default: '',
			required: false,
			description: 'Optional: Remote CLI server address (e.g., "localhost:8080"). Leave empty to spawn CLI locally. Warning: TCP connection is unauthenticated—must be secured at network level (VPC, private network, or same Docker network). Never expose publicly.',
		},
		{
			displayName: 'Authentication Mode',
			name: 'authMode',
			type: 'options',
			default: 'github_token',
			required: true,
			options: [
				{
					name: 'GitHub Token (Per-User)',
					value: 'github_token',
					description: 'Use a personal GitHub PAT. Token is passed per-request.',
				},
				{
					name: 'Server Token (Shared Service Account)',
					value: 'server_token',
					description: 'Connect to CLI server with its own environment-provided token. No credentials needed.',
				},
			],
		},
		{
			displayName: 'GitHub Personal Access Token',
			name: 'githubToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'A GitHub Personal Access Token (classic or fine-grained) with Copilot access. Generate one at https://github.com/settings/tokens',
			displayOptions: {
				show: {
					authMode: ['github_token'],
				},
			},
		},
	];
}
