declare module './csvGenerator' {
  export interface CSVGenerationResult {
    filePath: string;
    rowCount: number;
    columnCount: number;
  }

  export function generateCSV(
    title: string,
    structure: string,
    data: string,
    delimiter?: string,
    csvDir?: string,
    apiKey?: string
  ): Promise<CSVGenerationResult>;
} 