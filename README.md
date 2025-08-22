# Unsplash MCP Server

A Model Context Protocol (MCP) server that provides photo search functionality using the Unsplash API with stdio transport.

## Features

- 🔍 Search photos on Unsplash with various filters
- 📄 Support for pagination, orientation filtering, and content filtering  
- 📊 Returns formatted photo data including URLs, user info, and metadata
- 🖼️ Two response formats: base64-encoded images (default) or JSON with URLs
- 🔗 Uses stdio transport for seamless MCP integration
- ⚡ Command-line API key support for easy deployment
- 🚀 Concurrent image fetching for optimal performance

## Installation

### From npm (Recommended)

```bash
npm install -g @jeffkit/unsplash-mcp-server
```

### From source

```bash
git clone https://github.com/jeffkit/unsplash-mcp-server.git
cd unsplash-mcp-server
npm install
npm run build
```

## API Key Setup

Get your Unsplash API access key:
1. Visit https://unsplash.com/developers
2. Create a new application  
3. Copy your Access Key

## Usage

### Command Line

```bash
# Using command line argument (default: image format)
npx @jeffkit/unsplash-mcp-server --access-key YOUR_API_KEY

# Using text format (returns JSON with URLs)
npx @jeffkit/unsplash-mcp-server --access-key YOUR_API_KEY --response-format text

# Using environment variable  
UNSPLASH_ACCESS_KEY=YOUR_API_KEY @jeffkit/unsplash-mcp-server

# Show help
npx @jeffkit/unsplash-mcp-server --help
```

### MCP Client Integration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "unsplash": {
      "command": "npx",
      "args": ["@jeffkit/unsplash-mcp-server", "--access-key", "YOUR_API_KEY"]
    }
  }
}
```

espesially for Claude code, use the following command to add the MCP server to the MCP server list.

```bash
claude mcp add-json unsplash '{"command": "npx", "args": ["@jeffkit/unsplash-mcp-server", "--access-key", "YOUR_API_KEY"]}'
```

With text format (JSON URLs):

```json
{
  "mcpServers": {
    "unsplash": {
      "command": "npx",
      "args": ["@jeffkit/unsplash-mcp-server", "--access-key", "YOUR_API_KEY", "--response-format", "text"]
    }
  }
}
```

Or with environment variable:

```json
{
  "mcpServers": {
    "unsplash": {
      "command": "npx",
      "args": ["@jeffkit/unsplash-mcp-server"],
      "env": {
        "UNSPLASH_ACCESS_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### Development

```bash
npm run dev -- --access-key YOUR_API_KEY
npm run dev -- --access-key YOUR_API_KEY --response-format text
```

## Tools

### search_photos

Search for photos on Unsplash with configurable response format.

**Parameters:**
- `query` (required): Search term for photos
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Number of photos per page (default: 10, max: 30)
- `orientation` (optional): Filter by orientation ("landscape", "portrait", "squarish")
- `content_filter` (optional): Content safety filter ("low", "high")

**Response Formats:**

#### Image Format (Default)
Returns base64-encoded images with metadata. Each image is returned as an MCP Image content type.

#### Text Format  
Returns JSON with photo URLs and metadata:

```json
{
  "total": 1000,
  "total_pages": 100,
  "current_page": 1,
  "per_page": 10,
  "results": [
    {
      "id": "photo_id",
      "description": "Beautiful landscape",
      "urls": {
        "raw": "https://...",
        "full": "https://...",
        "regular": "https://...",
        "small": "https://...",
        "thumb": "https://..."
      },
      "user": {
        "name": "Photographer Name",
        "username": "username"
      },
      "dimensions": {
        "width": 3000,
        "height": 2000
      },
      "likes": 100,
      "color": "#f0f0f0",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

## Response Format Configuration

The server can be configured at startup to return either:

1. **Image format** (default): Base64-encoded images as MCP Image content
2. **Text format**: JSON with photo URLs and metadata as MCP Text content

Choose the format based on your MCP client's capabilities and use case.