# Postinstall cleanup for dev commands

This project ships a `scripts/postinstall.js` helper that removes the bundled `@github/copilot/sharp` wasm directory and pins the bundled `@n8n/node-cli` dev server to a specific n8n release before the dev server starts. The cleanup ensures the n8n CLI behaves consistently inside Docker and avoids community nodes that load nested `*.node.js` binaries. The behavior tracks the discussion in n8n issue #28572 (linked below) that clarified why such hooks must stay scoped to development environments.

## How the script is invoked

- The npm scripts `dev` and `dev:external` each define a `predev`/`predev:external` hook that runs `node scripts/postinstall.js` before launching the dev server.
- There is no `postinstall` script defined in `package.json` or the published `dist/package.json`, so the helper never executes automatically when installing the package.

## Why it stays dev-only

Publishing a `postinstall` hook would execute this script for every downstream install, which contradicts npm guidance and n8n policy (see https://github.com/n8n-io/n8n/issues/28572). Binding the cleanup to a dev-only command keeps the published package lightweight for consumers while still letting contributors run the necessary setup before `npm run dev`.

- **Original issue reference:** https://github.com/n8n-io/n8n/issues/28572
