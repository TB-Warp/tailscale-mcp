#!/usr/bin/env node
import { TailscaleCLI } from './src/tailscale-cli.js';

async function test() {
  const cli = new TailscaleCLI();
  
  console.log('Testing Tailscale CLI wrapper...\n');
  
  try {
    // Test version
    console.log('=== Version ===');
    const version = await cli.version();
    console.log(version.content[0].text);
    
    // Test IP addresses
    console.log('\n=== IP Addresses ===');
    const ip = await cli.ip();
    console.log(ip.content[0].text);
    
    // Test status (with JSON)
    console.log('\n=== Status (JSON) ===');
    const status = await cli.status(true);
    if (!status.isError) {
      const statusData = JSON.parse(status.content[0].text);
      console.log(`Connected as: ${statusData.Self?.HostName}`);
      console.log(`Tailnet: ${statusData.CurrentTailnet?.Name}`);
      console.log(`Peers: ${Object.keys(statusData.Peer || {}).length}`);
    } else {
      console.log('Error:', status.content[0].text);
    }
    
    // Test device listing
    console.log('\n=== Device List ===');
    const devices = await cli.listDevices();
    if (!devices.isError) {
      const deviceData = JSON.parse(devices.content[0].text);
      console.log(`Found ${deviceData.devices.length} devices:`);
      deviceData.devices.forEach(device => {
        console.log(`  - ${device.HostName} (${device.TailscaleIPs[0]}) - ${device.Online ? 'Online' : 'Offline'}`);
      });
    } else {
      console.log('Error:', devices.content[0].text);
    }
    
    console.log('\n✅ CLI wrapper test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
