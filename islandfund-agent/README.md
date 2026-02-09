# 🏝️ IslandFund Agent

An intelligent agent for managing the IslandFund multi-platform marketplace application, built with the Antigravity framework.

## 🌟 Features

- **📊 Database Management**: Execute SQL queries and manage database operations
- **🔒 API Health Monitoring**: Monitor service health and performance metrics
- **🛍 Marketplace Operations**: Manage listings, vendors, and transactions
- **🔐 User Authentication**: Handle login, registration, and token management
- **💳 Payment Processing**: Process payments with multiple providers
- **📋 Compliance & Rules**: Enforce marketplace rules and security policies

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Test the agent
antigravity test --project islandfund-agent

# Deploy to production
antigravity deploy --project islandfund-agent --environment production
```

## 📖 Usage Examples

### **Command Line**
```bash
# Evaluate a marketplace rule
antigravity evaluate-rule \
  --rule "validate_listing_creation" \
  --context '{"user": {"role": "vendor"}, "listing": {"type": "product"}}'

# Run a workflow
antigravity run-workflow \
  --workflow "full_application_deployment"

# Execute a skill
antigravity call-skill \
  --skill "marketplace_operations" \
  --input '{"operation": "search_listings", "filters": {"category": "electronics"}}'
```

### **Programmatic API**
```typescript
import { execute } from './src/skills/marketplace-operations-skill';

// Search for electronics listings
const result = await execute('marketplace_operations', {
  operation: 'search_listings',
  filters: { category: 'electronics' }
});

console.log(`Found ${result.total} listings`);
```

## 🔧 Configuration

The agent uses environment variables for configuration:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `API_BASE_URL`: Base URL for API requests
- `JWT_SECRET`: Secret for JWT token generation

## 🛠️ Security & Compliance

- Built-in input validation and SQL injection prevention
- GDPR-compliant data handling
- Role-based access control
- Comprehensive audit logging

## 📊 Integration

Works seamlessly with the existing IslandFund application architecture:

- **Backend API**: Node.js + Express + PostgreSQL
- **Web Frontend**: Next.js + React + Tailwind CSS
- **Mobile App**: React Native + Expo

## 🤖 Development

To extend the agent:

1. **Add New Skills**: Create new `.ts` files in `src/skills/`
2. **Define Rules**: Add new rules in `src/rules/`
3. **Create Workflows**: Add new workflows in `src/workflows/`
4. **Update Configuration**: Modify agent settings as needed

## 📞 Support

For questions or issues, please refer to the main IslandFund repository or contact the development team.