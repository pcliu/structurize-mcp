// 使用最新的 MCP SDK 导入方式
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { generateCSV } from './csvGenerator';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs-extra';
import path from 'path';

// 解析命令行参数
const argv = yargs(hideBin(process.argv))
  .option('gemini-api-key', {
    alias: 'k',
    type: 'string',
    description: 'Gemini API Key',
    demandOption: false
  })
  .option('csv-dir', {
    alias: 'd',
    type: 'string',
    description: 'CSV 文件保存目录',
    demandOption: false
  })
  .help()
  .alias('help', 'h')
  .parseSync();

// 提取命令行参数
const apiKey = argv['gemini-api-key'];
const csvDir = argv['csv-dir'];

// 记录启动参数
console.log('启动参数:');
console.log(`- CSV 保存目录: ${csvDir || '默认目录'}`);
console.log(`- Gemini API Key: ${apiKey ? '已提供' : '未提供'}`);

// 创建 MCP Server 实例
const mcpServer = new McpServer({
  name: 'structurize-mcp',
  version: '1.2.0',
});

// 参数定义
const csvToolParams = {
  title: z.string(),
  structure: z.string(),
  data: z.string(),
  delimiter: z.string().optional(),
};

// 注册生成 CSV 文件的工具
mcpServer.tool(
  'generate-csv',
  csvToolParams,
  async (params) => {
    try {
      const { title, structure, data, delimiter = ',' } = params;
      
      // 调用 CSV 生成函数，传递命令行参数
      const result = await generateCSV(title, structure, data, delimiter, csvDir, apiKey);
      
      return {
        content: [
          {
            type: 'text',
            text: `CSV 文件已成功生成！\n文件路径: ${result.filePath}\n行数: ${result.rowCount}\n列数: ${result.columnCount}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `生成 CSV 文件时出错: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// 主函数
async function main() {
  try {
    // 启动 MCP Server
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.log('MCP 服务器已启动，等待请求...');
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 