import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { CopilotClient, approveAll } from '@github/copilot-sdk';

// Standalone implementation for model options (called by the node method)
async function getModelOptionsImpl(this: ILoadOptionsFunctions) {
	try {
		const credentials = await this.getCredentials('copilotAgentApi');
		const githubToken = credentials.githubToken as string;

		if (!githubToken) {
			throw new Error('GitHub token not found in credentials');
		}

		const client = new CopilotClient({ githubToken });

		try {
			await client.start();

			// Attempt to fetch available models from SDK
			const models = await (client as any).listModels?.();

			if (Array.isArray(models) && models.length > 0) {
				return models.map((model: any) => ({
					name: model.name || model.id,
					value: model.id,
				}));
			}
		} finally {
			await client.stop();
		}
	} catch (error) {
		// Log warning but continue with fallback
		console.warn('Failed to fetch models from SDK, using fallback list:', error);
	}

	// Static fallback list (matches SDK v0.2.2 supported models)
	return [
		{ name: 'GPT-5', value: 'gpt-5' },
		{ name: 'Claude Sonnet 4.5', value: 'claude-sonnet-4.5' },
		{ name: 'GPT-4.1', value: 'gpt-4.1' },
	];
}

export class CopilotAgent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Copilot Agent',
		name: 'copilotAgent',
		icon: 'file:copilotAgent.svg',
		group: ['transform'],
		version: 1,
		description: 'Copilot agent node using GitHub Copilot SDK',
		defaults: {
			name: 'Copilot Agent',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'copilotAgentApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Model Name or ID',
				name: 'model',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getModelOptions',
				},
				default: 'gpt-5',
				description: 'AI model to use for the session. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				description: 'Message to send to Copilot',
			},
			{
				displayName: 'Share Session Across Items',
				name: 'shareSession',
				type: 'boolean',
				default: false,
				description: 'Whether to share a single session across all items. When disabled (default), each item gets its own isolated session for predictable, independent results. When enabled, all items share one session and context carries forward across the batch.',
			},
		],
		usableAsTool: true,
	};

	// Define methods for n8n to use
	methods = {
		loadOptions: {
			async getModelOptions(this: ILoadOptionsFunctions) {
				return await getModelOptionsImpl.call(this);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		let credentials;
		let githubToken: string;

		try {
			credentials = await this.getCredentials('copilotAgentApi');
			githubToken = credentials.githubToken as string;

			if (!githubToken) {
				throw new Error('GitHub token is not provided in credentials');
			}
		} catch (error) {
			throw new Error(`Failed to retrieve credentials: ${(error as Error).message}`);
		}

		const model = this.getNodeParameter('model', 0) as string;
		const shareSession = this.getNodeParameter('shareSession', 0, false) as boolean;
		const client = new CopilotClient({ githubToken });

		try {
			// Start the client (required by SDK)
			await client.start();

			if (shareSession) {
				// SHARED SESSION MODE: All items share one session (context carries forward)
				const session = await client.createSession({
					model: model || 'gpt-5',
					onPermissionRequest: approveAll,
				});

				try {
					// Process all items using the same session (preserves context and history)
					for (let i = 0; i < items.length; i++) {
						const prompt = this.getNodeParameter('prompt', i) as string;

						if (!prompt || prompt.trim().length === 0) {
							returnData.push({
								json: {
									success: false,
									error: 'Prompt cannot be empty',
									node: 'copilotAgent',
								},
								pairedItem: { item: i },
							});
							continue;
						}

						try {
							// Send prompt and wait for response (SDK request/response pattern)
							const result = await session.sendAndWait({ prompt });

							returnData.push({
								json: {
									success: true,
									sessionId: session.sessionId,
									response: result?.data?.content ?? '',
									node: 'copilotAgent',
								},
								pairedItem: { item: i },
							});
						} catch (itemError) {
							returnData.push({
								json: {
									success: false,
									error: `Failed to process item ${i}: ${(itemError as Error).message}`,
									node: 'copilotAgent',
								},
								pairedItem: { item: i },
							});
						}
					}
				} finally {
					// Cleanup session (required by SDK)
					await session.disconnect();
				}
			} else {
				// ISOLATED SESSION MODE: Each item gets its own session (default, recommended)
				for (let i = 0; i < items.length; i++) {
					const prompt = this.getNodeParameter('prompt', i) as string;

					if (!prompt || prompt.trim().length === 0) {
						returnData.push({
							json: {
								success: false,
								error: 'Prompt cannot be empty',
								node: 'copilotAgent',
							},
							pairedItem: { item: i },
						});
						continue;
					}

					// Create a new session for this item
					let session;
					try {
						session = await client.createSession({
							model: model || 'gpt-5',
							onPermissionRequest: approveAll,
						});

						// Send prompt and wait for response
						const result = await session.sendAndWait({ prompt });

						returnData.push({
							json: {
								success: true,
								sessionId: session.sessionId,
								response: result?.data?.content ?? '',
								node: 'copilotAgent',
							},
							pairedItem: { item: i },
						});
					} catch (itemError) {
						returnData.push({
							json: {
								success: false,
								error: `Failed to process item ${i}: ${(itemError as Error).message}`,
								node: 'copilotAgent',
							},
							pairedItem: { item: i },
						});
					} finally {
						// Cleanup session for this item (required by SDK)
						if (session) {
							await session.disconnect();
						}
					}
				}
			}
		} finally {
			// Cleanup client (required by SDK)
			await client.stop();
		}

		return [returnData];
	}
}
