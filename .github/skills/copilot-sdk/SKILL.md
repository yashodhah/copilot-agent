---
name: copilot-sdk
description: "Understand and apply GitHub Copilot SDK for Node.js/TypeScript in this repo. USE FOR: CopilotClient lifecycle, createSession/resumeSession, required permission handlers, tool definitions, streaming events, hooks, session persistence, and extension authoring with joinSession. TRIGGERS: 'copilot sdk node', 'createSession', 'sendAndWait', 'approveAll', 'joinSession', 'extension.mjs', 'session hooks', 'streaming events'. DO NOT USE FOR: Python/Go/.NET SDK guidance."
---

# Copilot SDK Node.js Awareness

Make code changes and recommendations that are aligned with the Node.js Copilot SDK model used by this codebase.

## When To Use

- User asks how to build or modify Node.js Copilot SDK code.
- Work includes `@github/copilot-sdk` or `@github/copilot-sdk/extension`.
- Work touches session lifecycle, tools, hooks, streaming, or extension behavior.

## Procedure

1. Classify the integration style.
   - If code uses `new CopilotClient(...)`, follow app-client workflow.
   - If code uses `joinSession(...)` in `.github/extensions/*/extension.mjs`, follow extension workflow.

2. Enforce startup and auth prerequisites.
   - Confirm Node.js runtime compatibility and SDK import path.
   - Ensure session creation/resume includes `onPermissionRequest` (required).
   - Use `approveAll` only for trusted or demo flows; otherwise provide a policy handler.

3. Choose session interaction pattern.
   - Use `sendAndWait(...)` for request/response simplicity.
   - Use `send(...)` + `session.on(...)` for streaming and event-driven flows.
   - Enable `streaming: true` when incremental deltas are needed.

4. Add capabilities intentionally.
   - Tools: define with `defineTool(...)`; prefer schema-validated args.
   - Hooks: use `onPreToolUse`, `onPostToolUse`, and related hooks for policy and context shaping.
   - UI elicitation: gate calls behind `session.capabilities.ui?.elicitation`.
   - Telemetry: configure `telemetry` when traces are needed.

5. Handle lifecycle and cleanup.
   - Call `session.disconnect()` when done (or use `await using` where supported).
   - Call `client.stop()` for explicit shutdown when managing client lifecycle.
   - For long-lived experiences, use `resumeSession(...)` with a permission handler.

6. Validate before finalizing.
   - No Python/Go/.NET guidance included.
   - APIs used are valid for Node.js SDK docs.
   - Any extension guidance keeps `extension.mjs` and `joinSession(...)` constraints.

## Decision Points

- Permission model:
  - Prototype/local automation: `approveAll`.
  - Production/sensitive tasks: custom `onPermissionRequest` logic.
- Transport/runtime:
  - Default app flows: bundled CLI defaults.
  - Existing server: set `cliUrl` and avoid local spawn assumptions.
- Tool behavior:
  - If replacing a built-in tool, set `overridesBuiltInTool: true`.
  - If safe read-only tool, consider `skipPermission: true`.

## Quality Checks

- `createSession` and `resumeSession` include `onPermissionRequest`.
- Streaming implementations listen for `assistant.message_delta` and completion (`session.idle` or final assistant event).
- Code does not rely on deprecated `destroy()` for new work.
- Extension examples avoid `console.log()` for protocol output and use session logging patterns.

## References

- [Node.js SDK Core](./references/nodejs-sdk-core.md)
- [Node.js Extensions](./references/nodejs-extensions.md)
- [Node.js Agent Authoring](./references/nodejs-agent-authoring.md)
