#!/usr/bin/env python3
"""
ibt-gap-analysis.py — Structured gap analysis tool for IBT Solutions Agent.

Usage:
    python3 ibt-gap-analysis.py --field "tourism" --employees 10 --revenue 50000
    python3 ibt-gap-analysis.py --field "retail" --current-tools "WhatsApp,Excel" --pain-points "inventory,online-presence"

Generates a structured JSON analysis that the IBT Solutions Agent can use
to provide specific, actionable recommendations.
"""

import argparse
import json
import sys

# Industry benchmark data for Caribbean/SIDS context
BENCHMARKS = {
    "ecommerce": {
        "tech_stack": ["CMS", "Payment Gateway", "Analytics", "CRM", "Inventory Management", "Email Marketing"],
        "automation_level": 0.7,
        "channels": ["web", "mobile", "social", "marketplace"],
        "kpis": ["conversion_rate", "avg_order_value", "customer_lifetime_value", "cart_abandonment"]
    },
    "tourism": {
        "tech_stack": ["Booking Engine", "Channel Manager", "CRM", "PMS", "Revenue Management", "Review Management"],
        "automation_level": 0.6,
        "channels": ["direct", "ota", "social", "marketplace"],
        "kpis": ["occupancy_rate", "adr", "revpar", "guest_satisfaction"]
    },
    "agriculture": {
        "tech_stack": ["Farm Management", "Market Access", "Weather Monitoring", "Traceability", "Financial Tracking"],
        "automation_level": 0.3,
        "channels": ["direct", "wholesale", "export", "marketplace"],
        "kpis": ["yield_per_hectare", "post_harvest_loss", "market_price_realization"]
    },
    "retail": {
        "tech_stack": ["POS", "Inventory Mgmt", "CRM", "E-commerce", "Analytics", "Loyalty Program"],
        "automation_level": 0.5,
        "channels": ["in_store", "online", "social", "delivery"],
        "kpis": ["inventory_turnover", "gross_margin", "customer_retention", "basket_size"]
    },
    "services": {
        "tech_stack": ["Scheduling", "CRM", "Invoicing", "Project Mgmt", "Communication", "Knowledge Base"],
        "automation_level": 0.5,
        "channels": ["direct", "referral", "online", "marketplace"],
        "kpis": ["utilization_rate", "client_satisfaction", "repeat_business", "average_fee"]
    },
    "healthcare": {
        "tech_stack": ["EMR", "Scheduling", "Billing", "Telehealth", "Inventory", "Analytics"],
        "automation_level": 0.4,
        "channels": ["in_person", "telehealth", "referral"],
        "kpis": ["patient_wait_time", "bed_occupancy", "revenue_per_patient", "readmission_rate"]
    },
    "education": {
        "tech_stack": ["LMS", "SIS", "Communication", "Content Mgmt", "Assessment", "Analytics"],
        "automation_level": 0.4,
        "channels": ["in_person", "online", "hybrid"],
        "kpis": ["enrollment_rate", "completion_rate", "student_satisfaction", "employment_rate"]
    },
    "government": {
        "tech_stack": ["CRM", "Case Mgmt", "Document Mgmt", "Analytics", "Portal", "Workflow Automation"],
        "automation_level": 0.3,
        "channels": ["in_person", "online", "phone"],
        "kpis": ["processing_time", "citizen_satisfaction", "cost_per_transaction", "digital_adoption"]
    }
}

