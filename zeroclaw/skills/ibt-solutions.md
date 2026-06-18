# IBT Solutions Skill — Pain Point Analysis & Gap Identification

## Purpose
This skill enables the IBT Solutions Advisor agent to perform structured pain point analysis, gap identification, and solution recommendations for businesses across any field, with special focus on Caribbean/SIDS (Small Island Developing States) contexts.

## Trigger Conditions
Activate this skill when:
- User describes a business problem or inefficiency
- User asks "what's missing" or "how can I improve" about their operations
- User mentions comparing themselves to competitors or industry standards
- User asks about digital transformation or technology adoption
- User wants recommendations for tools or platforms in a specific domain
- User mentions workflow bottlenecks, customer complaints, or revenue leakage

## Analysis Framework

### Phase 1: Discovery
Ask these questions to understand the context:
1. What industry/field is the business in?
2. How many employees and what's the annual revenue range?
3. What tech tools are currently in use?
4. What are the top 3 frustrations in daily operations?
5. What does the customer journey look like end-to-end?
6. What's the biggest competitive pressure right now?

### Phase 2: Pain Point Identification
For each identified area, assess:
- **Operational**: Manual processes, redundant tasks, communication gaps
- **Technical**: Outdated systems, missing integrations, data silos
- **Customer**: Long wait times, poor follow-up, inconsistent experience
- **Financial**: Revenue leakage, high overhead, missed opportunities
- **Compliance**: Regulatory gaps, documentation issues, audit readiness

### Phase 3: Gap Analysis Matrix
Compare Current State vs. Desired State across:
- Technology stack completeness
- Process automation level
- Data utilization maturity
- Customer experience quality
- Team productivity metrics
- Market positioning

### Phase 4: Solution Mapping
For each gap, recommend:
1. **Quick wins** (implement in < 1 week, low cost)
2. **Medium-term** (1-4 weeks, moderate investment)
3. **Strategic** (1-3 months, significant impact)

## Open Source Tool Reference

### By Category

#### CRM & Customer Management
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **EspoCRM** | Small businesses, lightweight | Low | ★★★★★ |
| **SuiteCRM** | Sales-focused teams | Medium | ★★★★☆ |
| **Odoo CRM** | Full business suite | High | ★★★☆☆ |
| **Twenty CRM** | Modern UI, startups | Low | ★★★★☆ |

#### ERP & Business Management
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **ERPNext** | Full ERP, manufacturing | High | ★★★★☆ |
| **Odoo Community** | Modular ERP | High | ★★★☆☆ |
| **Dolibarr** | SMBs, simple ERP | Low | ★★★★★ |
| **iDempiere** | Enterprise ERP | High | ★★★☆☆ |

#### Analytics & Business Intelligence
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **Metabase** | Simple dashboards | Low | ★★★★★ |
| **Apache Superset** | Advanced analytics | Medium | ★★★★☆ |
| **Redash** | SQL-based reporting | Low | ★★★★☆ |
| **Grafana** | Time-series monitoring | Medium | ★★★★☆ |

#### E-Commerce & Marketplace
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **Saleor** | Headless commerce | High | ★★★☆☆ |
| **Medusa** | Modern e-commerce | Medium | ★★★★☆ |
| **WooCommerce** | WordPress shops | Low | ★★★★★ |
| **PrestaShop** | Traditional e-commerce | Medium | ★★★★☆ |

#### Communication & Collaboration
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **Mattermost** | Team chat, Slack alt | Medium | ★★★★★ |
| **Rocket.Chat** | Full collaboration | Medium | ★★★★☆ |
| **Element/Matrix** | Secure messaging | Medium | ★★★★☆ |
| **Zulip** | Topic-based chat | Low | ★★★★☆ |

#### Project Management
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **Plane** | Modern issue tracking | Low | ★★★★★ |
| **OpenProject** | Full PM suite | Medium | ★★★★☆ |
| **Taiga** | Agile/scrum teams | Low | ★★★★☆ |
| **Focalboard** | Kanban boards | Low | ★★★★★ |

#### Documentation & Knowledge
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **BookStack** | Wiki/documentation | Low | ★★★★★ |
| **Outline** | Team knowledge base | Medium | ★★★★☆ |
| **Wiki.js** | Modern wiki | Medium | ★★★★☆ |
| **AppFlowy** | Notion alternative | Low | ★★★★★ |

#### Automation & Integration
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **n8n** | Workflow automation | Medium | ★★★★★ |
| **Apache Airflow** | Complex pipelines | High | ★★★☆☆ |
| **Huginn** | Agent-based automation | Medium | ★★★★☆ |
| **Node-RED** | IoT/integration flows | Low | ★★★★☆ |

