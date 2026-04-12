import { Skill, execute } from '@antigravity/core';

interface DatabaseQueryInput {
  query: string;
  parameters?: Record<string, any>;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

interface DatabaseQueryResult {
  results: any[];
  affectedRows: number;
  executionTime: number;
}

export const databaseQuerySkill: Skill<DatabaseQueryInput, DatabaseQueryResult> = {
  name: 'database_query',
  description: 'Execute SQL queries and database operations for IslandFund',
  
  async execute(input: DatabaseQueryInput): Promise<DatabaseQueryResult> {
    const startTime = Date.now();
    
    try {
      // Database connection would be injected here
      const db = await this.getDatabaseConnection();
      
      // Execute query with parameterization
      const result = await db.query(input.query, input.parameters);
      
      const executionTime = Date.now() - startTime;
      
      console.log(`📊 Database query executed in ${executionTime}ms`);
      
      return {
        results: result.rows,
        affectedRows: result.rowCount || 0,
        executionTime
      };
    } catch (error) {
      console.error('❌ Database query failed:', error);
      throw error;
    }
  },
  
  // Input validation and SQL injection prevention
  async validate(input: DatabaseQueryInput): Promise<boolean> {
    if (!input.query || input.query.trim().length === 0) {
      return false;
    }
    
    // Basic SQL injection prevention
    const dangerousPatterns = ['DROP', 'DELETE FROM', 'INSERT INTO', 'UPDATE SET'];
    const containsDangerousSQL = dangerousPatterns.some(pattern => 
      input.query.toUpperCase().includes(pattern)
    );
    
    return !containsDangerousSQL && input.query.length <= 10000;
  }
  
  private async getDatabaseConnection(): Promise<any> {
    // In real implementation, this would connect to IslandFund database
    // For now, return mock connection
    return {
      query: async (query: string, params?: any[]) => {
        console.log(`🔍 Executing: ${query}`);
        return { rows: [], rowCount: 0 };
      },
      close: async () => {
        console.log('📊 Database connection closed');
      }
    };
  }
};

execute(databaseQuerySkill);