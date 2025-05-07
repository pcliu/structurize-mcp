import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// 移除硬编码的 API_KEY
// const API_KEY = 'AIzaSyCJyhrKIZ7J9to3tJo_zLQRkRcTN5z3fRA';

/**
 * Gemini 客户端类，处理与 Google Gemini 模型的交互
 */
export class GeminiClient {
  private model: GenerativeModel;
  private static instance: GeminiClient;
  private static apiKey: string;

  /**
   * 私有构造函数，初始化 Gemini 模型
   * @param apiKey Gemini API Key
   */
  private constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * 获取 GeminiClient 单例
   * @param apiKey Gemini API Key
   * @returns GeminiClient 实例
   */
  public static getInstance(apiKey?: string): GeminiClient {
    if (apiKey) {
      GeminiClient.apiKey = apiKey;
    }
    
    if (!GeminiClient.apiKey) {
      throw new Error('Gemini API Key 未设置。请通过 --api-key 参数提供有效的 API Key');
    }
    
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient(GeminiClient.apiKey);
    }
    return GeminiClient.instance;
  }

  /**
   * 根据提供的结构和描述生成 CSV 内容
   * 
   * @param title CSV 文件标题
   * @param structure CSV 结构描述
   * @param data 要填充的数据描述
   * @returns 解析后的列名和数据行
   */
  public async generateCSVContent(
    title: string,
    structure: string,
    data: string
  ): Promise<{ columns: string[]; rows: Record<string, string>[] }> {
    try {
      // 构建提示词
      const prompt = `
我需要你帮我生成一个 CSV 文件的内容。

文件标题: ${title}
结构描述: ${structure}
数据描述: ${data}

请按照以下步骤回复:
1. 首先，分析并列出 CSV 的列名（用逗号分隔）
2. 然后，生成多行数据，每行包含所有列的值（用逗号分隔）
3. 确保数据合理且与列名匹配
4. 不要包含任何额外的解释，只输出以下格式:

列名: column1,column2,column3
数据:
value1_1,value1_2,value1_3
value2_1,value2_2,value2_3
...等等
`;

      // 调用 Gemini 模型
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      // 解析模型返回的结果
      return this.parseModelResponse(text);
    } catch (error) {
      console.error('调用 Gemini 模型出错:', error);
      throw new Error(`Gemini 模型调用失败: ${(error as Error).message}`);
    }
  }

  /**
   * 解析模型返回的数据，提取列名和行数据
   * 
   * @param response 模型响应文本
   * @returns 解析后的列名和数据行
   */
  private parseModelResponse(response: string): { columns: string[]; rows: Record<string, string>[] } {
    // 默认列名和行数据
    let columns: string[] = [];
    let dataRows: Record<string, string>[] = [];

    try {
      // 提取列名部分
      const columnsMatch = response.match(/列名:\s*(.+?)(?:\n|$)/i);
      if (columnsMatch && columnsMatch[1]) {
        columns = columnsMatch[1].split(',').map(col => col.trim());
      }

      // 如果未找到列名，尝试其他格式
      if (columns.length === 0) {
        const altColumnsMatch = response.match(/columns?:\s*(.+?)(?:\n|$)/i);
        if (altColumnsMatch && altColumnsMatch[1]) {
          columns = altColumnsMatch[1].split(',').map(col => col.trim());
        }
      }

      // 提取数据行部分
      let dataSection = '';
      const dataSectionMatch = response.match(/数据:\s*\n([\s\S]+?)(?:$|(?:\n\n))/i);
      if (dataSectionMatch && dataSectionMatch[1]) {
        dataSection = dataSectionMatch[1];
      } else {
        // 尝试匹配英文格式
        const altDataSectionMatch = response.match(/data:\s*\n([\s\S]+?)(?:$|(?:\n\n))/i);
        if (altDataSectionMatch && altDataSectionMatch[1]) {
          dataSection = altDataSectionMatch[1];
        }
      }

      // 如果仍然没有找到格式化的数据，尝试从整个响应中提取
      if (!dataSection) {
        // 找到第一个非列名的行，假设后面的都是数据行
        const lines = response.split('\n');
        let dataStarted = false;
        const dataLines: string[] = [];
        
        for (const line of lines) {
          if (!dataStarted && (line.includes('数据:') || line.includes('data:'))) {
            dataStarted = true;
            continue;
          }
          
          if (dataStarted && line.trim() && !line.includes('列名:') && !line.includes('columns:')) {
            dataLines.push(line);
          }
        }
        
        dataSection = dataLines.join('\n');
      }

      // 处理数据行
      if (dataSection) {
        const rows = dataSection.split('\n').filter(line => line.trim());
        dataRows = rows.map(row => {
          const values = row.split(',').map(val => val.trim());
          const rowObj: Record<string, string> = {};
          
          columns.forEach((column, index) => {
            rowObj[column] = index < values.length ? values[index] : '';
          });
          
          return rowObj;
        });
      }

      // 如果列名为空，但有数据行，尝试从数据行中提取列名
      if (columns.length === 0 && dataRows.length > 0) {
        const firstRow = Object.keys(dataRows[0]);
        columns = firstRow;
      }

      // 验证结果有效性
      if (columns.length === 0) {
        throw new Error('无法从模型响应中提取列名');
      }

      if (dataRows.length === 0) {
        throw new Error('无法从模型响应中提取数据行');
      }

      return { columns, rows: dataRows };
    } catch (error) {
      console.error('解析模型响应出错:', error);
      throw new Error(`解析模型响应失败: ${(error as Error).message}`);
    }
  }
} 