# Open source tool recommendations by category
TOOL_RECOMMENDATIONS = {
    "CMS": [
        {"name": "Strapi", "complexity": "medium", "cost": "free", "hosting": "self-hosted"},
        {"name": "Directus", "complexity": "low", "cost": "free", "hosting": "self-hosted"},
        {"name": "Ghost", "complexity": "low", "cost": "free", "hosting": "self-hosted or cloud"}
    ],
    "CRM": [
        {"name": "EspoCRM", "complexity": "low", "cost": "free", "hosting": "self-hosted"},
        {"name": "SuiteCRM", "complexity": "medium", "cost": "free", "hosting": "self-hosted"},
        {"name": "Twenty CRM", "complexity": "low", "cost": "free", "hosting": "self-hosted"}
    ],
    "Analytics": [
        {"name": "Metabase", "complexity": "low", "cost": "free", "hosting": "self-hosted"},
        {"name": "Apache Superset", "complexity": "medium", "cost": "free", "hosting": "self-hosted"},
        {"name": "Redash", "complexity": "low", "cost": "free", "hosting": "self-hosted"}
    ],
    "E-commerce": [
        {"name": "Saleor", "complexity": "high", "cost": "free", "hosting": "self-hosted"},
        {"name": "Medusa", "complexity": "medium", "cost": "free", "hosting": "self-hosted"},
        {"name": "WooCommerce", "complexity": "low", "cost": "free", "hosting": "WordPress"}
    ],
    "Booking Engine": [
        {"name": "QloApps", "complexity": "medium", "cost": "free", "hosting": "self-hosted"},
        {"name": "Cal.com", "complexity": "low", "cost": "free", "hosting": "self-hosted or cloud"}
    ],
    "Farm Management": [
        {"name": "FarmOS", "complexity": "medium", "cost": "free", "hosting": "self-hosted"},
        {"name": "Tania", "complexity": "low", "cost": "free", "hosting": "self-hosted"}
    ],
    "Communication": [
        {"name": "Mattermost", "complexity": "medium", "cost": "free", "hosting": "self-hosted"},
        {"name": "Rocket.Chat", "complexity": "medium", "cost": "free", "hosting": "self-hosted"},
        {"name": "Element", "complexity": "medium", "cost": "free", "hosting": "self-hosted or cloud"}
    ],
    "Project Management": [
        {"name": "Plane", "complexity": "low", "cost": "free", "hosting": "self-hosted"},
        {"name": "OpenProject", "complexity": "medium", "cost": "free", "hosting": "self-hosted"},
        {"name": "Taiga", "complexity": "low", "cost": "free", "hosting": "self-hosted"}
    ],
    "Automation": [
        {"name": "n8n", "complexity": "medium", "cost": "free", "hosting": "self-hosted"},
        {"name": "Node-RED", "complexity": "low", "cost": "free", "hosting": "self-hosted"}
    ],
    "Documentation": [
        {"name": "BookStack", "complexity": "low", "cost": "free", "hosting": "self-hosted"},
        {"name": "Outline", "complexity": "medium", "cost": "free", "hosting": "self-hosted"}
    ],
    "LMS": [
        {"name": "Moodle", "complexity": "medium", "cost": "free", "hosting": "self-hosted"},
        {"name": "Chamilo", "complexity": "low", "cost": "free", "hosting": "self-hosted"}
    ],
    "EMR": [
        {"name": "OpenMRS", "complexity": "high", "cost": "free", "hosting": "self-hosted"}
    ]
}


