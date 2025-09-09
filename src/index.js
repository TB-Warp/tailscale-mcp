#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { TailscaleClient } from './tailscale-client.js';

const TAILSCALE_TOKEN = process.env.TAILSCALE_TOKEN;
const TAILNET = process.env.TAILNET || 'default';

if (!TAILSCALE_TOKEN) {
  console.error('Error: TAILSCALE_TOKEN environment variable is required');
  process.exit(1);
}

const tailscale = new TailscaleClient(TAILSCALE_TOKEN, TAILNET);
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
              description: 'Device ID or name',
            },
          },
          required: ['deviceId'],
        },
      },
      {
        name: 'tailscale_update_device',
        description: 'Update device settings (authorize, tags, etc.)',
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
        description: 'Delete a device from the Tailnet',
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
        description: 'Get the current Access Control List (ACL) policy',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_update_acl',
        description: 'Update the Access Control List (ACL) policy',
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
        description: 'Update DNS settings for the Tailnet',
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
        description: 'List auth keys for the Tailnet',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_create_key',
        description: 'Create a new auth key',
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
        description: 'Get subnet routes for the Tailnet',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'tailscale_enable_route',
        description: 'Enable a subnet route',
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
        description: 'Disable a subnet route',
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
        description: 'Delete a subnet route',
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
      case 'tailscale_list_devices':
        return await tailscale.listDevices(args?.filter);

      case 'tailscale_get_device':
        return await tailscale.getDevice(args.deviceId);

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
