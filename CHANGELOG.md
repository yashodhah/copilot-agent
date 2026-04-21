# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-21

### Added
- Initial stable release of the GitHub Copilot Agent n8n community node
- `CopilotAgent` node for integrating GitHub Copilot into n8n workflows
- Support for multiple AI models (GPT-5, Claude Sonnet 4.5, GPT-4.1) via dynamic model loading from the SDK with static fallback
- **Session isolation toggle** (`Share Session Across Items`): each item gets its own independent session by default; enable to preserve conversation context across a batch
- Dual authentication modes:
  - **GitHub Token (Per-User)**: personal access token passed per-request, suitable for small teams and individual subscriptions
  - **Server Token (Shared Service Account)**: connects to a remote CLI server with its own environment token, suitable for shared deployments
- Optional remote CLI server URL (`CLI Server URL`) for scaled or Docker/Kubernetes deployments
- `usableAsTool: true` — node can be used as an AI tool within n8n Agent nodes
- CI pipeline (`.github/workflows/ci.yml`) running lint and build on every PR and push to main
- Publish pipeline (`.github/workflows/publish.yml`) with npm provenance attestation on version tags, satisfying the May 1 2026 n8n requirement
- `postinstall` script to patch n8n dev tooling for correct local development experience
- MIT license

### Security
- Documented unauthenticated TCP connection warning for remote CLI deployments with mitigation guidance (private network, firewall rules, SSH tunneling)

## [0.1.0] - 2026-04-01

### Added
- Initial development version
- Basic `CopilotAgent` node structure using `@github/copilot-sdk` v0.2.2
- GitHub token credential type
- Single-session execution model
