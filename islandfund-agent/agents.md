# 🏝️ IslandFund Agent Integration Guide

This document extends the Antigravity agent framework with specific rules, workflows, and skills designed for the IslandFund multi-platform marketplace application.

---

## 🎯 **Agent Overview**

**Name**: IslandFund Agent  
**Purpose**: Intelligent assistant for managing marketplace operations, user support, and system administration  
**Platform**: Multi-platform (Node.js backend, Next.js web, React Native mobile)  
**Architecture**: Microservices-ready with PostgreSQL database and Redis caching  

---

## 🔧 **Core Rules Engine**

### **Rule Definition Structure**
```yaml
rules:
  marketplace:
    - name: "validate_listing_creation"
      description: "Ensure new listings meet marketplace requirements"
      condition: "user.role === 'vendor' AND request.type === 'listing'"
      action: "validate_listing_data"
      
    - name: "check_payment_compliance"
      description: "Verify payment processing meets compliance standards"
      condition: "transaction.amount > 1000"
      action: "run_payment_validation"
      
  security:
    - name: "cors_whitelist_check"
      description: "Enforce CORS policy based on environment"
      condition: "request.origin !== undefined"
      action: "validate_cors_origin"
      
  operations:
    - name: "database_backup_health"
      description: "Monitor and trigger database backups"
      condition: "system.daily_backup_time"
      action: "execute_backup_procedure"
      
    - name: "cache_optimization"
      description: "Optimize Redis caching for performance"
      condition: "response_time > 500ms"
      action: "implement_caching_strategy"
```

### **Rule Evaluation API**
```typescript
interface Rule {
  name: string;
  description: string;
  condition: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

interface RuleResult {
  rule: Rule;
  matched: boolean;
  outcome: string;
  context: Record<string, any>;
  nextActions?: string[];
}
```

---

## 🔄 **Workflow System**

### **Workflow Definition Structure**
```yaml
workflows:
  deployment:
    - name: "full_application_deployment"
      description: "Deploy entire IslandFund application stack"
      steps:
        - name: "health_check"
          action: "run_system_health_check"
        - name: "backup_database"
          action: "execute_database_backup"
        - name: "restart_services"
          action: "restart_application_services"
        - name: "verify_deployment"
          action: "verify_service_connectivity"
          
  user_onboarding:
    - name: "vendor_setup_workflow"
      description: "Complete vendor onboarding process"
      steps:
        - name: "validate_business_documents"
          action: "verify_vendor_kyc_documents"
        - name: "create_payment_account"
          action: "setup_vendor_payment_methods"
        - name: "configure_storefront"
          action: "initialize_vendor_store_settings"
        - name: "list_test_products"
          action: "create_sample_listings"
          
  incident_response:
    - name: "security_incident_workflow"
      description: "Respond to security incidents"
      steps:
        - name: "assess_incident_severity"
          action: "evaluate_security_incident"
        - name: "immediate_mitigation"
          action: "apply_security_patches"
        - name: "notify_stakeholders"
          action: "send_incident_notification"
```

### **Workflow Runner Features**
- **Sequential execution** with conditional branching
- **Parallel execution** for independent tasks
- **Retry mechanisms** with exponential backoff
- **Progress tracking** and status updates
- **Rollback capabilities** for failed workflows

---

## 🛠️ **Skill Definitions**

### **1. Database Management Skill**
```typescript
interface DatabaseQuerySkill {
  name: "database_query";
  description: "Execute SQL queries and database operations";
  input: {
    query: string;
    parameters?: Record<string, any>;
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  };
  output: {
    results: any[];
    affectedRows: number;
    executionTime: number;
  };
}

// Implementation
class DatabaseQuerySkill implements Skill {
  async execute(input: DatabaseQuerySkill['input']): Promise<DatabaseQuerySkill['output']> {
    const startTime = Date.now();
    
    // Execute query with parameterization
    const result = await this.db.query(input.query, input.parameters);
    
    const executionTime = Date.now() - startTime;
    
    return {
      results: result.rows,
      affectedRows: result.rowCount || 0,
      executionTime
    };
  }
  
  async validate(input: any): Promise<boolean> {
    // Input validation and SQL injection prevention
    const sanitizedQuery = this.sanitizeQuery(input.query);
    return sanitizedQuery.length > 0 && sanitizedQuery.length <= 10000;
  }
}
```

