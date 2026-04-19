# Node.js Agent Authoring Reference

Source:
- https://github.com/github/copilot-sdk/blob/main/nodejs/docs/agent-author.md

## Agent-Authoring Workflow

1. Scaffold extension directory and `extension.mjs`.
2. Implement `joinSession({ tools, hooks })`.
3. Reload extensions and verify they are healthy.

## Session APIs After `joinSession`

- `session.send(...)`
- `session.sendAndWait(...)`
- `session.log(...)`
- `session.on(eventType, handler)`
- `session.workspacePath`
- `session.rpc`

## Common Gotchas

- Do not write protocol output to stdout; prefer session logging.
- Tool name collisions can fail extension load.
- Avoid synchronous self-trigger loops in prompt hooks.
- Extensions reload on clear/session replacement, so in-memory state can reset.
