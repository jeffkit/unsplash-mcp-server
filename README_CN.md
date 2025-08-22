# Unsplash MCP 服务器

[English](README.md) | [中文](README_CN.md)

一个基于模型上下文协议（MCP）的服务器，使用 Unsplash API 提供照片搜索功能，采用 stdio 传输方式。

## 特性

- 🔍 在 Unsplash 上搜索照片，支持多种过滤条件
- 📄 支持分页、方向过滤和内容过滤
- 📊 返回格式化的照片数据，包括 URL、用户信息和元数据
- 🖼️ 两种响应格式：base64 编码图片（默认）或包含 URL 的 JSON 数据
- 🔗 使用 stdio 传输，无缝集成 MCP
- ⚡ 支持命令行 API 密钥，易于部署
- 🚀 并发图片获取，性能优化

## 安装

### 从 npm 安装（推荐）

```bash
npm install -g @jeffkit/unsplash-mcp-server
```

### 从源码安装

```bash
git clone https://github.com/jeffkit/unsplash-mcp-server.git
cd unsplash-mcp-server
npm install
npm run build
```

## API 密钥设置

获取您的 Unsplash API 访问密钥：
1. 访问 https://unsplash.com/developers
2. 创建新应用程序
3. 复制您的访问密钥

## 使用方法

### 命令行

```bash
# 使用命令行参数（默认：图片格式）
npx -y @jeffkit/unsplash-mcp-server --access-key YOUR_API_KEY

# 使用文本格式（返回包含 URL 的 JSON）
npx -y @jeffkit/unsplash-mcp-server --access-key YOUR_API_KEY --response-format text

# 使用环境变量
UNSPLASH_ACCESS_KEY=YOUR_API_KEY @jeffkit/unsplash-mcp-server

# 显示帮助
npx -y @jeffkit/unsplash-mcp-server --help
```

### MCP 客户端集成

将以下配置添加到您的 MCP 客户端配置：

```json
{
  "mcpServers": {
    "unsplash": {
      "command": "npx",
      "args": ["-y", "@jeffkit/unsplash-mcp-server", "--access-key", "YOUR_API_KEY"]
    }
  }
}
```

#### Claude Code
特别针对 Claude Code，使用以下命令将 MCP 服务器添加到服务器列表：

```bash
claude mcp add-json unsplash '{"command": "npx", "args": ["-y", "@jeffkit/unsplash-mcp-server", "--access-key", "YOUR_API_KEY"]}'
```

使用文本格式（JSON URL）：

```json
{
  "mcpServers": {
    "unsplash": {
      "command": "npx",
      "args": ["-y", "@jeffkit/unsplash-mcp-server", "--access-key", "YOUR_API_KEY", "--response-format", "text"]
    }
  }
}
```

或使用环境变量：

```json
{
  "mcpServers": {
    "unsplash": {
      "command": "npx",
      "args": ["-y", "@jeffkit/unsplash-mcp-server"],
      "env": {
        "UNSPLASH_ACCESS_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### 开发

```bash
npm run dev -- --access-key YOUR_API_KEY
npm run dev -- --access-key YOUR_API_KEY --response-format text
```

## 工具

### search_photos

在 Unsplash 上搜索照片，支持可配置的响应格式。

**参数：**
- `query`（必需）：照片搜索关键词
- `page`（可选）：页码（默认：1）
- `per_page`（可选）：每页照片数量（默认：10，最大：30）
- `orientation`（可选）：按方向过滤（"landscape"、"portrait"、"squarish"）
- `content_filter`（可选）：内容安全过滤器（"low"、"high"）

**响应格式：**

#### 图片格式（默认）
返回带有元数据的 base64 编码图片。每张图片都以 MCP 图片内容类型返回，并包含完整的原始 Unsplash API 数据作为 JSON 元数据。

#### 文本格式
返回包含照片 URL 和元数据的 JSON：

```json
{
  "total": 1000,
  "total_pages": 100,
  "current_page": 1,
  "per_page": 10,
  "results": [
    {
      "id": "photo_id",
      "description": "美丽的风景",
      "urls": {
        "raw": "https://...",
        "full": "https://...",
        "regular": "https://...",
        "small": "https://...",
        "thumb": "https://..."
      },
      "user": {
        "name": "摄影师姓名",
        "username": "用户名"
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

## 响应格式配置

服务器可以在启动时配置为返回以下两种格式之一：

1. **图片格式**（默认）：以 MCP 图片内容类型返回 Base64 编码的图片，附带完整的 JSON 元数据
2. **文本格式**：以 MCP 文本内容类型返回包含照片 URL 和元数据的 JSON

根据您的 MCP 客户端功能和使用场景选择合适的格式。

## 版本更新日志

### v1.0.2
- ✨ 在图片模式下的元数据中添加了完整的图片 URL 链接
- 🔧 使用原始 Unsplash API 响应结构确保数据完整性
- 📚 添加了 Gemini CLI 配置示例
- 🌏 添加了中文版文档

### v1.0.1
- 🐛 修复了各种 bug 和性能优化

### v1.0.0
- 🎉 初始版本发布
- 🔍 基本的 Unsplash 照片搜索功能
- 📊 支持两种响应格式（图片/文本）
- ⚡ stdio 传输支持
