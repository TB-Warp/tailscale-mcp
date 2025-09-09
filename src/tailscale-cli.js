import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class TailscaleCLI {
  constructor() {
    // No token needed - using local CLI
  }

  async executeCommand(command, options = {}) {
    try {
      const fullCommand = `tailscale ${command}`;
      console.error(`Executing: ${fullCommand}`);
      
      const { stdout, stderr } = await execAsync(fullCommand, {
        timeout: 30000,
        ...options
      });
      
      if (stderr && !options.ignoreStderr) {
        console.error(`Command stderr: ${stderr}`);
      }
      
      return {
        content: [{
          type: 'text',
          text: stdout.trim() || 'Command executed successfully',
        }],
        success: true
      };
    } catch (error) {
      console.error(`Command failed: ${error.message}`);
      return {
        content: [{
          type: 'text',
          text: `Error executing command: ${error.message}`,
        }],
        isError: true,
        success: false
      };
    }
  }

  async executeJSONCommand(command, options = {}) {
    try {
      const result = await this.executeCommand(command, options);
      
      if (result.isError) {
        return result;
      }
      
      try {
        const jsonData = JSON.parse(result.content[0].text);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(jsonData, null, 2),
          }],
          success: true
        };
      } catch (parseError) {
        // If it's not JSON, return as-is
        return result;
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error executing JSON command: ${error.message}`,
        }],
        isError: true,
        success: false
      };
    }
  }

  // Core status and info commands
  async status(json = true) {
    const command = json ? 'status --json' : 'status';
    return await this.executeJSONCommand(command);
  }

  async version() {
    return await this.executeCommand('version');
  }

  async ip() {
    return await this.executeCommand('ip');
  }

  async netcheck() {
    return await this.executeCommand('netcheck');
  }

  // Connection management
  async up(options = {}) {
    let command = 'up';
    
    if (options.authkey) {
      command += ` --authkey=${options.authkey}`;
    }
    if (options.hostname) {
      command += ` --hostname=${options.hostname}`;
    }
    if (options.advertiseRoutes) {
      command += ` --advertise-routes=${options.advertiseRoutes}`;
    }
    if (options.acceptRoutes) {
      command += ' --accept-routes';
    }
    if (options.exitNode) {
      command += ` --exit-node=${options.exitNode}`;
    }
    if (options.advertiseExitNode) {
      command += ' --advertise-exit-node';
    }
    if (options.ssh) {
      command += ' --ssh';
    }
    
    return await this.executeCommand(command);
  }

  async down() {
    return await this.executeCommand('down');
  }

  // DNS commands
  async dnsStatus() {
    return await this.executeCommand('dns status');
  }

  async dnsQuery(domain, type = 'A') {
    return await this.executeCommand(`dns query ${domain} ${type}`);
  }

  // File sharing
  async fileList() {
    return await this.executeCommand('file list');
  }

  async fileSend(target, files) {
    const fileList = Array.isArray(files) ? files.join(' ') : files;
    return await this.executeCommand(`file cp ${fileList} ${target}:`);
  }

  async fileReceive(files) {
    const fileList = Array.isArray(files) ? files.join(' ') : files;
    return await this.executeCommand(`file get ${fileList}`);
  }

  // SSH functionality
  async sshList() {
    return await this.executeCommand('ssh');
  }

  // Network utilities
  async ping(target, options = {}) {
    let command = `ping ${target}`;
    
    if (options.count) {
      command += ` -c ${options.count}`;
    }
    if (options.timeout) {
      command += ` -W ${options.timeout}`;
    }
    
    return await this.executeCommand(command);
  }

  async whois(ipOrDomain) {
    return await this.executeCommand(`whois ${ipOrDomain}`);
  }

  // Exit node management
  async exitNodeList() {
    return await this.executeCommand('exit-node list');
  }

  async exitNodeSuggest() {
    return await this.executeCommand('exit-node suggest');
  }

  // Serve and Funnel
  async serveStatus() {
    return await this.executeCommand('serve status');
  }

  async serveStart(port, options = {}) {
    let command = `serve ${port}`;
    
    if (options.https) {
      command += ' --https';
    }
    if (options.bg) {
      command += ' --bg';
    }
    
    return await this.executeCommand(command);
  }

  async serveStop() {
    return await this.executeCommand('serve reset');
  }

  async funnelStatus() {
    return await this.executeCommand('funnel status');
  }

  async funnelStart(port, options = {}) {
    let command = `funnel ${port}`;
    
    if (options.https) {
      command += ' --https';
    }
    if (options.bg) {
      command += ' --bg';
    }
    
    return await this.executeCommand(command);
  }

  async funnelStop() {
    return await this.executeCommand('funnel reset');
  }

  // Certificate management
  async cert(domain) {
    return await this.executeCommand(`cert ${domain}`);
  }

  // Lock management
  async lockStatus() {
    return await this.executeCommand('lock status');
  }

  async lockLog() {
    return await this.executeCommand('lock log');
  }

  // Drive sharing
  async driveList() {
    return await this.executeCommand('drive list');
  }

  async driveShare(path, name) {
    return await this.executeCommand(`drive share ${path} ${name}`);
  }

  async driveUnshare(name) {
    return await this.executeCommand(`drive unshare ${name}`);
  }

  // Web interface
  async webStart(options = {}) {
    let command = 'web';
    
    if (options.listen) {
      command += ` --listen=${options.listen}`;
    }
    if (options.readonly) {
      command += ' --readonly';
    }
    
    return await this.executeCommand(command);
  }

  // Settings and preferences
  async set(key, value) {
    return await this.executeCommand(`set ${key}=${value}`);
  }

  // Update
  async update(options = {}) {
    let command = 'update';
    
    if (options.check) {
      command += ' --check';
    }
    if (options.version) {
      command += ` --version=${options.version}`;
    }
    
    return await this.executeCommand(command);
  }

  // Bugreport
  async bugreport() {
    return await this.executeCommand('bugreport');
  }

  // Metrics
  async metrics() {
    return await this.executeCommand('metrics');
  }

  // License info
  async licenses() {
    return await this.executeCommand('licenses');
  }

  // Network connection testing
  async nc(target, port, options = {}) {
    let command = `nc ${target} ${port}`;
    
    if (options.listen) {
      command += ' -l';
    }
    
    return await this.executeCommand(command);
  }

  // Authentication
  async login(options = {}) {
    let command = 'login';
    
    if (options.server) {
      command += ` --login-server=${options.server}`;
    }
    if (options.authkey) {
      command += ` --authkey=${options.authkey}`;
    }
    
    return await this.executeCommand(command);
  }

  async logout() {
    return await this.executeCommand('logout');
  }

  async switch(account) {
    return await this.executeCommand(`switch ${account}`);
  }

  // Configuration
  async configure(feature) {
    return await this.executeCommand(`configure ${feature}`);
  }

  async syspolicy() {
    return await this.executeCommand('syspolicy');
  }

  // Wrapper methods for compatibility with existing API-based functions
  async listDevices(filter) {
    try {
      const result = await this.status(true);
      
      if (result.isError) {
        return result;
      }
      
      const statusData = JSON.parse(result.content[0].text);
      let devices = [];
      
      // Add self
      if (statusData.Self) {
        devices.push(statusData.Self);
      }
      
      // Add peers
      if (statusData.Peer) {
        devices.push(...Object.values(statusData.Peer));
      }
      
      // Apply filter if provided
      if (filter) {
        devices = devices.filter(device => 
          device.HostName?.toLowerCase().includes(filter.toLowerCase()) ||
          device.DNSName?.toLowerCase().includes(filter.toLowerCase()) ||
          device.TailscaleIPs?.some(ip => ip.includes(filter)) ||
          device.ID?.includes(filter)
        );
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ devices }, null, 2),
        }],
        success: true
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error listing devices: ${error.message}`,
        }],
        isError: true
      };
    }
  }

  async getDevice(deviceId) {
    try {
      // First try whois for detailed info
      const whoisResult = await this.whois(deviceId);
      if (!whoisResult.isError) {
        return whoisResult;
      }
      
      // Fallback to status and find the device
      const statusResult = await this.status(true);
      if (statusResult.isError) {
        return statusResult;
      }
      
      const statusData = JSON.parse(statusResult.content[0].text);
      
      // Check self
      if (statusData.Self && (statusData.Self.ID === deviceId || statusData.Self.HostName === deviceId)) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(statusData.Self, null, 2),
          }],
          success: true
        };
      }
      
      // Check peers
      if (statusData.Peer) {
        for (const peer of Object.values(statusData.Peer)) {
          if (peer.ID === deviceId || peer.HostName === deviceId || peer.DNSName.includes(deviceId)) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(peer, null, 2),
              }],
              success: true
            };
          }
        }
      }
      
      return {
        content: [{
          type: 'text',
          text: `Device '${deviceId}' not found`,
        }],
        isError: true
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error getting device: ${error.message}`,
        }],
        isError: true
      };
    }
  }

  // Note: Device management (update/delete) requires admin API access
  // These would need to be implemented differently or documented as limitations
  async updateDevice(deviceId, updates) {
    return {
      content: [{
        type: 'text',
        text: `Device management operations like update require admin API access. Use the Tailscale admin console or API for device management.`,
      }],
      isError: true
    };
  }

  async deleteDevice(deviceId) {
    return {
      content: [{
        type: 'text',
        text: `Device management operations like delete require admin API access. Use the Tailscale admin console or API for device management.`,
      }],
      isError: true
    };
  }

  // ACL operations require API access
  async getACL() {
    return {
      content: [{
        type: 'text',
        text: `ACL operations require API access. Use the Tailscale admin console or API for ACL management.`,
      }],
      isError: true
    };
  }

  async updateACL(aclData) {
    return {
      content: [{
        type: 'text',
        text: `ACL operations require API access. Use the Tailscale admin console or API for ACL management.`,
      }],
      isError: true
    };
  }

  // DNS settings via CLI are limited
  async getDNS() {
    return await this.dnsStatus();
  }

  async updateDNS(dnsSettings) {
    return {
      content: [{
        type: 'text',
        text: `DNS configuration changes require API access or admin console. Current DNS status available via 'tailscale dns status'.`,
      }],
      isError: true
    };
  }

  // Auth key operations require API access
  async listKeys() {
    return {
      content: [{
        type: 'text',
        text: `Auth key management requires API access. Use the Tailscale admin console or API for key management.`,
      }],
      isError: true
    };
  }

  async createKey(keyOptions) {
    return {
      content: [{
        type: 'text',
        text: `Auth key creation requires API access. Use the Tailscale admin console or API for key management.`,
      }],
      isError: true
    };
  }

  // Route operations are limited via CLI
  async getRoutes() {
    return {
      content: [{
        type: 'text',
        text: `Route management requires API access. Use 'tailscale status' to see advertised routes or the admin console for route management.`,
      }],
      isError: true
    };
  }

  async enableRoute(routeId) {
    return {
      content: [{
        type: 'text',
        text: `Route management requires API access. Use the Tailscale admin console or API for route management.`,
      }],
      isError: true
    };
  }

  async disableRoute(routeId) {
    return {
      content: [{
        type: 'text',
        text: `Route management requires API access. Use the Tailscale admin console or API for route management.`,
      }],
      isError: true
    };
  }

  async deleteRoute(routeId) {
    return {
      content: [{
        type: 'text',
        text: `Route management requires API access. Use the Tailscale admin console or API for route management.`,
      }],
      isError: true
    };
  }
}
