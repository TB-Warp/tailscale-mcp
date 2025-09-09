# Tailscale MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)

> **A comprehensive Model Context Protocol (MCP) server for Tailscale management**

This MCP server provides complete Tailscale network management capabilities directly within Warp terminal through natural language commands. Manage devices, ACLs, DNS, authentication keys, and subnet routes with ease.

## 🚀 Features

### 📱 Device Management
- **List & Filter Devices**: View all devices in your Tailnet with advanced filtering
- **Device Details**: Get comprehensive information about any device
- **Authorization Control**: Authorize/deauthorize devices remotely
- **Device Updates**: Modify device names, tags, and settings
- **Device Removal**: Safely remove devices from your network

### 🔒 Access Control Lists (ACL)
- **Policy Retrieval**: Get current ACL configurations
- **Policy Updates**: Modify ACL policies with HuJSON support
- **Permission Management**: Fine-grained access control

### 🌐 DNS Management
- **DNS Configuration**: View and modify DNS settings
- **MagicDNS Control**: Enable/disable MagicDNS features
- **Custom Nameservers**: Set custom DNS nameservers

### 🔑 Authentication Keys
- **Key Generation**: Create auth keys with custom properties
- **Key Listing**: View all existing authentication keys
- **Advanced Options**: Reusable, ephemeral, preauthorized keys
- **Expiration Control**: Set custom expiration times

### 🛣️ Subnet Route Management
- **Route Listing**: View all subnet routes
- **Route Control**: Enable/disable routes as needed
- **Route Cleanup**: Remove unused routes

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **Tailscale Account** with admin access
- **API Token** with appropriate permissions
- **Warp Terminal** with MCP support

## 🛠 Installation

### 🍺 Homebrew Installation (Recommended)

**One-line installation:**
```bash
curl -fsSL https://raw.githubusercontent.com/TB-Warp/tailscale-mcp/main/scripts/install.sh | bash
```

**Or manually:**
```bash
# Add the tap
brew tap tb-warp/tailscale-mcp https://github.com/TB-Warp/tailscale-mcp

# Install tailscale-mcp
brew install tailscale-mcp

# Run setup
tailscale-mcp-setup
```

### 🐙 Manual Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TB-Warp/tailscale-mcp.git
   cd tailscale-mcp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Validate setup**:
   ```bash
   npm test
   ```

### 🔑 Get Your Tailscale API Token

- Visit [Tailscale Admin Console](https://login.tailscale.com/admin/settings/keys)
- Click "Generate API key"
- Select appropriate permissions (recommend: "All" for full functionality)
- Copy the generated token

## ⚙️ Warp Configuration

### 🍺 With Homebrew Installation

Add this to your Warp MCP configuration file:

```json
{
  "mcpServers": {
    "tailscale": {
      "command": "tailscale-mcp",
      "env": {
        "TAILSCALE_TOKEN": "tskey-api-xxxxx-your-actual-token-here",
        "TAILNET": "your-tailnet-name"
      }
    }
  }
}
```

### 🐙 With Manual Installation

Add this to your Warp MCP configuration file:

```json
{
  "mcpServers": {
    "tailscale": {
      "command": "node",
      "args": ["/absolute/path/to/tailscale-mcp/src/index.js"],
      "env": {
        "TAILSCALE_TOKEN": "tskey-api-xxxxx-your-actual-token-here",
        "TAILNET": "your-tailnet-name"
      }
    }
  }
}
```

**Important**: Replace placeholders with your actual values.

## 🎯 Usage Examples

Once configured, use natural language commands in Warp:

### Device Management
```
# List all devices
"Show me all my Tailscale devices"

# Filter devices
"List devices with 'server' in the name"

# Device details
"Get details for device ID 12345"

# Authorization
"Authorize device with name 'laptop-work'"
```

### Network Management
```
# DNS settings
"Show my Tailscale DNS configuration"

# Route management
"List all subnet routes"
"Enable route with ID 'route-abc123'"
```

## 🛠 Available MCP Tools

| Category | Tool | Description |
|----------|------|-------------|
| **Devices** | `tailscale_list_devices` | List/filter devices |
| | `tailscale_get_device` | Get device details |
| | `tailscale_update_device` | Update device settings |
| | `tailscale_delete_device` | Remove device |
| **ACL** | `tailscale_get_acl` | Retrieve ACL policy |
| | `tailscale_update_acl` | Update ACL policy |
| **DNS** | `tailscale_get_dns` | Get DNS settings |
| | `tailscale_update_dns` | Update DNS config |
| **Auth** | `tailscale_list_keys` | List auth keys |
| | `tailscale_create_key` | Create new auth key |
| **Routes** | `tailscale_get_routes` | List subnet routes |
| | `tailscale_enable_route` | Enable route |
| | `tailscale_disable_route` | Disable route |
| | `tailscale_delete_route` | Delete route |

## 🔒 Security Best Practices

- ✅ Store tokens in environment variables, never in code
- ✅ Use minimal required permissions
- ✅ Rotate tokens regularly
- ❌ Never commit tokens to version control

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"TAILSCALE_TOKEN required"** | Set environment variable or check Warp config |
| **"API error (401)"** | Verify token validity and permissions |
| **"Server not responding"** | Verify Node.js version and dependencies |

### Debug Steps

1. **Validate installation**: `npm test`
2. **Test with token**: `TAILSCALE_TOKEN="your_token" node src/index.js`
3. **Check Warp logs** for MCP-related errors

## 🔄 Updating

### 🍺 Homebrew Update
```bash
brew upgrade tailscale-mcp
```

### 🐙 Manual Update
```bash
cd /path/to/tailscale-mcp
git pull origin main
npm install
```

## 🗑️ Uninstalling

### 🍺 Homebrew Uninstall
```bash
# Quick uninstall
curl -fsSL https://raw.githubusercontent.com/TB-Warp/tailscale-mcp/main/scripts/uninstall.sh | bash

# Or manually
brew uninstall tailscale-mcp
brew untap tb-warp/tailscale-mcp
```

### 🐙 Manual Uninstall
```bash
# Remove the cloned directory
rm -rf /path/to/tailscale-mcp

# Remove from Warp MCP configuration
# (edit your MCP config file manually)
```

## 🤝 Contributing

Contributions are welcome! Please:

1. **Fork** the repository
2. **Create** a feature branch
3. **Submit** a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/TB-Warp/tailscale-mcp/issues)
- **Tailscale API**: [Official Documentation](https://tailscale.com/kb/1101/api/)

---

**Made with ❤️ by the TB-Warp team**