def analyze_gap(field: str, employees: int = None, revenue: int = None,
                 current_tools: list = None, pain_points: list = None) -> dict:
    """Perform structured gap analysis for a given field."""
    field_key = field.lower().replace(" ", "_")

    # Find matching benchmark
    benchmark = None
    for key in BENCHMARKS:
        if key in field_key or field_key in key:
            benchmark = BENCHMARKS[key]
            break

    if not benchmark:
        benchmark = BENCHMARKS["services"]  # Default to services benchmark

    # Analyze current tools
    current_tools = current_tools or []
    current_categories = set()
    for tool in current_tools:
        tool_lower = tool.lower()
        for category, tools in TOOL_RECOMMENDATIONS.items():
            for t in tools:
                if t["name"].lower() in tool_lower:
                    current_categories.add(category)

    # Identify gaps
    expected_stack = set(benchmark["tech_stack"])
    missing_categories = expected_stack - current_categories

    # Build recommendations
    recommendations = {"quick_wins": [], "medium_term": [], "strategic": []}

    for missing in missing_categories:
        if missing in TOOL_RECOMMENDATIONS:
            tools = TOOL_RECOMMENDATIONS[missing]
            # Quick wins: low complexity, free
            quick = [t for t in tools if t["complexity"] == "low"]
            if quick:
                recommendations["quick_wins"].append({
                    "category": missing,
                    "tools": quick[:2],
                    "impact": f"Establish {missing} capability"
                })
            # Medium term: medium complexity
            medium = [t for t in tools if t["complexity"] == "medium"]
            if medium:
                recommendations["medium_term"].append({
                    "category": missing,
                    "tools": medium[:2],
                    "impact": f"Advanced {missing} with integrations"
                })

    # Pain point mapping
    pain_analysis = []
    for pain in (pain_points or []):
        pain_lower = pain.lower()
        mapped = False
        if any(word in pain_lower for word in ["inventory", "stock", "supply"]):
            pain_analysis.append({
                "pain_point": pain,
                "root_cause": "Lack of inventory management system",
                "solutions": TOOL_RECOMMENDATIONS.get("Inventory Mgmt", [])[:2]
            })
            mapped = True
        if any(word in pain_lower for word in ["online", "website", "digital", "ecommerce"]):
            pain_analysis.append({
                "pain_point": pain,
                "root_cause": "No digital presence or e-commerce capability",
                "solutions": TOOL_RECOMMENDATIONS.get("E-commerce", [])[:2]
            })
            mapped = True
        if any(word in pain_lower for word in ["customer", "crm", "follow", "retention"]):
            pain_analysis.append({
                "pain_point": pain,
                "root_cause": "No customer relationship management",
                "solutions": TOOL_RECOMMENDATIONS.get("CRM", [])[:2]
            })
            mapped = True
        if any(word in pain_lower for word in ["report", "analytics", "data", "insight"]):
            pain_analysis.append({
                "pain_point": pain,
                "root_cause": "No business intelligence or analytics",
                "solutions": TOOL_RECOMMENDATIONS.get("Analytics", [])[:2]
            })
            mapped = True
        if any(word in pain_lower for word in ["manual", "paper", "excel", "spreadsheet"]):
            pain_analysis.append({
                "pain_point": pain,
                "root_cause": "Manual processes without automation",
                "solutions": TOOL_RECOMMENDATIONS.get("Automation", [])[:2]
            })
            mapped = True
        if not mapped:
            pain_analysis.append({
                "pain_point": pain,
                "root_cause": "Requires further investigation",
                "solutions": []
            })

    # Build result
    result = {
        "field": field,
        "benchmark": {
            "expected_tech_stack": benchmark["tech_stack"],
            "automation_target": benchmark["automation_level"],
            "channels": benchmark["channels"],
            "kpis": benchmark["kpis"]
        },
        "current_state": {
            "tools_in_use": current_tools,
            "categories_covered": list(current_categories),
            "employee_count": employees,
            "revenue_range": revenue
        },
        "gaps": {
            "missing_categories": list(missing_categories),
            "automation_gap": max(0, benchmark["automation_level"] - (len(current_categories) / max(len(expected_stack), 1))),
            "channel_gaps": list(set(benchmark["channels"]) - set())  # Would need channel data
        },
        "pain_point_analysis": pain_analysis,
        "recommendations": recommendations,
        "caribbean_considerations": [
            "Ensure tools work with intermittent internet connectivity",
            "Consider hosting on regional cloud (Caribbean-based if available)",
            "Account for import duties on hardware (typically 20-40% in CARICOM)",
            "Plan for hurricane season backup (June-November)",
            "Consider local payment gateway integration (WiPay, local banks)",
            "Factor in seasonal revenue fluctuations for tourism-dependent businesses"
        ]
    }

    return result


def main():
    parser = argparse.ArgumentParser(description="IBT Solutions Gap Analysis Tool")
    parser.add_argument("--field", required=True, help="Business field/industry")
    parser.add_argument("--employees", type=int, help="Number of employees")
    parser.add_argument("--revenue", type=int, help="Annual revenue in USD")
    parser.add_argument("--current-tools", nargs="+", help="Currently used tools")
    parser.add_argument("--pain-points", nargs="+", help="Known pain points")
    parser.add_argument("--output", choices=["json", "summary"], default="json")

    args = parser.parse_args()

    result = analyze_gap(
        field=args.field,
        employees=args.employees,
        revenue=args.revenue,
        current_tools=args.current_tools,
        pain_points=args.pain_points
    )

    if args.output == "json":
        print(json.dumps(result, indent=2))
    else:
        print(f"\n{'='*60}")
        print(f"GAP ANALYSIS: {result['field'].upper()}")
        print(f"{'='*60}")
        print(f"\nMissing Capabilities: {', '.join(result['gaps']['missing_categories'])}")
        print(f"Automation Gap: {result['gaps']['automation_gap']:.0%}")
        print(f"\nQuick Wins ({len(result['recommendations']['quick_wins'])}):")
        for r in result['recommendations']['quick_wins']:
            tools = ", ".join(t['name'] for t in r['tools'])
            print(f"  • {r['category']}: {tools}")
        print(f"\nMedium-Term ({len(result['recommendations']['medium_term'])}):")
        for r in result['recommendations']['medium_term']:
            tools = ", ".join(t['name'] for t in r['tools'])
            print(f"  • {r['category']}: {tools}")


if __name__ == "__main__":
    main()
