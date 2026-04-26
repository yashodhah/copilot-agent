## Manual Two-Container Testing with Docker Compose

`docker/docker-compose.yml` defines two services so you can exercise the Copilot CLI + n8n pairing without installing either binary on your host.

| Service | Role | Key ports |
| --- | --- | --- |
| `copilot-cli` | Remote CLI server that holds a GitHub token and responds to the agent | `8080` (host + network)
| `n8n` | An instrumented n8n instance that connects to `copilot-cli` and runs the Copilot Agent node | `5678` (host) → `5679` (container)

### Prerequisites

- Docker (desktop or engine), 27-compatible compose support (`docker compose` command)
- A GitHub token with `copilot` scope or a Copilot Cloud token that works with the CLI server
- Access to the Copilot Agent node inside the n8n UI (after you import the workflow)

### 1) Set your GitHub token

The `copilot-cli` container reads `GITHUB_TOKEN` from its environment before it starts, so export it on your host before you spin up the compose stack:

```bash
export GITHUB_TOKEN=your_token_here
```

This token is the credential that `copilot-cli` will present to GitHub for every request.

### 2) Start services with Docker Compose

Run compose from the `docker/` directory so the relative paths match `docker/docker-compose.yml`:

```bash
cd docker
docker compose up -d --build
```

The stack builds both images (CLI + n8n) and attaches them to `copilot-test-net`, ensuring the containers can reach each other by name.

### 3) Configure n8n to use the remote CLI server

Open the Copilot Agent credential configuration inside n8n and choose **Authentication Mode** → **Server Authenticated**. The stack already exposes the CLI server on the shared Docker network:

- **CLI Server URL**: `copilot-cli:8080` (this is the hostname that the `n8n` container uses inside the network)
- n8n does **not** show or need a token (the container shares the one you exported)

If you want to talk to the CLI server from your host or another machine, set the URL to `localhost:8080` (if you forwarded the port) or to the host/IP of the machine running the stack. Keep the traffic inside a private network unless you wrap it in SSH/VPN.

### 4) Verify container-to-container reachability

```bash
docker compose exec n8n sh -lc "wget -qO- http://copilot-cli:8080 >/dev/null && echo reachable || echo not-reachable"
```

Expected output: `reachable`. This proves that n8n can resolve the CLI service name and talk to the server authenticated endpoint.

### 5) Access n8n and exercise both auth modes

Launch the UI at `http://localhost:5678`. From there:

1. **Server Authenticated mode**
   - Select the credential you configured above
   - Use the Copilot Agent node to open the model dropdown and send a prompt such as `Reply exactly with OK`
   - Confirm `success: true` and that `response` is non-empty

2. **Token (PAT) mode**
   - Create a new credential, choose **Authentication Mode** → **PAT**, and paste the same token (or a different PAT)
   - Run the same prompt and confirm the CLA server is not required (the node spawns a local CLI subprocess for PAT mode)

### 6) Clean up

```bash
docker compose down
```

### Remote CLI server notes

- `copilot-cli` is the remote server that n8n connects to. It is intentionally separated so you can reuse the same server from multiple n8n workers or from other hosts.
- The container exposes port `8080` to the host. If another machine needs to access it, point `CLI Server URL` to `host:8080` (or the mapped port) and make sure the machine can reach the Docker host over your private network or VPN.
- To test a remote CLI server outside of Docker, run `copilot-cli --server 0.0.0.0:8080` on the desired host, export `GITHUB_TOKEN`, and then configure the n8n credential to point at that address.

### Troubleshooting

- **Model dropdown in n8n stays empty**
  - Run `docker compose ps` to ensure both containers are `Up`
  - Tail the CLI logs: `docker compose logs -f copilot-cli`
- **Server Authenticated mode fails**
  - Re-export `GITHUB_TOKEN` and restart the CLI container
  - Confirm `CLI Server URL` is exactly `copilot-cli:8080` (no `http://`)
- **PAT mode fails**
  - Ensure the PAT has `copilot` scope
  - Delete and recreate the PAT credential inside n8n (it caches the value)
- **Cross-container networking issues**
  - Inspect the network: `docker network inspect copilot-test-net`
  - Confirm you are on the same network/subnet when connecting from another host
  - If necessary, set the CLI server hostname explicitly with `COPILOT_HOST`/`--host`