### **2. API Health Check Skill**
```typescript
interface APIHealthSkill {
  name: "api_health_check";
  description: "Monitor API endpoints and service health";
  input: {
    endpoints: string[];
    timeout?: number;
  };
  output: {
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
  };
}

class APIHealthSkill implements Skill {
  async execute(input: APIHealthSkill['input']): Promise<APIHealthSkill['output']> {
    const results = [];
    
    for (const endpoint of input.endpoints) {
      const startTime = Date.now();
      try {
        const response = await fetch(`http://localhost:5001${endpoint}`, {
          method: 'GET',
          timeout: input.timeout || 5000
        });
        const responseTime = Date.now() - startTime;
        
        results.push({
          endpoint,
          status: response.status,
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
    
    const systemMetrics = await this.getSystemMetrics();
    const overallStatus = this.calculateOverallHealth(results);
    
    return {
      status: overallStatus,
      endpointResults: results,
      systemMetrics
    };
  }
  
  private calculateOverallHealth(results: any[]): 'healthy' | 'degraded' | 'unhealthy' {
    const failedEndpoints = results.filter(r => r.status >= 500);
    const slowEndpoints = results.filter(r => r.responseTime > 2000);
    
    if (failedEndpoints.length > 0) return 'unhealthy';
    if (slowEndpoints.length > results.length * 0.1) return 'degraded';
    return 'healthy';
  }
}
```

### **3. User Authentication Skill**
```typescript
interface UserAuthSkill {
  name: "user_authentication";
  description: "Handle user authentication and authorization";
  input: {
    method: 'login' | 'register' | 'refresh_token';
    credentials: {
      email?: string;
      password?: string;
      refreshToken?: string;
    };
  };
  output: {
    success: boolean;
    user?: {
      id: string;
      email: string;
      role: string;
    };
    token?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    error?: string;
  };
}

