# Warp MCP Configuration Files

This directory contains configuration files for setting up Tailscale MCP with Warp terminal.

## Quick Setup

Run the automated setup script:
```bash
node setup-warp.js
```

## Manual Configuration

### 1. Locate your Warp config file:
- **macOS**: `~/.warp/mcp_config.json`
- **Linux**: `~/.config/warp/mcp_config.json`
- **Windows**: `%APPDATA%\Local\Warp\mcp_config.json`

### 2. Add the Tailscale MCP server:

Use the template in `warp-mcp-template.json` and update the paths:

```json
{
  "mcpServers": {
    "tailscale": {
      "command": "node",
      "args": [
        "/absolute/path/to/tailscale-mcp/src/index.js"
      ],
      "working_directory": "/absolute/path/to/tailscale-mcp"
    }
  }
}
```

### 3. Restart Warp and test:
```
"Show me my Tailscale status"
"List all my Tailscale devices"
```

## Configuration Options

The MCP server supports these configuration options:

- **command**: Always `"node"` (requires Node.js 18+)
- **args**: Path to the MCP server entry point
- **working_directory**: Project root directory (optional but recommended)

## Troubleshooting

1. **Server not starting**: Check that Node.js is installed and paths are correct
2. **CLI errors**: Ensure `tailscale` command is in PATH and authenticated
3. **Permission issues**: Make sure Warp can read the config file

For more help, see the main README.md file.
