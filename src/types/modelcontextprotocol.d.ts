declare module '@modelcontextprotocol/sdk/server/mcp.js' {
  import { z } from 'zod';

  export class McpServer {
    constructor(options: { name: string; version: string });
    
    tool<T extends z.ZodTypeAny>(
      name: string,
      schema: Record<string, T>,
      handler: (params: any) => Promise<{
        content: Array<{ type: string; text: string }>
      }>
    ): void;
    
    connect(transport: any): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export class StdioServerTransport {
    constructor();
  }
} 