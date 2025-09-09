# Tailscale MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)

> **A comprehensive Model Context Protocol (MCP) server for Tailscale management using the local Tailscale CLI**

This MCP server provides complete Tailscale network management capabilities directly within Warp terminal through natural language commands. Leverages the local `tailscale` CLI for maximum functionality and reliability - no API tokens required!

## 🚀 Features

### ✨ **CLI-First Approach**
- **🚫 No API Tokens Required**: Uses your local authenticated `tailscale` CLI
- **🔒 Maximum Security**: Inherits your CLI permissions and authentication
- **⚡ Full Feature Access**: Access to ALL Tailscale CLI functionality
- **🛡️ Reliable**: Direct CLI execution for consistent behavior

### 📊 **Status & Information**
- **Device Status**: Real-time connection status and peer information
- **Network Analysis**: Built-in `netcheck` for connectivity diagnostics
- **IP Management**: View Tailscale IP addresses and assignments
- **Version Information**: Tailscale version and build details

### 🔌 **Connection Management**
- **Connect/Disconnect**: `tailscale up/down` with full option support
- **Exit Nodes**: List, suggest, and manage exit nodes
- **Route Management**: Advertise and accept subnet routes
- **SSH Integration**: Enable and manage SSH access

### 🌐 **Network Utilities**
- **Tailscale Ping**: Network testing at the Tailscale layer
- **Port Testing**: Connect to remote ports via `nc`
- **DNS Queries**: Query DNS through Tailscale resolution
- **Network Diagnostics**: Comprehensive connectivity analysis

### 📁 **File & Drive Sharing**
- **File Transfer**: Send and receive files between devices
- **Drive Sharing**: Share directories across your tailnet
- **File Management**: List and manage shared content

### 🌍 **Serve & Funnel**
- **Local Serving**: Share content on your tailnet
- **Internet Funnel**: Expose services to the public internet
- **HTTPS Support**: Automatic TLS certificate management
- **Background Mode**: Run services in the background

### 🔐 **Security & Certificates**
- **TLS Certificates**: Generate certificates for your domains
- **Tailnet Lock**: Manage and monitor network security policies
- **Who Is**: Identify devices and users by IP

### 📱 **Device Management**
- **Device Listing**: View all devices with filtering support
- **Device Details**: Comprehensive device information
- **Real-time Status**: Online/offline status and activity

### 🔧 **Configuration & Settings**
- **Preference Management**: Modify Tailscale settings
- **Web Interface**: Start local web management interface
- **Updates**: Check for and install Tailscale updates
- **Diagnostics**: Built-in troubleshooting and bug reporting

### ⚠️ **Admin Functions** *(Requires API Access)*
- **Device Management**: Authorization, tagging, deletion
- **ACL Management**: Access control list policies
- **DNS Configuration**: Custom nameservers and MagicDNS
- **Auth Keys**: Create and manage authentication keys
- **Route Control**: Enable/disable subnet routes

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **Tailscale** installed and authenticated on your system
- **Warp Terminal** with MCP support
- *(Optional)* **Admin API access** for advanced management features

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

3. **Test the installation**:
   ```bash
   node test-cli.js
   ```

### 🔑 Verify Tailscale CLI Access

Ensure Tailscale is installed and you're logged in:

```bash
# Check Tailscale status
tailscale status

# If not logged in, authenticate
tailscale login
```

## ⚙️ Warp Configuration

### 🍺 With Homebrew Installation

Add this to your Warp MCP configuration file:

```json
{
  "mcpServers": {
    "tailscale": {
      "command": "tailscale-mcp"
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
      "args": ["/absolute/path/to/tailscale-mcp/src/index.js"]
    }
  }
}
```

**That's it!** No environment variables or API tokens needed - the MCP server uses your local Tailscale CLI authentication.

## 🎯 Usage Examples

Once configured, use natural language commands in Warp:

### Status & Information
```
# Check Tailscale connection status
"Show me my Tailscale status"

# List all devices in my tailnet
"List all my Tailscale devices"

# Get my Tailscale IP addresses
"What are my Tailscale IPs?"

# Check network connectivity
"Run Tailscale netcheck"
```

### Network Operations
```
# Ping another device
"Ping my server at 100.64.1.2"

# Check who owns an IP
"Who is 100.64.1.5?"

# Test DNS resolution
"Query DNS for example.com through Tailscale"

# Connect to Tailscale with options
"Connect to Tailscale as an exit node"
```

