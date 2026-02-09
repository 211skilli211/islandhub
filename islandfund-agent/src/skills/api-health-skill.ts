import { Skill, execute } from '@antigravity/core';

interface APIHealthInput {
  endpoints: string[];
  timeout?: number;
}

interface APIHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  endpointResults: Array<{
    endpoint: string;
    status: number;
    responseTime: number;
    lastChecked: string;
  }>;
  systemMetrics: {
    cpu: number;
    memory: number;
    diskSpace: number;
  };
}

export const apiHealthSkill: Skill<APIHealthInput, APIHealthResult> = {
  name: 'api_health_check',
  description: 'Monitor API endpoints and service health',
  
  async execute(input: APIHealthInput): Promise<APIHealthResult> {
    const startTime = Date.now();
    const results = [];
    
    for (const endpoint of input.endpoints) {
      const responseStartTime = Date.now();
      
      try {
        const response = await fetch(`http://localhost:5001${endpoint}`, {
          method: 'GET',
          timeout: input.timeout || 5000,
          headers: {
            'User-Agent': 'IslandFund-HealthCheck/1.0.0'
          }
        });
        
        const responseTime = Date.now() - responseStartTime;
        
        let status: number;
        if (response.ok) {
          status = response.status >= 200 && response.status < 300 ? response.status : 0;
        } else {
          status = 0;
        }
        
        results.push({
          endpoint,
          status,
          responseTime,
          lastChecked: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          endpoint,
          status: 0,
          responseTime: input.timeout || 5000,
          lastChecked: new Date().toISOString()
        });
      }
    }
    
    // Get system metrics
    const systemMetrics = await this.getSystemMetrics();
    const overallStatus = this.calculateOverallHealth(results);
    
    const duration = Date.now() - startTime;
    
    console.log(`🔍 API Health Check completed in ${duration}ms`);
    
    return {
      status: overallStatus,
      endpointResults: results,
      systemMetrics
    };
  },
  
  private calculateOverallHealth(results: any[]): 'healthy' | 'degraded' | 'unhealthy' {
    const failedEndpoints = results.filter(r => r.status >= 500);
    const slowEndpoints = results.filter(r => r.responseTime > 2000);
    
    if (failedEndpoints.length > 0) return 'unhealthy';
    if (slowEndpoints.length > results.length * 0.1) return 'degraded';
    return 'healthy';
  },
  
  private async getSystemMetrics() {
    // In real implementation, this would get actual system metrics
    // For now, return mock data
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 8000,
      diskSpace: Math.random() * 1000000
    };
  }
};

execute(apiHealthSkill);