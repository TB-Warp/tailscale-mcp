#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function testExtendedMCP() {
  console.log('🔬 Extended MCP Testing - Advanced Features...\n');
  
  const server = spawn('node', ['src/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let output = '';
  
  server.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  server.stderr.on('data', (data) => {
    const message = data.toString();
    if (message.includes('running on stdio')) {
      console.log('✅ Server ready, testing advanced tools...\n');
      testAdvancedTools();
    }
  });
  
  async function testAdvancedTools() {
    const tests = [
      {
        name: 'IP Addresses',
        tool: 'tailscale_ip',
        expectedContent: ['100.', 'fd7a:']
      },
      {
        name: 'Network Check',
        tool: 'tailscale_netcheck',
        expectedContent: ['Region', 'latency', 'PreferredDERP']
      },
      {
        name: 'Exit Nodes',
        tool: 'tailscale_exit_node_list',
        expectedContent: []  // May be empty
      },
      {
        name: 'File List',
        tool: 'tailscale_file_list',
        expectedContent: []  // May be empty
      },
      {
        name: 'DNS Status',
        tool: 'tailscale_dns_status',
        expectedContent: ['DNS', 'resolver']
      }
    ];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      console.log(`=== Test ${i + 1}: ${test.name} ===`);
      
      const msg = JSON.stringify({
        jsonrpc: "2.0",
        id: i + 10,
        method: "tools/call",
        params: {
          name: test.tool,
          arguments: {}
        }
      }) + '\n';
      
      server.stdin.write(msg);
      await setTimeout(1500);
    }
    
    // Test API-limited tools
    console.log('\n=== Testing API-Limited Tools ===');
    const apiTest = JSON.stringify({
      jsonrpc: "2.0",
      id: 99,
      method: "tools/call",
      params: {
        name: "tailscale_get_acl",
        arguments: {}
      }
    }) + '\n';
    
    server.stdin.write(apiTest);
    await setTimeout(1000);
    
    // Parse responses
    await setTimeout(1000);
    
    const responses = output.split('\n').filter(line => line.trim());
    const results = {};
    
    responses.forEach(line => {
      try {
        const parsed = JSON.parse(line);
        if (parsed.id >= 10 && parsed.id <= 99) {
          results[parsed.id] = parsed;
        }
      } catch (e) {
        // Skip non-JSON
      }
    });
    
    console.log('\n=== Extended Test Results ===');
    
    tests.forEach((test, index) => {
      const response = results[index + 10];
      if (response && response.result && response.result.content) {
        const content = response.result.content[0].text;
        const hasExpected = test.expectedContent.length === 0 || 
                           test.expectedContent.some(expected => content.includes(expected));
        
        if (hasExpected || !response.result.isError) {
          console.log(`✅ ${test.name}: Working`);
          if (content.length > 100) {
            console.log(`   Output: ${content.substring(0, 100)}...`);
          } else {
            console.log(`   Output: ${content}`);
          }
        } else {
          console.log(`⚠️  ${test.name}: Unexpected output`);
          console.log(`   Output: ${content}`);
        }
      } else {
        console.log(`❌ ${test.name}: Failed`);
      }
    });
    
    // Check API-limited tool
    const aclResponse = results[99];
    if (aclResponse && aclResponse.result && aclResponse.result.isError) {
      console.log('✅ API-Limited Tool: Correctly shows limitation message');
    } else {
      console.log('⚠️  API-Limited Tool: Unexpected behavior');
    }
    
    console.log('\n🎯 Extended testing complete!');
    server.kill();
  }
  
  setTimeout(12000).then(() => {
    console.log('\n⏰ Extended test timeout, terminating...');
    server.kill();
  });
}

testExtendedMCP().catch(error => {
  console.error('Extended test failed:', error);
  process.exit(1);
});
