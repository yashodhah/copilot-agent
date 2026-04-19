# Node.js Extensions Reference

Source:
- https://github.com/github/copilot-sdk/blob/main/nodejs/docs/extensions.md

## Extension Model

- Extensions run as separate Node.js processes communicating with Copilot CLI over JSON-RPC via stdio.
- Discovery path includes `.github/extensions/<name>/extension.mjs`.
- Entry file must be `extension.mjs` using ES modules.

## Minimal Pattern

```js
import { joinSession } from "@github/copilot-sdk/extension";

await joinSession({
  tools: [],
  hooks: {},
});
```

## Practical Constraints

- Only `.mjs` is supported for extension entrypoints.
- Tool names must be globally unique across loaded extensions.
- Use extension session APIs for events, tool execution, and logging.
