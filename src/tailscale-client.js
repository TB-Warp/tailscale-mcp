import fetch from 'node-fetch';

export class TailscaleClient {
  constructor(token, tailnet = 'default') {
    this.token = token;
    this.tailnet = tailnet;
    this.baseUrl = 'https://api.tailscale.com/api/v2';
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tailscale API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(data, null, 2),
      }],
    };
  }

  async listDevices(filter) {
    try {
      const response = await this.makeRequest(`/tailnet/${this.tailnet}/devices`);
      
      if (filter) {
        const data = JSON.parse(response.content[0].text);
        const filtered = data.devices.filter(device => 
          device.name?.toLowerCase().includes(filter.toLowerCase()) ||
          device.addresses?.some(addr => addr.includes(filter)) ||
          device.id?.includes(filter)
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ devices: filtered }, null, 2),
          }],
        };
      }

      return response;
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error listing devices: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async getDevice(deviceId) {
    try {
      return await this.makeRequest(`/device/${deviceId}`);
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error getting device: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async updateDevice(deviceId, updates) {
    try {
      const body = {};
      
      if (updates.authorized !== undefined) {
        body.authorized = updates.authorized;
      }
      if (updates.tags) {
        body.tags = updates.tags;
      }
      if (updates.name) {
        body.name = updates.name;
      }

      return await this.makeRequest(`/device/${deviceId}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error updating device: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async deleteDevice(deviceId) {
    try {
      return await this.makeRequest(`/device/${deviceId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error deleting device: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async getACL() {
    try {
      return await this.makeRequest(`/tailnet/${this.tailnet}/acl`);
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error getting ACL: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async updateACL(aclData) {
    try {
      return await this.makeRequest(`/tailnet/${this.tailnet}/acl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/hujson',
          'If-Match': '*',
        },
        body: aclData,
      });
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error updating ACL: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async getDNS() {
    try {
      return await this.makeRequest(`/tailnet/${this.tailnet}/dns/nameservers`);
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error getting DNS settings: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async updateDNS(dnsSettings) {
    try {
      return await this.makeRequest(`/tailnet/${this.tailnet}/dns/nameservers`, {
        method: 'POST',
        body: JSON.stringify({
          dns: dnsSettings.dns || [],
          magicDNS: dnsSettings.magicDns !== undefined ? dnsSettings.magicDns : true,
        }),
      });
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error updating DNS settings: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async listKeys() {
    try {
      return await this.makeRequest(`/tailnet/${this.tailnet}/keys`);
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error listing auth keys: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async createKey(keyOptions = {}) {
    try {
      const body = {
        capabilities: {
          devices: {
            create: {
              reusable: keyOptions.reusable || false,
              ephemeral: keyOptions.ephemeral || false,
              preauthorized: keyOptions.preauthorized || false,
              tags: keyOptions.tags || [],
            },
          },
        },
      };

      if (keyOptions.expiry) {
        body.expirySeconds = Math.floor((new Date(keyOptions.expiry) - new Date()) / 1000);
      }

      if (keyOptions.description) {
        body.description = keyOptions.description;
      }

      return await this.makeRequest(`/tailnet/${this.tailnet}/keys`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error creating auth key: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async getRoutes() {
    try {
      return await this.makeRequest(`/tailnet/${this.tailnet}/routes`);
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error getting routes: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async enableRoute(routeId) {
    try {
      return await this.makeRequest(`/tailnet/${this.tailnet}/routes/${routeId}`, {
        method: 'POST',
        body: JSON.stringify({ enabled: true }),
      });
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error enabling route: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async disableRoute(routeId) {
    try {
      return await this.makeRequest(`/tailnet/${this.tailnet}/routes/${routeId}`, {
        method: 'POST',
        body: JSON.stringify({ enabled: false }),
      });
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error disabling route: ${error.message}`,
        }],
        isError: true,
      };
    }
  }

  async deleteRoute(routeId) {
    try {
      return await this.makeRequest(`/tailnet/${this.tailnet}/routes/${routeId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error deleting route: ${error.message}`,
        }],
        isError: true,
      };
    }
  }
}