### File & Content Sharing
```
# List received files
"Show my Tailscale files"

# Send a file to another device
"Send report.pdf to my-server"

# Start serving a local directory
"Serve my website on port 8080"

# Expose service to internet
"Funnel my app on port 3000 to the internet"
```

### Advanced Features
```
# Get TLS certificate
"Get certificate for my-app.tail2d448.ts.net"

# Share a directory
"Share my Documents folder as 'docs'"

# Check exit nodes
"List available exit nodes"

# Start web interface
"Start Tailscale web interface"
```

## 🛠 Available MCP Tools

### Core CLI Tools

| Category | Tool | Description |
|----------|------|-------------|
| **Status** | `tailscale_status` | Connection status and peer info |
| | `tailscale_version` | Tailscale version information |
| | `tailscale_ip` | Show Tailscale IP addresses |
| | `tailscale_netcheck` | Network condition analysis |
| **Connection** | `tailscale_up` | Connect with options |
| | `tailscale_down` | Disconnect from Tailscale |
| **Devices** | `tailscale_list_devices` | List/filter devices |
| | `tailscale_get_device` | Get device details |
| | `tailscale_whois` | Identify device by IP |
| **Network** | `tailscale_ping` | Ping at Tailscale layer |
| | `tailscale_nc` | Connect to remote ports |
| **DNS** | `tailscale_dns_status` | DNS configuration status |
| | `tailscale_dns_query` | Query DNS via Tailscale |
| **Files** | `tailscale_file_list` | List received files |
| | `tailscale_file_send` | Send files to devices |
| | `tailscale_file_receive` | Receive/get files |
| **SSH** | `tailscale_ssh_list` | List SSH-capable devices |
| **Exit Nodes** | `tailscale_exit_node_list` | List available exit nodes |
| | `tailscale_exit_node_suggest` | Suggest best exit node |
| **Serve** | `tailscale_serve_status` | Show serve status |
| | `tailscale_serve_start` | Start serving content |
| | `tailscale_serve_stop` | Stop serving |
| **Funnel** | `tailscale_funnel_status` | Show funnel status |
| | `tailscale_funnel_start` | Expose to internet |
| | `tailscale_funnel_stop` | Stop funnel |
| **Certificates** | `tailscale_cert` | Get TLS certificates |
| **Lock** | `tailscale_lock_status` | Tailnet lock status |
| | `tailscale_lock_log` | Show lock log |
| **Drive** | `tailscale_drive_list` | List shared drives |
| | `tailscale_drive_share` | Share directory |
| | `tailscale_drive_unshare` | Stop sharing |
| **Config** | `tailscale_set` | Change preferences |
| | `tailscale_web` | Start web interface |
| | `tailscale_update` | Check/install updates |
| **Auth** | `tailscale_login` | Log in to account |
| | `tailscale_logout` | Log out |
| | `tailscale_switch` | Switch accounts |
| **System** | `tailscale_configure` | Configure features |
| | `tailscale_syspolicy` | Diagnose policies |
| | `tailscale_bugreport` | Generate bug report |
| | `tailscale_metrics` | Show metrics |
| | `tailscale_licenses` | License information |

### Legacy API Tools *(Requires Admin Access)*

| Category | Tool | Description |
|----------|------|-------------|
| **Admin** | `tailscale_update_device` | Update device settings |
| | `tailscale_delete_device` | Remove device |
| | `tailscale_get_acl` | Retrieve ACL policy |
| | `tailscale_update_acl` | Update ACL policy |
| | `tailscale_update_dns` | Update DNS config |
| | `tailscale_list_keys` | List auth keys |
| | `tailscale_create_key` | Create new auth key |
| | `tailscale_get_routes` | List subnet routes |
| | `tailscale_enable_route` | Enable route |
| | `tailscale_disable_route` | Disable route |
| | `tailscale_delete_route` | Delete route |

## 🔒 Security Notes

- ✅ Uses your existing Tailscale CLI authentication
- ✅ No tokens to store or manage
- ✅ Inherits your local permissions and access
- ✅ Commands execute with your user privileges

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"tailscale: command not found"** | Install Tailscale CLI and ensure it's in PATH |
| **"Not logged in"** | Run `tailscale login` to authenticate |
| **"MCP server not responding"** | Verify Node.js version and dependencies |
| **"Permission denied"** | Ensure you're logged into Tailscale |

### Debug Steps

1. **Test Tailscale CLI**: `tailscale status`
2. **Validate installation**: `node test-cli.js`
3. **Test MCP server**: `timeout 5s node src/index.js`
4. **Check Warp logs** for MCP-related errors

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
