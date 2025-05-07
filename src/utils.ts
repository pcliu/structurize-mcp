/**
 * 将文件名进行安全处理，移除不允许的字符
 * 
 * @param fileName 原始文件名
 * @returns 安全的文件名
 */
export function sanitizeFileName(fileName: string): string {
  // 替换不安全或特殊字符
  const sanitized = fileName
    .replace(/[<>:"\/\\|?*]/g, '_') // 替换Windows/Linux不允许的字符
    .replace(/\s+/g, '_')           // 将空格替换为下划线
    .replace(/\.\./g, '_')          // 替换连续的点
    .replace(/^\./g, '_')           // 替换开头的点
    .trim();
  
  // 如果处理后文件名为空，使用默认名称
  if (!sanitized) {
    return `csv_file_${Date.now()}`;
  }
  
  // 生成基于时间的唯一文件名（保留原名）
  return `${sanitized}_${Date.now()}`;
}

/**
 * 根据 CSV 内容生成描述性文件名
 * 
 * @param title CSV 标题
 * @param columns CSV 列名数组
 * @param data 数据内容描述
 * @returns 生成的文件名
 */
export function generateContentBasedFileName(
  title: string,
  columns: string[],
  data: string
): string {
  // 从标题中提取关键词
  let fileName = title
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, '') // 只保留字母、数字、下划线、空格和中文
    .replace(/\s+/g, '_')
    .slice(0, 30); // 限制标题部分长度
  
  // 添加列信息的摘要
  if (columns && columns.length > 0) {
    // 取前三个列名，组成摘要
    const columnsSummary = columns.slice(0, 3).join('_').toLowerCase();
    fileName += `_cols_${columnsSummary}`;
  }
  
  // 从数据描述中提取关键词（如果可能）
  let dataKeyword = '';
  if (data) {
    // 尝试提取数据描述中的关键词
    const keywords = data.match(/\b(\w{3,})\b/g);
    if (keywords && keywords.length > 0) {
      // 使用前2个关键词
      dataKeyword = keywords.slice(0, 2).join('_').toLowerCase();
    }
  }
  
  if (dataKeyword) {
    fileName += `_data_${dataKeyword}`;
  }
  
  // 确保文件名不会过长
  fileName = fileName.slice(0, 50);
  
  // 添加当前时间（格式：年月日_时分秒）
  const now = new Date();
  const timeStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
  
  // 返回安全处理后的文件名
  return sanitizeFileName(`${fileName}_${timeStr}`);
} 