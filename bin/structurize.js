#!/usr/bin/env node

// 检查Node.js版本
const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = parseInt(semver[0], 10);

if (major < 14) {
  console.error(
    '您正在运行Node.js ' +
      currentNodeVersion +
      '.\n' +
      'Structurize-MCP 需要Node.js 14.0或更高版本。\n' +
      '请更新您的Node.js版本。'
  );
  process.exit(1);
}

// 显示使用帮助信息的函数
const showUsage = () => {
  console.log(`
Structurize-MCP - 基于AI的CSV生成工具

使用方法:
  npx structurize-mcp [选项]

选项:
  --gemini-api-key, -k  设置Gemini API密钥
  --csv-dir, -d         设置CSV文件保存目录
  --help, -h            显示帮助信息

示例:
  npx structurize-mcp --gemini-api-key=YOUR_API_KEY --csv-dir=./csv_files
  `);
};

// 如果有--help或-h参数，显示使用说明
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// 启动服务器
require('../build/index.js'); 