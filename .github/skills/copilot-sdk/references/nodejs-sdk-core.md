# Node.js SDK Core Reference

Source:
- https://github.com/github/copilot-sdk/blob/main/nodejs/README.md

## Core Lifecycle

1. Create `CopilotClient`.
2. Start client (explicit `start()` or implicit `autoStart`).
3. Create or resume a session with required `onPermissionRequest`.
4. Send prompts via `send(...)` or `sendAndWait(...)`.
5. Handle events (`assistant.message`, `assistant.message_delta`, `session.idle`, tool events).
6. Cleanup with `session.disconnect()` and `client.stop()`.

## Key APIs

- `CopilotClient`:
  - `start()`, `stop()`, `forceStop()`
  - `createSession(config)`, `resumeSession(sessionId, config)`
  - `listSessions(...)`, `deleteSession(...)`
- `CopilotSession`:
  - `send(...)`, `sendAndWait(...)`
  - `on(eventType, handler)`
  - `abort()`, `getMessages()`, `disconnect()`
  - `capabilities` and `ui` APIs

## Required Configuration Rule

- `onPermissionRequest` is required when creating or resuming sessions.

## Feature Areas

- Tools via `defineTool(...)`
- Session hooks (`onPreToolUse`, `onPostToolUse`, etc.)
- Streaming (`streaming: true` and delta events)
- Telemetry (`telemetry` option, optional trace context propagation)
- Infinite sessions and resumption