class UserAuthSkill implements Skill {
  async execute(input: UserAuthSkill['input']): Promise<UserAuthSkill['output']> {
    try {
      switch (input.method) {
        case 'login':
          return await this.handleLogin(input.credentials!);
        case 'register':
          return await this.handleRegistration(input.credentials!);
        case 'refresh_token':
          return await this.handleTokenRefresh(input.credentials!);
        default:
          throw new Error(`Unsupported authentication method: ${input.method}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private async handleLogin(credentials: { email: string; password: string }): Promise<UserAuthSkill['output']> {
    // Validate credentials against database
    const user = await this.db.users.findOne({ where: { email: credentials.email } });
    
    if (!user || !await this.verifyPassword(credentials.password, user.passwordHash)) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }
    
    // Generate JWT tokens
    const tokens = this.generateJWTTokens(user);
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token: tokens
    };
  }
}
```

### **4. Marketplace Operations Skill**
```typescript
interface MarketplaceSkill {
  name: "marketplace_operations";
  description: "Manage marketplace listings, vendors, and transactions";
  input: {
    operation: 'create_listing' | 'update_listing' | 'delete_listing' | 'search_listings';
    data?: Record<string, any>;
    filters?: Record<string, any>;
  };
  output: {
    success: boolean;
    data?: any;
    listing?: any;
    listings?: any[];
    total: number;
    page?: number;
    error?: string;
  };
}

class MarketplaceSkill implements Skill {
  async execute(input: MarketplaceSkill['input']): Promise<MarketplaceSkill['output']> {
    try {
      switch (input.operation) {
        case 'create_listing':
          return await this.createListing(input.data);
        case 'search_listings':
          return await this.searchListings(input.data, input.filters);
        case 'update_listing':
          return await this.updateListing(input.data);
        case 'delete_listing':
          return await this.deleteListing(input.data);
        default:
          throw new Error(`Unsupported marketplace operation: ${input.operation}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private async createListing(listingData: any): Promise<MarketplaceSkill['output']> {
    // Validate listing data
    const validation = this.validateListingData(listingData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }
    
    // Create listing in database
    const listing = await this.db.listings.create({
      ...listingData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    });
    
    return {
      success: true,
      listing,
      message: 'Listing created successfully'
    };
  }
}
```

### **5. Payment Processing Skill**
```typescript
interface PaymentSkill {
  name: "payment_processing";
  description: "Handle payment processing and webhook management";
  input: {
    operation: 'process_payment' | 'refund_payment' | 'handle_webhook';
    provider: 'stripe' | 'paypal' | 'wipay' | 'kyrrex' | 'dodopayments';
    data?: Record<string, any>;
  };
  output: {
    success: boolean;
    transactionId?: string;
    status?: string;
    amount?: number;
    currency?: string;
    webhookProcessed?: boolean;
    error?: string;
  };
}

class PaymentSkill implements Skill {
  async execute(input: PaymentSkill['input']): Promise<PaymentSkill['output']> {
    try {
      switch (input.operation) {
        case 'process_payment':
          return await this.processPayment(input.provider, input.data);
        case 'handle_webhook':
          return await this.handleWebhook(input.provider, input.data);
        case 'refund_payment':
          return await this.refundPayment(input.provider, input.data);
        default:
          throw new Error(`Unsupported payment operation: ${input.operation}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private async processPayment(provider: string, paymentData: any): Promise<PaymentSkill['output']> {
    // Select appropriate payment processor
    const processor = this.getPaymentProcessor(provider);
    
    // Process payment with idempotency
    const transaction = await processor.processPayment({
      ...paymentData,
      idempotencyKey: this.generateIdempotencyKey(paymentData),
      metadata: {
        provider,
        timestamp: new Date().toISOString(),
        source: 'islandfund_api'
      }
    });
    
    return {
      success: true,
      transactionId: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency
    };
  }
}
```

---

## 📋 **Agent Configuration**

### **Environment Setup**
```yaml
agent:
  name: "IslandFund Agent"
  version: "1.0.0"
  description: "Multi-platform marketplace management assistant"
  
  database:
    type: "postgresql"
    host: "localhost:5433"
    name: "islandfund"
    
  cache:
    type: "redis"
    host: "localhost:6379"
    
  api:
    base_url: "http://localhost:5001"
    web_url: "http://localhost:3000"
    mobile_config:
      expo_port: 19000
      
  security:
    jwt_secret: "${JWT_SECRET}"
    cors_origins: ["http://localhost:3000", "https://islandfund.com"]
    
  monitoring:
    log_level: "info"
    metrics_endpoint: "/metrics"
```

---

## 🚀 **Usage Examples**

### **Rule Evaluation**
```bash
# Evaluate a rule for marketplace compliance
antigravity evaluate-rule \
  --rule "validate_listing_creation" \
  --context '{"user": {"role": "vendor"}, "listing": {"type": "product"}}' \
  --database "islandfund"
```

### **Workflow Execution**
```bash
# Deploy full application stack
antigravity run-workflow \
  --workflow "full_application_deployment" \
  --environment "production"
```

### **Skill Invocation**
```bash
# Query marketplace listings
antigravity call-skill \
  --skill "marketplace_operations" \
  --input '{"operation": "search_listings", "filters": {"category": "electronics"}}'

# Handle user authentication
antigravity call-skill \
  --skill "user_authentication" \
  --input '{"method": "login", "credentials": {"email": "vendor@example.com"}}'
```

---

## 🔍 **Development Workflow Integration**

### **1. Project Setup**
```bash
# Create IslandFund agent project
pnpm create vite@latest islandfund-agent \
  --template react-ts

cd islandfund-agent

# Add Antigravity integration
pnpm add @antigravity/core

# Configure agent for IslandFund
antigravity init \
  --name "IslandFund Agent" \
  --database postgresql \
  --cache redis
```

### **2. Testing Skills**
```bash
# Test database operations
antigravity test-skill \
  --skill "database_query"

# Test marketplace operations
antigravity test-skill \
  --skill "marketplace_operations"

# Test payment processing
antigravity test-skill \
  --skill "payment_processing"

# Run all tests
antigravity test \
  --project islandfund-agent
```

### **3. Production Deployment**
```bash
# Build agent for production
pnpm build

# Deploy with workflow support
antigravity deploy \
  --project islandfund-agent \
  --workflow "full_application_deployment" \
  --environment production
```

---

## 📚 **Skill Development Guidelines**

### **Best Practices**
1. **Input Validation**: Always validate and sanitize user inputs
2. **Error Handling**: Implement comprehensive try-catch blocks
3. **Logging**: Use structured logging for debugging and monitoring
4. **Security**: Never expose sensitive information in outputs
5. **Idempotency**: Ensure operations can be safely retried
6. **Performance**: Optimize database queries and API calls

### **Testing Strategy**
```typescript
// Example test for marketplace skill
describe('MarketplaceSkill', () => {
  it('should create valid listing', async () => {
    const skill = new MarketplaceSkill();
    const input = {
      operation: 'create_listing',
      data: {
        title: 'Test Product',
        price: 99.99,
        category: 'electronics'
      }
    };
    
    const result = await skill.execute(input);
    
    expect(result.success).toBe(true);
    expect(result.listing).toBeDefined();
    expect(result.listing.title).toBe('Test Product');
  });
  
  it('should handle invalid listing data', async () => {
    const skill = new MarketplaceSkill();
    const input = {
      operation: 'create_listing',
      data: {} // Invalid empty data
    };
    
    const result = await skill.execute(input);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('validation failed');
  });
});
```

### **Documentation Requirements**
- Each skill must have comprehensive JSDoc comments
- Include input/output schema documentation
- Provide usage examples in README
- Add error codes and handling documentation

---

## 🔄 **CI/CD Integration**

### **GitHub Actions Workflow**
```yaml
name: IslandFund Agent CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-agent:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: |
          cd islandfund-agent
          pnpm install
          antigravity test --project islandfund-agent
          antigravity lint --project islandfund-agent
          
  deploy-agent:
    needs: test-agent
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: |
          cd islandfund-agent
          pnpm build
          antigravity deploy \
            --project islandfund-agent \
            --environment production
```

---

## 🎯 **Success Metrics**

### **Key Performance Indicators**
- **Rule Evaluation Speed**: <100ms per rule
- **Workflow Execution Success Rate**: >95%
- **Skill Response Time**: <500ms average
- **System Uptime**: >99.9%

### **Monitoring Integration**
```typescript
// Add to main agent class
class IslandFundAgent {
  constructor() {
    this.metrics = new MetricsCollector();
    this.logger = new Logger('islandfund-agent');
  }
  
  async executeWorkflow(workflowName: string): Promise<WorkflowResult> {
    const startTime = Date.now();
    this.logger.info(`Starting workflow: ${workflowName}`);
    
    try {
      // Execute workflow steps
      const result = await this.workflowEngine.run(workflowName);
      
      const duration = Date.now() - startTime;
      this.metrics.recordWorkflowExecution(workflowName, duration, true);
      
      return result;
    } catch (error) {
      this.metrics.recordWorkflowExecution(workflowName, Date.now() - startTime, false);
      this.logger.error(`Workflow failed: ${workflowName}`, error);
      throw error;
    }
  }
}
```

---

## 🛠️ **Extending the Agent**

### **Custom Rules Addition**
```typescript
// Example: Custom rule for Caribbean marketplace compliance
const caribbeanMarketplaceRule: Rule = {
  name: "caribbean_marketplace_compliance",
  description: "Ensure listings comply with Caribbean marketplace regulations",
  condition: "listing.category IN ['food', 'handicrafts'] AND listing.origin = 'caribbean'",
  action: "validate_caribbean_compliance",
  priority: "high"
};

// Add rule to engine
this.rulesEngine.addRule(caribbeanMarketplaceRule);
```

### **New Skill Creation**
```typescript
// Example: Inventory management skill
interface InventorySkill {
  name: "inventory_management";
  description: "Manage product inventory and stock levels";
  input: {
    operation: 'update_stock' | 'check_inventory' | 'reserve_stock';
    productId: string;
    quantity?: number;
    location?: string;
  };
  output: {
    success: boolean;
    stockLevel?: number;
    reservedItems?: any[];
    lowStockAlerts?: any[];
    error?: string;
  };
}

class InventorySkill implements Skill {
  async execute(input: InventorySkill['input']): Promise<InventorySkill['output']> {
    // Implementation for inventory management
    // Connect to database, update stock levels, handle reservations
    // Provide real-time inventory status
  }
}
```

---

## 📖 **Frontend Integration**

### **React Component for Agent**
```typescript
// Agent interface component for IslandFund web app
interface AgentInterface {
  sendMessage: (message: string) => Promise<string>;
  executeSkill: (skill: string, input: any) => Promise<any>;
  getStatus: () => Promise<AgentStatus>;
}

const IslandFundAgentWidget: React.FC = () => {
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [messages, setMessages] = useState<string[]>([]);
  
  const executeAgentSkill = async (skill: string, input: any) => {
    setStatus('processing');
    try {
      const result = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, input })
      }).then(res => res.json());
      
      setMessages(prev => [...prev, `Executed ${skill}: ${JSON.stringify(result)}`]);
      setStatus('idle');
    } catch (error) {
      setMessages(prev => [...prev, `Error executing ${skill}: ${error.message}`]);
      setStatus('idle');
    }
  };
  
  return (
    <div className="agent-widget">
      <div className="agent-status">
        <span>Status: {status}</span>
      </div>
      <div className="agent-controls">
        <button onClick={() => executeAgentSkill('marketplace_search', { category: 'electronics' })}>
          Search Electronics
        </button>
        <button onClick={() => executeAgentSkill('user_management', { operation: 'list_users' })}>
          List Users
        </button>
      </div>
      <div className="agent-messages">
        {messages.map((msg, index) => (
          <div key={index} className="agent-message">
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **Mobile Integration**
```typescript
// React Native integration for agent
import { Alert } from 'react-native';

const useIslandFundAgent = () => {
  const [agentStatus, setAgentStatus] = useState<'idle' | 'processing'>('idle');
  
  const executeMobileSkill = async (skill: string, input: any) => {
    setAgentStatus('processing');
    
    try {
      const response = await fetch(`${API_BASE_URL}/agent/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ skill, input })
      });
      
      const result = await response.json();
      Alert.alert(`${skill} executed successfully`);
    } catch (error) {
      Alert.alert(`Error: ${error.message}`);
    } finally {
      setAgentStatus('idle');
    }
  };
  
  return { agentStatus, executeMobileSkill };
};
```

---

## 🔐 **Security and Compliance**

### **Data Protection**
- All sensitive data encrypted at rest
- PII data masked in logs
- GDPR compliance for EU users
- Regular security audits of agent code

### **Access Control**
- Role-based access to agent functions
- Audit logging for all agent actions
- Rate limiting on agent API endpoints

### **Incident Response**
```typescript
class SecurityIncidentResponse {
  async handleSecurityIncident(incident: SecurityIncident): Promise<IncidentResponse> {
    // Immediate security measures
    if (incident.severity === 'critical') {
      await this.executeSkill('security_lockdown', { reason: incident.description });
    }
    
    // Notify stakeholders
    await this.notifySecurityTeam(incident);
    
    // Document incident
    await this.logIncident(incident);
  }
}
```

---

This enhanced `agents.md` integration provides IslandFund with:

🔧 **Structured Rules Engine** for compliance and automation
🔄 **Workflow System** for complex operational processes  
🛠️ **5 Core Skills** covering all major application functions
📱 **Multi-Platform Integration** for web and mobile
🔐 **Security Framework** with compliance and incident response
📊 **CI/CD Pipeline** for automated testing and deployment
📚 **Development Guidelines** with best practices and examples

The agent can now handle complex marketplace operations, security incidents, user management, and system automation while maintaining full integration with your existing IslandFund application architecture.