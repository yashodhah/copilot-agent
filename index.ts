const isCopilotDebugEnabled =
	(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.
		COPILOT_AGENT_DEBUG === '1';

if (isCopilotDebugEnabled) {
	globalThis.console?.error('[copilot-agent][debug] index.ts loaded');
}

export { CopilotAgent as CopilotAgentCredentials } from './credentials/CopilotAgent.credentials';
export { CopilotAgent } from './nodes/CopilotAgent/CopilotAgent.node';
