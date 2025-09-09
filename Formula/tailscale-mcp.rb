class TailscaleMcp < Formula
  desc "Model Context Protocol server for Tailscale management in Warp terminal"
  homepage "https://github.com/TB-Warp/tailscale-mcp"
  url "https://github.com/TB-Warp/tailscale-mcp/archive/refs/heads/main.tar.gz"
  version "1.0.0"
  license "MIT"

  depends_on "node"

  def install
    # Install all files to the formula prefix
    prefix.install Dir["*"]
    
    # Create a wrapper script in bin
    (bin/"tailscale-mcp").write <<~EOS
      #!/bin/bash
      export NODE_PATH="#{prefix}/node_modules"
      cd "#{prefix}"
      
      # Install dependencies if node_modules doesn't exist
      if [ ! -d "#{prefix}/node_modules" ]; then
        echo "Installing dependencies..."
        npm install --prefix "#{prefix}" --production
      fi
      
      # Run the MCP server
      exec node "#{prefix}/src/index.js" "$@"
    EOS

    # Create setup script
    (bin/"tailscale-mcp-setup").write <<~EOS
      #!/bin/bash
      set -e
      
      echo "🔧 Setting up Tailscale MCP Server..."
      
      # Install/update dependencies
      echo "📦 Installing Node.js dependencies..."
      npm install --prefix "#{prefix}" --production
      
      # Run setup test
      echo "🧪 Running setup validation..."
      cd "#{prefix}"
      node test-setup.cjs
      
      echo ""
      echo "✅ Tailscale MCP Server setup complete!"
      echo ""
      echo "📝 Next steps:"
      echo "1. Get your Tailscale API token from: https://login.tailscale.com/admin/settings/keys"
      echo "2. Add to your Warp MCP configuration:"
      echo ""
      echo '   {'
      echo '     "mcpServers": {'
      echo '       "tailscale": {'
      echo '         "command": "tailscale-mcp",'
      echo '         "env": {'
      echo '           "TAILSCALE_TOKEN": "your_token_here",'
      echo '           "TAILNET": "your_tailnet_name"'
      echo '         }'
      echo '       }'
      echo '     }'
      echo '   }'
      echo ""
      echo "3. Restart Warp to load the MCP server"
      echo "4. Use natural language commands to manage Tailscale!"
    EOS

    # Make scripts executable
    chmod 0755, bin/"tailscale-mcp"
    chmod 0755, bin/"tailscale-mcp-setup"
  end

  def post_install
    # Install Node.js dependencies
    system "npm", "install", "--prefix", prefix, "--production"
  end

  test do
    # Test that the setup validation works
    cd prefix do
      system "node", "test-setup.cjs"
    end
    
    # Test that the binary exists and is executable
    assert_predicate bin/"tailscale-mcp", :exist?
    assert_predicate bin/"tailscale-mcp", :executable?
    assert_predicate bin/"tailscale-mcp-setup", :exist?
    assert_predicate bin/"tailscale-mcp-setup", :executable?
  end
end
