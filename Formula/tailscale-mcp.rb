class TailscaleMcp < Formula
  desc "Comprehensive Model Context Protocol server for Tailscale management using local CLI"
  homepage "https://github.com/TB-Warp/tailscale-mcp"
  url "https://github.com/TB-Warp/tailscale-mcp/archive/refs/heads/main.tar.gz"
  version "1.0.0"
  license "MIT"
  head "https://github.com/TB-Warp/tailscale-mcp.git", branch: "main"

  depends_on "node"
  depends_on "tailscale"

  def install
    # Install all files to libexec
    libexec.install Dir["*"]
    
    # Install Node.js dependencies
    system "npm", "install", "--production", "--prefix", libexec
    
    # Create bin wrapper that ensures proper PATH
    (bin/"tailscale-mcp").write_env_script(
      "#{Formula["node"].opt_bin}/node",
      "#{libexec}/src/index.js",
      PATH: "#{HOMEBREW_PREFIX}/bin:$PATH"
    )

    # Create setup script
    (bin/"tailscale-mcp-setup").write <<~EOS
      #!/bin/bash
      set -e
      
      echo "🔧 Setting up Tailscale MCP Server..."
      
      # Check Tailscale CLI is available
      if ! command -v tailscale &> /dev/null; then
        echo "❌ Tailscale CLI not found. Please install Tailscale first:"
        echo "   brew install tailscale"
        exit 1
      fi
      
      # Check if logged in to Tailscale
      if ! tailscale status &> /dev/null; then
        echo "❌ Not logged in to Tailscale. Please run:"
        echo "   tailscale login"
        exit 1
      fi
      
      # Run setup test
      echo "🧪 Running CLI validation..."
      cd "#{libexec}"
      node test-cli.js
      
      echo ""
      echo "✅ Tailscale MCP Server setup complete!"
      echo ""
      echo "📝 Next steps:"
      echo "1. Add to your Warp MCP configuration:"
      echo ""
      echo '   {'
      echo '     "tailscale": {'
      echo '       "command": "tailscale-mcp"'
      echo '     }'
      echo '   }'
      echo ""
      echo "3. Restart Warp to load the MCP server"
      echo "4. Use natural language commands to manage Tailscale!"
      echo ""
      echo "🎯 Example commands:"
      echo '   "Show me my Tailscale status"'
      echo '   "List all my Tailscale devices"'
      echo '   "What are my Tailscale IPs?"'
    EOS

    # Make setup script executable
    chmod 0755, bin/"tailscale-mcp-setup"
  end

  def post_install
    puts ""
    puts "🎉 Tailscale MCP installed successfully!"
    puts ""
    puts "📋 Prerequisites check:"
    system "#{bin}/tailscale-mcp-setup" rescue puts "  ⚠️  Run 'tailscale-mcp-setup' to validate setup"
  end

  test do
    # Test that the binary exists and is executable
    assert_predicate bin/"tailscale-mcp", :exist?
    assert_predicate bin/"tailscale-mcp", :executable?
    assert_predicate bin/"tailscale-mcp-setup", :exist?
    assert_predicate bin/"tailscale-mcp-setup", :executable?
    
    # Test Node.js dependencies are installed
    assert_predicate libexec/"node_modules", :exist?
    
    # Test CLI wrapper can find tailscale (if available)
    if which("tailscale")
      system "timeout", "2", "#{bin}/tailscale-mcp", "--version" rescue true
    end
  end
end
