#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { TailscaleCLI } from './tailscale-cli.js';

// No token needed - using local CLI
const tailscale = new TailscaleCLI();
const server = new Server(
  {
    name: 'tailscale-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Core status and connectivity
      {
        name: 'tailscale_status',
        description: 'Show Tailscale connection status and peer information',
        inputSchema: {
          type: 'object',
          properties: {
            json: {
              type: 'boolean',
              description: 'Return output in JSON format',
              default: true,
            },
          },
        },
      },
      {
        name: 'tailscale_version',
        description: 'Show Tailscale version information',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_ip',
        description: 'Show Tailscale IP addresses',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_netcheck',
        description: 'Print analysis of local network conditions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      
      // Connection management
      {
        name: 'tailscale_up',
        description: 'Connect to Tailscale with various options',
        inputSchema: {
          type: 'object',
          properties: {
            authkey: {
              type: 'string',
              description: 'Auth key for authentication',
            },
            hostname: {
              type: 'string',
              description: 'Hostname to use',
            },
            advertiseRoutes: {
              type: 'string',
              description: 'Routes to advertise (comma-separated)',
            },
            acceptRoutes: {
              type: 'boolean',
              description: 'Accept routes from other devices',
            },
            exitNode: {
              type: 'string',
              description: 'Exit node to use',
            },
            advertiseExitNode: {
              type: 'boolean',
              description: 'Advertise as exit node',
            },
            ssh: {
              type: 'boolean',
              description: 'Enable SSH server',
            },
          },
        },
      },
      {
        name: 'tailscale_down',
        description: 'Disconnect from Tailscale',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      
      // Device management (limited via CLI)
      {
        name: 'tailscale_list_devices',
        description: 'List all devices in the Tailnet',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'Filter devices by name or IP (optional)',
            },
          },
        },
      },
      {
        name: 'tailscale_get_device',
        description: 'Get detailed information about a specific device',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: 'Device ID, hostname, or IP',
            },
          },
          required: ['deviceId'],
        },
      },
      {
        name: 'tailscale_whois',
        description: 'Show machine and user associated with a Tailscale IP',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              type: 'string',
              description: 'IP address or hostname to look up',
            },
          },
          required: ['target'],
        },
      },
      
      // Network utilities
      {
        name: 'tailscale_ping',
        description: 'Ping a host at the Tailscale layer',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              type: 'string',
              description: 'Target hostname or IP to ping',
            },
            count: {
              type: 'number',
              description: 'Number of ping packets to send',
            },
            timeout: {
              type: 'number',
              description: 'Timeout in seconds',
            },
          },
          required: ['target'],
        },
      },
      {
        name: 'tailscale_nc',
        description: 'Connect to a port on a host via Tailscale',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              type: 'string',
              description: 'Target hostname or IP',
            },
            port: {
              type: 'number',
              description: 'Port number to connect to',
            },
            listen: {
              type: 'boolean',
              description: 'Listen mode',
            },
          },
          required: ['target', 'port'],
        },
      },
      
      // DNS functionality
      {
        name: 'tailscale_dns_status',
        description: 'Show DNS configuration status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_dns_query',
        description: 'Query DNS via Tailscale',
        inputSchema: {
          type: 'object',
          properties: {
            domain: {
              type: 'string',
              description: 'Domain to query',
            },
            type: {
              type: 'string',
              description: 'DNS record type (A, AAAA, MX, etc.)',
              default: 'A',
            },
          },
          required: ['domain'],
        },
      },
      
      // File sharing
      {
        name: 'tailscale_file_list',
        description: 'List received files',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_file_send',
        description: 'Send files to another Tailscale device',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              type: 'string',
              description: 'Target device hostname or IP',
            },
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Files to send',
            },
          },
          required: ['target', 'files'],
        },
      },
      {
        name: 'tailscale_file_receive',
        description: 'Receive/get files from Tailscale',
        inputSchema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Files to receive',
            },
          },
          required: ['files'],
        },
      },
      
      // SSH functionality
      {
        name: 'tailscale_ssh_list',
        description: 'List SSH-capable devices',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      
      // Exit node management
      {
        name: 'tailscale_exit_node_list',
        description: 'List available exit nodes',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_exit_node_suggest',
        description: 'Suggest the best exit node',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      
      // Serve and Funnel
      {
        name: 'tailscale_serve_status',
        description: 'Show serve status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_serve_start',
        description: 'Start serving content',
        inputSchema: {
          type: 'object',
          properties: {
            port: {
              type: 'number',
              description: 'Port to serve on',
            },
            https: {
              type: 'boolean',
              description: 'Use HTTPS',
            },
            bg: {
              type: 'boolean',
              description: 'Run in background',
            },
          },
          required: ['port'],
        },
      },
      {
        name: 'tailscale_serve_stop',
        description: 'Stop serving content',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_funnel_status',
        description: 'Show funnel status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_funnel_start',
        description: 'Start exposing content to the internet via funnel',
        inputSchema: {
          type: 'object',
          properties: {
            port: {
              type: 'number',
              description: 'Port to funnel',
            },
            https: {
              type: 'boolean',
              description: 'Use HTTPS',
            },
            bg: {
              type: 'boolean',
              description: 'Run in background',
            },
          },
          required: ['port'],
        },
      },
      {
        name: 'tailscale_funnel_stop',
        description: 'Stop funnel',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      
      // Certificate management
      {
        name: 'tailscale_cert',
        description: 'Get TLS certificate for domain',
        inputSchema: {
          type: 'object',
          properties: {
            domain: {
              type: 'string',
              description: 'Domain to get certificate for',
            },
          },
          required: ['domain'],
        },
      },
      
      // Lock management
      {
        name: 'tailscale_lock_status',
        description: 'Show tailnet lock status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_lock_log',
        description: 'Show tailnet lock log',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      
      // Drive sharing
      {
        name: 'tailscale_drive_list',
        description: 'List shared drives',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_drive_share',
        description: 'Share a directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to share',
            },
            name: {
              type: 'string',
              description: 'Name for the share',
            },
          },
          required: ['path', 'name'],
        },
      },
      {
        name: 'tailscale_drive_unshare',
        description: 'Stop sharing a directory',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of share to stop',
            },
          },
          required: ['name'],
        },
      },
      
      // Web interface
      {
        name: 'tailscale_web',
        description: 'Start web interface',
        inputSchema: {
          type: 'object',
          properties: {
            listen: {
              type: 'string',
              description: 'Address to listen on',
            },
            readonly: {
              type: 'boolean',
              description: 'Run in read-only mode',
            },
          },
        },
      },
      
      // Settings
      {
        name: 'tailscale_set',
        description: 'Change Tailscale preferences',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Setting key',
            },
            value: {
              type: 'string',
              description: 'Setting value',
            },
          },
          required: ['key', 'value'],
        },
      },
      
      // Update
      {
        name: 'tailscale_update',
        description: 'Update Tailscale',
        inputSchema: {
          type: 'object',
          properties: {
            check: {
              type: 'boolean',
              description: 'Check for updates only',
            },
            version: {
              type: 'string',
              description: 'Specific version to update to',
            },
          },
        },
      },
      
      // Authentication
      {
        name: 'tailscale_login',
        description: 'Log in to Tailscale account',
        inputSchema: {
          type: 'object',
          properties: {
            server: {
              type: 'string',
              description: 'Login server URL',
            },
            authkey: {
              type: 'string',
              description: 'Auth key for login',
            },
          },
        },
      },
      {
        name: 'tailscale_logout',
        description: 'Log out and expire current node key',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_switch',
        description: 'Switch to different Tailscale account',
        inputSchema: {
          type: 'object',
          properties: {
            account: {
              type: 'string',
              description: 'Account to switch to',
            },
          },
          required: ['account'],
        },
      },
      
      // Configuration and diagnostics
      {
        name: 'tailscale_configure',
        description: 'Configure host for Tailscale features',
        inputSchema: {
          type: 'object',
          properties: {
            feature: {
              type: 'string',
              description: 'Feature to configure',
            },
          },
          required: ['feature'],
        },
      },
      {
        name: 'tailscale_syspolicy',
        description: 'Diagnose MDM and system policy configuration',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_bugreport',
        description: 'Generate shareable bug report identifier',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_metrics',
        description: 'Show Tailscale metrics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_licenses',
        description: 'Show open source license information',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      
      // Legacy API-compatible tools (with limitations noted)
      {
        name: 'tailscale_update_device',
        description: 'Update device settings (requires admin API access)',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: 'Device ID',
            },
            authorized: {
              type: 'boolean',
              description: 'Authorize or deauthorize the device',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Device tags',
            },
            name: {
              type: 'string',
              description: 'Device name',
            },
          },
          required: ['deviceId'],
        },
      },
      {
        name: 'tailscale_delete_device',
        description: 'Delete a device from the Tailnet (requires admin API access)',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: 'Device ID',
            },
          },
          required: ['deviceId'],
        },
      },
      {
        name: 'tailscale_get_acl',
        description: 'Get the current Access Control List (requires admin API access)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_update_acl',
        description: 'Update the Access Control List (requires admin API access)',
        inputSchema: {
          type: 'object',
          properties: {
            acl: {
              type: 'string',
              description: 'ACL policy in HuJSON format',
            },
          },
          required: ['acl'],
        },
      },
      {
        name: 'tailscale_get_dns',
        description: 'Get DNS settings for the Tailnet',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_update_dns',
        description: 'Update DNS settings (requires admin API access)',
        inputSchema: {
          type: 'object',
          properties: {
            dns: {
              type: 'array',
              items: { type: 'string' },
              description: 'DNS nameservers',
            },
            magicDns: {
              type: 'boolean',
              description: 'Enable MagicDNS',
            },
          },
        },
      },
      {
        name: 'tailscale_list_keys',
        description: 'List auth keys (requires admin API access)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_create_key',
        description: 'Create a new auth key (requires admin API access)',
        inputSchema: {
          type: 'object',
          properties: {
            reusable: {
              type: 'boolean',
              description: 'Whether the key can be used multiple times',
              default: false,
            },
            ephemeral: {
              type: 'boolean',
              description: 'Whether devices using this key are ephemeral',
              default: false,
            },
            preauthorized: {
              type: 'boolean',
              description: 'Whether devices using this key are pre-authorized',
              default: false,
            },
            expiry: {
              type: 'string',
              description: 'Expiry time in RFC3339 format (optional)',
            },
            description: {
              type: 'string',
              description: 'Description for the key',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for devices using this key',
            },
          },
        },
      },
      {
        name: 'tailscale_get_routes',
        description: 'Get subnet routes (requires admin API access)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_enable_route',
        description: 'Enable a subnet route (requires admin API access)',
        inputSchema: {
          type: 'object',
          properties: {
            routeId: {
              type: 'string',
              description: 'Route ID',
            },
          },
          required: ['routeId'],
        },
      },
      {
        name: 'tailscale_disable_route',
        description: 'Disable a subnet route (requires admin API access)',
        inputSchema: {
          type: 'object',
          properties: {
            routeId: {
              type: 'string',
              description: 'Route ID',
            },
          },
          required: ['routeId'],
        },
      },
      {
        name: 'tailscale_delete_route',
        description: 'Delete a subnet route (requires admin API access)',
        inputSchema: {
          type: 'object',
          properties: {
            routeId: {
              type: 'string',
              description: 'Route ID',
            },
          },
          required: ['routeId'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Core status and connectivity
      case 'tailscale_status':
        return await tailscale.status(args?.json !== false);
      
      case 'tailscale_version':
        return await tailscale.version();
      
      case 'tailscale_ip':
        return await tailscale.ip();
      
      case 'tailscale_netcheck':
        return await tailscale.netcheck();
      
      // Connection management
      case 'tailscale_up':
        return await tailscale.up(args || {});
      
      case 'tailscale_down':
        return await tailscale.down();
      
      // Device management
      case 'tailscale_list_devices':
        return await tailscale.listDevices(args?.filter);

      case 'tailscale_get_device':
        return await tailscale.getDevice(args.deviceId);
      
      case 'tailscale_whois':
        return await tailscale.whois(args.target);
      
      // Network utilities
      case 'tailscale_ping':
        return await tailscale.ping(args.target, {
          count: args.count,
          timeout: args.timeout,
        });
      
      case 'tailscale_nc':
        return await tailscale.nc(args.target, args.port, {
          listen: args.listen,
        });
      
      // DNS functionality
      case 'tailscale_dns_status':
        return await tailscale.dnsStatus();
      
      case 'tailscale_dns_query':
        return await tailscale.dnsQuery(args.domain, args.type);
      
      // File sharing
      case 'tailscale_file_list':
        return await tailscale.fileList();
      
      case 'tailscale_file_send':
        return await tailscale.fileSend(args.target, args.files);
      
      case 'tailscale_file_receive':
        return await tailscale.fileReceive(args.files);
      
      // SSH functionality
      case 'tailscale_ssh_list':
        return await tailscale.sshList();
      
      // Exit node management
      case 'tailscale_exit_node_list':
        return await tailscale.exitNodeList();
      
      case 'tailscale_exit_node_suggest':
        return await tailscale.exitNodeSuggest();
      
      // Serve and Funnel
      case 'tailscale_serve_status':
        return await tailscale.serveStatus();
      
      case 'tailscale_serve_start':
        return await tailscale.serveStart(args.port, {
          https: args.https,
          bg: args.bg,
        });
      
      case 'tailscale_serve_stop':
        return await tailscale.serveStop();
      
      case 'tailscale_funnel_status':
        return await tailscale.funnelStatus();
      
      case 'tailscale_funnel_start':
        return await tailscale.funnelStart(args.port, {
          https: args.https,
          bg: args.bg,
        });
      
      case 'tailscale_funnel_stop':
        return await tailscale.funnelStop();
      
      // Certificate management
      case 'tailscale_cert':
        return await tailscale.cert(args.domain);
      
      // Lock management
      case 'tailscale_lock_status':
        return await tailscale.lockStatus();
      
      case 'tailscale_lock_log':
        return await tailscale.lockLog();
      
      // Drive sharing
      case 'tailscale_drive_list':
        return await tailscale.driveList();
      
      case 'tailscale_drive_share':
        return await tailscale.driveShare(args.path, args.name);
      
      case 'tailscale_drive_unshare':
        return await tailscale.driveUnshare(args.name);
      
      // Web interface
      case 'tailscale_web':
        return await tailscale.webStart({
          listen: args.listen,
          readonly: args.readonly,
        });
      
      // Settings
      case 'tailscale_set':
        return await tailscale.set(args.key, args.value);
      
      // Update
      case 'tailscale_update':
        return await tailscale.update({
          check: args.check,
          version: args.version,
        });
      
      // Authentication
      case 'tailscale_login':
        return await tailscale.login({
          server: args.server,
          authkey: args.authkey,
        });
      
      case 'tailscale_logout':
        return await tailscale.logout();
      
      case 'tailscale_switch':
        return await tailscale.switch(args.account);
      
      // Configuration and diagnostics
      case 'tailscale_configure':
        return await tailscale.configure(args.feature);
      
      case 'tailscale_syspolicy':
        return await tailscale.syspolicy();
      
      case 'tailscale_bugreport':
        return await tailscale.bugreport();
      
      case 'tailscale_metrics':
        return await tailscale.metrics();
      
      case 'tailscale_licenses':
        return await tailscale.licenses();
      
      // Legacy API-compatible tools (with limitations noted)
      case 'tailscale_update_device':
        return await tailscale.updateDevice(args.deviceId, {
          authorized: args.authorized,
          tags: args.tags,
          name: args.name,
        });

      case 'tailscale_delete_device':
        return await tailscale.deleteDevice(args.deviceId);

      case 'tailscale_get_acl':
        return await tailscale.getACL();

      case 'tailscale_update_acl':
        return await tailscale.updateACL(args.acl);

      case 'tailscale_get_dns':
        return await tailscale.getDNS();

      case 'tailscale_update_dns':
        return await tailscale.updateDNS({
          dns: args.dns,
          magicDns: args.magicDns,
        });

      case 'tailscale_list_keys':
        return await tailscale.listKeys();

      case 'tailscale_create_key':
        return await tailscale.createKey({
          reusable: args.reusable,
          ephemeral: args.ephemeral,
          preauthorized: args.preauthorized,
          expiry: args.expiry,
          description: args.description,
          tags: args.tags,
        });

      case 'tailscale_get_routes':
        return await tailscale.getRoutes();

      case 'tailscale_enable_route':
        return await tailscale.enableRoute(args.routeId);

      case 'tailscale_disable_route':
        return await tailscale.disableRoute(args.routeId);

      case 'tailscale_delete_route':
        return await tailscale.deleteRoute(args.routeId);

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error.message}`
    );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Tailscale MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
