#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function testMCPServer() {
  console.log('🧪 Testing Tailscale MCP Server...\n');
  
  const server = spawn('node', ['src/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let output = '';
  let hasError = false;
  
  server.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  server.stderr.on('data', (data) => {
    const message = data.toString();
    console.log('Server:', message.trim());
    if (message.includes('running on stdio')) {
      console.log('✅ MCP Server started successfully\n');
      testCommands();
    }
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    hasError = true;
  });
  
  async function testCommands() {
    console.log('📝 Testing MCP Protocol Commands...\n');
    
    // Test 1: List tools
    console.log('=== Test 1: List Tools ===');
    const listToolsMsg = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    }) + '\n';
    
    server.stdin.write(listToolsMsg);
    await setTimeout(1000);
    
    // Test 2: Call status tool
    console.log('=== Test 2: Call Status Tool ===');
    const statusMsg = JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "tailscale_status",
        arguments: { json: true }
      }
    }) + '\n';
    
    server.stdin.write(statusMsg);
    await setTimeout(2000);
    
    // Test 3: List devices
    console.log('=== Test 3: List Devices ===');
    const devicesMsg = JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "tailscale_list_devices",
        arguments: {}
      }
    }) + '\n';
    
    server.stdin.write(devicesMsg);
    await setTimeout(2000);
    
    // Test 4: Get version
    console.log('=== Test 4: Get Version ===');
    const versionMsg = JSON.stringify({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "tailscale_version",
        arguments: {}
      }
    }) + '\n';
    
    server.stdin.write(versionMsg);
    await setTimeout(2000);
    
    // Parse and check responses
    await setTimeout(500);
    
    console.log('\n=== Raw MCP Responses ===');
    const responses = output.split('\n').filter(line => line.trim());
    
    let toolsResponse = null;
    let statusResponse = null;
    let devicesResponse = null;
    let versionResponse = null;
    
    responses.forEach(line => {
      try {
        const parsed = JSON.parse(line);
        if (parsed.id === 1) toolsResponse = parsed;
        if (parsed.id === 2) statusResponse = parsed;
        if (parsed.id === 3) devicesResponse = parsed;
        if (parsed.id === 4) versionResponse = parsed;
      } catch (e) {
        // Not JSON, skip
      }
    });
    
    console.log('\n=== Test Results ===');
    
    // Check tools list
    if (toolsResponse && toolsResponse.result && toolsResponse.result.tools) {
      console.log(`✅ Tools List: Found ${toolsResponse.result.tools.length} tools`);
      console.log(`   Core tools: ${toolsResponse.result.tools.filter(t => t.name.startsWith('tailscale_')).length}`);
    } else {
      console.log('❌ Tools List: Failed');
    }
    
    // Check status call
    if (statusResponse && statusResponse.result && statusResponse.result.content) {
      console.log('✅ Status Tool: Working');
      try {
        const content = statusResponse.result.content[0].text;
        if (content.includes('Connected as') || content.includes('BackendState')) {
          console.log('   Status data looks valid');
        }
      } catch (e) {
        console.log('   Status response format issue');
      }
    } else {
      console.log('❌ Status Tool: Failed');
      console.log('   Response:', statusResponse);
    }
    
    // Check devices call
    if (devicesResponse && devicesResponse.result && devicesResponse.result.content) {
      console.log('✅ Devices Tool: Working');
      try {
        const content = devicesResponse.result.content[0].text;
        const devices = JSON.parse(content);
        if (devices.devices && Array.isArray(devices.devices)) {
          console.log(`   Found ${devices.devices.length} devices`);
        }
      } catch (e) {
        console.log('   Device list parsing issue');
      }
    } else {
      console.log('❌ Devices Tool: Failed');
      console.log('   Response:', devicesResponse);
    }
    
    // Check version call
    if (versionResponse && versionResponse.result && versionResponse.result.content) {
      console.log('✅ Version Tool: Working');
      const content = versionResponse.result.content[0].text;
      if (content.includes('1.') && content.includes('tailscale commit')) {
        console.log('   Version info looks valid');
      }
    } else {
      console.log('❌ Version Tool: Failed');
      console.log('   Response:', versionResponse);
    }
    
    console.log('\n🏁 MCP Test Complete');
    
    server.kill();
  }
  
  // Timeout after 10 seconds
  setTimeout(10000).then(() => {
    if (!hasError) {
      console.log('\n⏰ Test timeout reached, terminating...');
      server.kill();
    }
  });
}

testMCPServer().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
