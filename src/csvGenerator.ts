import path from 'path';
import fs from 'fs-extra';
import { stringify } from 'csv-stringify/sync';
import { sanitizeFileName, generateContentBasedFileName } from './utils';
import { GeminiClient } from './geminiClient';

// CSV 生成结果接口
export interface CSVGenerationResult {
  filePath: string;
  rowCount: number;
  columnCount: number;
}

/**
 * 根据用户提供的内容生成 CSV 文件
 * 
 * @param title CSV 文件的标题（将用于文件名）
 * @param structure CSV 的结构描述，包括各列的名称和数据类型
 * @param data CSV 的内容数据
 * @param delimiter 列分隔符，默认为逗号
 * @param csvDir CSV 文件保存目录，默认为项目下的 csv 目录
 * @param apiKey Gemini API Key
 * @returns CSV 生成结果
 */
export async function generateCSV(
  title: string,
  structure: string,
  data: string,
  delimiter: string = ',',
  csvDir?: string,
  apiKey?: string
): Promise<CSVGenerationResult> {
  // 确定 CSV 目录路径
  const outputDir = csvDir 
    ? path.resolve(csvDir) 
    : path.resolve(__dirname, '../../csv');
  
  // 确保 CSV 目录存在
  await fs.ensureDir(outputDir);
  
  try {
    // 使用 Gemini 模型生成 CSV 数据
    console.log('使用 Gemini 模型生成 CSV 数据...');
    const geminiClient = GeminiClient.getInstance(apiKey);
    const { columns, rows } = await geminiClient.generateCSVContent(title, structure, data);
    
    console.log(`Gemini 生成了 ${columns.length} 列和 ${rows.length} 行数据`);
    
    // 使用基于内容的文件名生成方法
    const fileName = `${generateContentBasedFileName(title, columns, data)}.csv`;
    const filePath = path.join(outputDir, fileName);
    
    // 生成 CSV 内容
    const csvContent = stringify(rows, {
      header: true,
      columns: columns.reduce((acc, col) => {
        acc[col] = col;
        return acc;
      }, {} as Record<string, string>),
      delimiter,
    });
    
    // 写入文件
    await fs.writeFile(filePath, csvContent, 'utf8');
    
    return {
      filePath,
      rowCount: rows.length,
      columnCount: columns.length,
    };
  } catch (error) {
    console.error('生成 CSV 文件时出错:', error);
    
    // 如果 Gemini 模型失败，回退到本地解析方法
    console.log('Gemini 模型失败，回退到本地解析方法...');
    
    // 解析结构
    const columns = parseStructure(structure);
    
    // 解析数据
    const rows = parseData(data, columns);
    
    // 使用基于内容的文件名生成方法
    const fileName = `${generateContentBasedFileName(title, columns, data)}.csv`;
    const filePath = path.join(outputDir, fileName);
    
    // 生成 CSV 内容
    const csvContent = stringify(rows, {
      header: true,
      columns: columns.reduce((acc, col) => {
        acc[col] = col;
        return acc;
      }, {} as Record<string, string>),
      delimiter,
    });
    
    // 写入文件
    await fs.writeFile(filePath, csvContent, 'utf8');
    
    return {
      filePath,
      rowCount: rows.length,
      columnCount: columns.length,
    };
  }
}

/**
 * 解析 CSV 结构描述
 * 
 * @param structure CSV 结构描述
 * @returns 列名数组
 */
function parseStructure(structure: string): string[] {
  // 从结构描述中提取列名
  // 这里使用简单的逗号分隔来解析列名
  // 可以根据需要实现更复杂的解析逻辑
  
  // 移除常见的描述词，获取更纯净的列名列表
  const cleanedStructure = structure
    .replace(/列[有是为包含]|columns(are|is|include|contain)?|字段[有是为包含]|fields(are|is|include|contain)?/gi, '')
    .trim();
  
  // 尝试不同的分隔符模式
  let potentialColumns: string[] = [];
  
  // 尝试模式1：逗号分隔的列表
  potentialColumns = cleanedStructure.split(/[,，]/).map(col => col.trim());
  
  // 如果分割后只有一项但内容较长，可能是按行或其他方式列出的
  if (potentialColumns.length === 1 && potentialColumns[0].length > 20) {
    // 尝试模式2：按行分隔或冒号分隔
    potentialColumns = cleanedStructure.split(/[;\n:：]/).map(col => col.trim());
  }
  
  // 过滤掉空字符串
  potentialColumns = potentialColumns.filter(col => col.length > 0);
  
  // 如果没有提取到有效的列名，使用默认列名
  if (potentialColumns.length === 0) {
    return ['Column1', 'Column2', 'Column3'];
  }
  
  // 处理列名中的特殊字符
  return potentialColumns.map(col => {
    // 移除列名中的数据类型说明和额外符号
    return col
      .replace(/\(.*?\)/g, '') // 移除括号内容
      .replace(/[：:].*/g, '') // 移除冒号后内容
      .replace(/（.*?）/g, '') // 移除中文括号内容
      .replace(/[^\w\s\u4e00-\u9fa5]/g, '') // 只保留字母、数字、下划线、空格和中文
      .trim();
  });
}

/**
 * 解析 CSV 数据内容
 * 
 * @param data 原始数据内容
 * @param columns 列名数组
 * @returns 解析后的数据行数组
 */
function parseData(data: string, columns: string[]): Record<string, string>[] {
  // 尝试从输入内容中提取结构化数据
  // 这个简单实现假设数据是按行组织的，每行代表一个记录
  
  // 分割成行
  const lines = data.trim().split(/\r?\n/);
  
  // 过滤掉空行和明显不是数据的行
  const dataLines = lines.filter(line => {
    return line.trim().length > 0 && 
           !line.trim().startsWith('#') && 
           !line.trim().startsWith('//');
  });
  
  // 将每行转换为对象
  return dataLines.map(line => {
    // 尝试拆分行为键值对
    const parts = line.split(/[,\t|]/).map(part => part.trim());
    const row: Record<string, string> = {};
    
    // 如果部分数量与列数匹配，则直接映射
    if (parts.length === columns.length) {
      columns.forEach((column, index) => {
        row[column] = parts[index];
      });
    } 
    // 否则尝试智能映射或填充默认值
    else {
      columns.forEach((column, index) => {
        if (index < parts.length) {
          row[column] = parts[index];
        } else {
          row[column] = ''; // 默认空值
        }
      });
    }
    
    return row;
  });
} 