# 发布到 npm 的步骤

## 1. 准备工作

### 更新 package.json
请手动替换以下内容：
```json
{
  "name": "@jeffkit/unsplash-mcp-server",  // 替换为你的 npm 用户名
  "author": "Jeff Kit <bbmyth@gmail.com>",   // 替换为你的信息
  "repository": {
    "url": "https://github.com/jeffkit/unsplash-mcp-server.git"  // 替换 GitHub 用户名
  }
}
```

## 2. npm 账户设置

### 登录 npm
```bash
npm login
```

### 检查登录状态
```bash
npm whoami
```

## 3. 发布前检查

### 构建项目
```bash
npm run build
```

### 检查包内容
```bash
npm pack --dry-run
```

### 检查包名是否可用
```bash
npm view @jeffkit/unsplash-mcp-server
```

## 4. 发布

### 发布到 npm
```bash
npm publish --access public
```

## 5. 验证发布

### 检查发布状态
```bash
npm view @jeffkit/unsplash-mcp-server
```

### 测试安装
```bash
npm install -g @jeffkit/unsplash-mcp-server
```

## 6. 可选：GitHub 仓库

如果你要创建 GitHub 仓库：

1. 在 GitHub 创建新仓库 `unsplash-mcp-server`
2. 推送代码：
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/jeffkit/unsplash-mcp-server.git
git push -u origin main
```

## 使用说明

发布成功后，用户可以这样安装和使用：

```bash
# 安装
npm install -g @jeffkit/unsplash-mcp-server

# 使用
unsplash-mcp-server --access-key YOUR_API_KEY
```