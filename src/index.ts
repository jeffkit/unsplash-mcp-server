#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

function parseArgs(): { accessKey?: string; help?: boolean; responseFormat?: 'image' | 'text' } {
  const args = process.argv.slice(2);
  const result: { accessKey?: string; help?: boolean; responseFormat?: 'image' | 'text' } = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--access-key' || arg === '-k') {
      result.accessKey = args[i + 1];
      i++; // Skip the next argument as it's the value
    } else if (arg === '--response-format' || arg === '-f') {
      const format = args[i + 1];
      if (format === 'image' || format === 'text') {
        result.responseFormat = format;
      } else {
        console.error(`Invalid response format: ${format}. Must be 'image' or 'text'.`);
        process.exit(1);
      }
      i++; // Skip the next argument as it's the value
    } else if (arg === '--help' || arg === '-h') {
      result.help = true;
    }
  }
  
  return result;
}

function showHelp() {
  console.error(`
Unsplash MCP Server

Usage: unsplash-mcp-server [options]

Options:
  -k, --access-key <key>      Unsplash API access key
  -f, --response-format <fmt> Response format: 'image' (base64) or 'text' (URLs) [default: image]
  -h, --help                  Show this help message

Environment Variables:
  UNSPLASH_ACCESS_KEY         Unsplash API access key (alternative to --access-key)

Examples:
  unsplash-mcp-server --access-key YOUR_API_KEY
  unsplash-mcp-server --access-key YOUR_API_KEY --response-format text
  UNSPLASH_ACCESS_KEY=YOUR_API_KEY unsplash-mcp-server
`);
}

interface UnsplashPhoto {
  id: string;
  created_at: string;
  width: number;
  height: number;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
  };
  likes: number;
  description?: string;
  alt_description?: string;
  color: string;
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

const UNSPLASH_API_URL = "https://api.unsplash.com";

class UnsplashMCPServer {
  private server: Server;
  private accessKey: string;
  private responseFormat: 'image' | 'text';

  constructor(accessKey: string, responseFormat: 'image' | 'text' = 'image') {
    this.accessKey = accessKey;
    this.responseFormat = responseFormat;
    this.server = new Server(
      {
        name: "unsplash-mcp-server",
        version: "1.0.2",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "search_photos",
            description: `Search for photos on Unsplash. Returns ${this.responseFormat === 'image' ? 'base64-encoded images' : 'photo URLs and metadata as JSON'}.`,
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search term for photos",
                },
                page: {
                  type: "number",
                  description: "Page number (default: 1)",
                  minimum: 1,
                },
                per_page: {
                  type: "number",
                  description: "Number of photos per page (default: 10, max: 30)",
                  minimum: 1,
                  maximum: 30,
                },
                orientation: {
                  type: "string",
                  description: "Filter by orientation",
                  enum: ["landscape", "portrait", "squarish"],
                },
                content_filter: {
                  type: "string",
                  description: "Content safety filter",
                  enum: ["low", "high"],
                },
              },
              required: ["query"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "search_photos") {
        return await this.searchPhotos(args);
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  private async fetchImageAsBase64(url: string): Promise<{base64: string, mimeType: string}> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      
      // Determine MIME type from URL or response headers
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      return { base64, mimeType: contentType };
    } catch (error) {
      throw new Error(`Error fetching image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async searchPhotos(args: any) {
    try {

      const { query, page = 1, per_page = 10, orientation, content_filter = "low" } = args;

      const searchParams = new URLSearchParams({
        query,
        page: page.toString(),
        per_page: per_page.toString(),
        content_filter,
      });

      if (orientation) {
        searchParams.append("orientation", orientation);
      }

      const response = await fetch(
        `${UNSPLASH_API_URL}/search/photos?${searchParams}`,
        {
          headers: {
            Authorization: `Client-ID ${this.accessKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
      }

      const data: UnsplashSearchResponse = await response.json();

      if (this.responseFormat === 'text') {
        // Return JSON with URLs
        const formattedResults = data.results.map((photo) => ({
          id: photo.id,
          description: photo.description || photo.alt_description || "No description",
          urls: photo.urls,
          user: {
            name: photo.user.name,
            username: photo.user.username,
          },
          dimensions: {
            width: photo.width,
            height: photo.height,
          },
          likes: photo.likes,
          color: photo.color,
          created_at: photo.created_at,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                total: data.total,
                total_pages: data.total_pages,
                current_page: page,
                per_page,
                results: formattedResults,
              }, null, 2),
            },
          ],
        };
      } else {
        // Return base64 encoded images with metadata
        const contentItems: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }> = [
          {
            type: "text",
            text: `Found ${data.total} photos (page ${page}/${data.total_pages}):`,
          }
        ];

        for (const photo of data.results) {
          try {
            // Add metadata as JSON using original Unsplash API response
            contentItems.push({
              type: "text",
              text: JSON.stringify(photo, null, 2),
            });

            // Add the actual image
            const imageData = await this.fetchImageAsBase64(photo.urls.regular);
            contentItems.push({
              type: "image",
              data: imageData.base64,
              mimeType: imageData.mimeType,
            });
          } catch (error) {
            // If image fetch fails, return error info
            contentItems.push({
              type: "text",
              text: `Failed to fetch image ${photo.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
          }
        }

        return {
          content: contentItems,
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching photos: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Unsplash MCP server running on stdio");
  }
}

async function main() {
  const { accessKey, help, responseFormat } = parseArgs();
  
  if (help) {
    showHelp();
    process.exit(0);
  }
  
  const apiKey = accessKey || process.env.UNSPLASH_ACCESS_KEY;
  
  if (!apiKey) {
    console.error("Error: Unsplash API access key is required.");
    console.error("Provide it via --access-key argument or UNSPLASH_ACCESS_KEY environment variable.");
    showHelp();
    process.exit(1);
  }
  
  const format = responseFormat || 'image';
  console.error(`Unsplash MCP server starting with response format: ${format}`);
  
  const server = new UnsplashMCPServer(apiKey, format);
  await server.run();
}

main().catch(console.error);