#### Monitoring & Security
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **Uptime Kuma** | Uptime monitoring | Low | ★★★★★ |
| **Grafana + Prometheus** | Full monitoring stack | High | ★★★☆☆ |
| **Wazuh** | Security monitoring | High | ★★★☆☆ |
| **OSSEC** | Host intrusion detection | Medium | ★★★★☆ |

#### AI/ML & Chatbots
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **Ollama** | Local LLM hosting | Medium | ★★★★☆ |
| **Open WebUI** | LLM chat interface | Low | ★★★★★ |
| **LangChain** | AI app framework | High | ★★★☆☆ |
| **Flowise** | No-code AI builder | Low | ★★★★★ |

#### Agriculture (Caribbean-specific)
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **OpenForis** | Forest monitoring | High | ★★★★★ |
| **FarmOS** | Farm management | Medium | ★★★★★ |
| **OpenAg** | Agricultural data | Medium | ★★★★☆ |
| **Tania** | Small farm tracking | Low | ★★★★★ |

#### Tourism & Hospitality
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **QloApps** | Hotel management (Open Source Hotel PMS) | Medium | ★★★★★ |
| **Mews** | Cloud PMS (has free tier) | Low | ★★★★☆ |
| **OpenTravel** | Travel booking standard | High | ★★★☆☆ |

#### Education & Training
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **Moodle** | LMS for schools | Medium | ★★★★★ |
| **Open edX** | Online courses | High | ★★★★☆ |
| **Chamilo** | Lightweight LMS | Low | ★★★★★ |

#### Government & Public Services
| Tool | Best For | Complexity | Caribbean Fit |
|------|----------|------------|---------------|
| **OpenG2P** | Social protection | High | ★★★★★ |
| **DHIS2** | Health information | High | ★★★★☆ |
| **OpenMRS** | Medical records | High | ★★★★☆ |

## Field-Specific Solution Templates

### Retail / Small Shop
Pain: Manual inventory, no online presence
Gap: Digital sales channel, stock management
Solution: WooCommerce + Metabase + n8n automation

### Restaurant / Food
Pain: Orders by phone/WhatsApp only, no table management
Gap: Online ordering, reservation system, kitchen display
Solution: QloApps + custom ordering portal + Mattermost for staff

### Tour Operator
Pain: Bookings via email/DMs, no availability calendar
Gap: Booking engine, payment processing, CRM
Solution: Medusa + EspoCRM + n8n webhook automation

### Agricultural Producer
Pain: No farm records, manual sales tracking
Gap: Farm management, market access, traceability
Solution: FarmOS + Marketplace listing + BookStack for SOPs

### Professional Services
Pain: Scattered client communication, manual invoicing
Gap: Client portal, time tracking, invoicing
Solution: Odoo Community + Plane + BookStack

### Healthcare Clinic
Pain: Paper records, appointment no-shows
Gap: Patient management, reminders, telehealth
Solution: OpenMRS + Rocket.Chat + Uptime Kuma

## Output Format

When providing analysis, use this structure:

### Executive Summary
One-paragraph overview of the situation and top recommendation.

### Pain Points (Ranked by Impact)
1. [Pain Point] — Severity: High/Medium/Low — Root cause: [cause]
2. ...

### Gap Analysis
| Area | Current State | Desired State | Gap Level |
|------|--------------|---------------|-----------|
| [area] | [current] | [desired] | Critical/Major/Minor |

### Recommended Solutions
#### Quick Wins (< 1 week)
- [Tool/Action]: [Expected impact]

#### Medium-Term (1-4 weeks)
- [Tool/Action]: [Expected impact]

#### Strategic (1-3 months)
- [Tool/Action]: [Expected impact]

### Caribbean-Specific Considerations
- Internet connectivity constraints
- Import duties on hardware
- Local payment processing (WiPay, local banks)
- Climate/hurricane preparedness for tech infrastructure
- Regional data sovereignty requirements
- Seasonal business fluctuations (tourism)

### Budget Estimate
Provide rough cost ranges:
- Free (open source, self-hosted)
- Low ($0-100/month hosted)
- Medium ($100-500/month)
- High ($500+/month or significant setup)

## Integration with Other Skills
- Can invoke the `code-analysis` skill for technical audits
- Can invoke the `conversion-psychology` skill for customer experience gaps
- Can reference the `hermes-agent` skill for Hermes-specific configurations
