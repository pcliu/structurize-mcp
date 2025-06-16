# Structurize-MCP

Structurize-MCP 是一个基于 Model Context Protocol 的服务，可以根据自然语言描述生成结构化的 CSV 文件。它使用 Google Gemini AI 来解析和生成数据。

## 功能特点

- 根据自然语言描述生成 CSV 文件
- 自动提取列结构和数据内容
- 生成描述性的文件名
- 支持自定义分隔符
- 当 Gemini API 调用失败时，有本地解析方法作为后备

## 安装

### NPM 全局安装

```bash
npm install -g structurize-mcp
```

### 直接通过 npx 使用

```bash
npx structurize-mcp --gemini-api-key YOUR_GEMINI_API_KEY
```

### 从源码安装

克隆仓库并安装依赖：

```bash
git clone https://github.com/your-username/structurize-mcp.git
cd structurize-mcp
npm install
npm run build
```

## 使用方法

### 命令行参数

工具支持以下命令行参数：

- `--gemini-api-key`, `-k`: Google Gemini API Key（必需）
- `--csv-dir`, `-d`: CSV 文件保存目录（可选，默认为项目下的 csv 目录）
- `--help`, `-h`: 显示帮助信息

### 运行示例

```bash
# 通过 npx 运行
npx structurize-mcp --gemini-api-key YOUR_GEMINI_API_KEY --csv-dir /path/to/save/csv

# 如果全局安装过
structurize-mcp --gemini-api-key YOUR_GEMINI_API_KEY --csv-dir /path/to/save/csv

# 从源码目录运行
node ./bin/structurize.js --gemini-api-key YOUR_GEMINI_API_KEY --csv-dir /path/to/save/csv
```

### 与 Claude Desktop 集成

要在 Claude Desktop 中使用此 MCP 服务器，你需要在 Claude Desktop 的配置文件中添加以下内容：

```json
{
  "mcpServers": {
    "csv-generator": {
      "command": "npx",
      "args": [
        "structurize-mcp",
        "--gemini-api-key",
        "YOUR_GEMINI_API_KEY_HERE",
        "--csv-dir",
        "/absolute/path/to/csv_output_directory"
      ]
    }
  }
}
```

如果是从源码运行，可以使用：

```json
{
  "mcpServers": {
    "csv-generator": {
      "command": "node",
      "args": [
        "/absolute/path/to/structurize-mcp/build/index.js",
        "--gemini-api-key",
        "YOUR_GEMINI_API_KEY_HERE",
        "--csv-dir",
        "/absolute/path/to/csv_output_directory"
      ]
    }
  }
}
```

确保替换以下内容：
- `YOUR_GEMINI_API_KEY_HERE`: 你的 Google Gemini API Key
- `/absolute/path/to/csv_output_directory`: CSV 文件保存目录的绝对路径

配置完成后，重启 Claude Desktop，然后你就可以要求 Claude 生成 CSV 文件了。

### 示例

```bash
# 使用自定义 API Key 和保存目录
npx structurize-mcp --gemini-api-key YOUR_GEMINI_API_KEY --csv-dir ~/Documents/csv_files

# 只自定义 API Key，使用默认保存目录
npx structurize-mcp --gemini-api-key YOUR_GEMINI_API_KEY

# 只自定义保存目录（但需要确保 API Key 以其他方式提供）
npx structurize-mcp --csv-dir /data/csv_exports
```

## 获取 Google Gemini API Key

要使用此工具，您需要一个 Google Gemini API Key：

1. 访问 [Google AI Studio](https://aistudio.google.com/)
2. 登录您的 Google 账户
3. 转到 [API Keys](https://aistudio.google.com/app/apikeys) 页面
4. 创建一个新的 API Key

## CSV 文件存储

- 默认情况下，CSV 文件存储在项目根目录下的 `csv` 文件夹中
- 可以通过 `--csv-dir` 参数指定自定义存储路径
- 生成的文件名基于 CSV 内容（标题、列名和数据）自动生成，并附加时间戳以确保唯一性

## 贡献

欢迎提交 Issues 和 Pull Requests。

## 许可

MIT

## API 端点

### CSV 生成

```bash
POST /generate-csv
Content-Type: application/json

{
  "description": "描述文本"
}
```

### 功能说明

#### CSV 生成
- 根据自然语言描述自动生成 CSV 文件
- 智能解析列结构和数据内容
- 生成描述性文件名
- 支持自定义分隔符

## 获取 Google Gemini API Key

要使用此工具，您需要一个 Google Gemini API Key：

1. 访问 [Google AI Studio](https://aistudio.google.com/)
2. 登录您的 Google 账户
3. 转到 [API Keys](https://aistudio.google.com/app/apikeys) 页面
4. 创建一个新的 API Key

## CSV 文件存储

- 默认情况下，CSV 文件存储在项目根目录下的 `csv` 文件夹中
- 可以通过 `--csv-dir` 参数指定自定义存储路径
- 生成的文件名基于 CSV 内容（标题、列名和数据）自动生成，并附加时间戳以确保唯一性

## 贡献

欢迎提交 Issues 和 Pull Requests。

## 许可

MIT 