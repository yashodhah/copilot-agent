import type { ICredentialType, INodeProperties } from 'n8n-workflow';

const isCopilotDebugEnabled =
	(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.
		COPILOT_AGENT_DEBUG === '1';

if (isCopilotDebugEnabled) {
	globalThis.console?.error('[copilot-agent][debug] CopilotAgent.credentials.ts loaded');
}

export class CopilotAgent implements ICredentialType {
	name = 'copilotAgentApi';
	displayName = 'GitHub Copilot API';
	documentationUrl = 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens';
	properties: INodeProperties[] = [
		{
			displayName: 'GitHub Personal Access Token',
			name: 'githubToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'A GitHub Personal Access Token (classic or fine-grained) with Copilot access. Generate one at https://github.com/settings/tokens',
		},
	];
}
