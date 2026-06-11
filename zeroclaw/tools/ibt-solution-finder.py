#!/usr/bin/env python3
"""
ibt-solution-finder.py — Find open source solutions for specific business needs.

Usage:
    python3 ibt-solution-finder.py --need "inventory management" --field "retail"
    python3 ibt-solution-finder.py --need "customer communication" --field "tourism" --budget low
    python3 ibt-solution-finder.py --compare "CRM" --options "SuiteCRM,EspoCRM,Odoo CRM"

Returns structured JSON with tool comparisons and recommendations.
"""

import argparse
import json
import sys

# Comprehensive open source tool database
TOOLS_DB = {
    # CRM
    "EspoCRM": {
        "category": "CRM",
        "description": "Lightweight, web-based CRM with sales automation",
        "complexity": "low",
        "cost": "free",
        "hosting": "self-hosted",
        "strengths": ["Easy setup", "Clean UI", "API-first", "Email integration"],
        "weaknesses": ["Limited reporting", "Small community"],
        "best_for": "Small businesses needing simple CRM",
        "caribbean_fit": 5
    },
    "SuiteCRM": {
        "category": "CRM",
        "description": "Full-featured CRM, fork of SugarCRM",
        "complexity": "medium",
        "cost": "free",
        "hosting": "self-hosted",
        "strengths": ["Feature-rich", "Workflow automation", "Reporting", "Large community"],
        "weaknesses": ["Complex setup", "Dated UI"],
        "best_for": "Sales teams needing automation",
        "caribbean_fit": 4
    },
    "Twenty CRM": {
        "category": "CRM",
        "description": "Modern open-source CRM built with TypeScript",
        "complexity": "low",
        "cost": "free",
        "hosting": "self-hosted or cloud",
        "strengths": ["Modern UI", "Fast", "Developer-friendly", "Well-documented"],
        "weaknesses": ["Newer project", "Fewer integrations"],
        "best_for": "Startups and modern businesses",
        "caribbean_fit": 4
    },
    # Analytics
    "Metabase": {
        "category": "Analytics",
        "description": "Simple, open-source business intelligence",
        "complexity": "low",
        "cost": "free",
        "hosting": "self-hosted or cloud",
        "strengths": ["Easy dashboards", "SQL editor", "Email alerts", "Embedding"],
        "weaknesses": ["Limited advanced analytics"],
        "best_for": "Teams needing quick dashboards",
        "caribbean_fit": 5
    },
    "Apache Superset": {
        "category": "Analytics",
        "description": "Enterprise-grade data visualization platform",
        "complexity": "medium",
        "cost": "free",
        "hosting": "self-hosted",
        "strengths": ["Advanced visualizations", "SQL lab", "Role-based access"],
        "weaknesses": ["Complex setup", "Resource intensive"],
        "best_for": "Data-heavy organizations",
        "caribbean_fit": 4
    },
    "Grafana": {
        "category": "Analytics",
        "description": "Time-series monitoring and alerting",
        "complexity": "medium",
        "cost": "free",
        "hosting": "self-hosted",
        "strengths": ["Real-time monitoring", "Alerting", "Many plugins"],
        "weaknesses": ["Not general-purpose BI"],
        "best_for": "Infrastructure and application monitoring",
        "caribbean_fit": 4
    },
    # E-commerce
    "WooCommerce": {
        "category": "E-commerce",
        "description": "WordPress-based e-commerce platform",
        "complexity": "low",
        "cost": "free (hosting costs)",
        "hosting": "WordPress hosting",
        "strengths": ["Easy setup", "Huge plugin ecosystem", "SEO-friendly", "Large community"],
        "weaknesses": ["WordPress dependency", "Performance at scale"],
        "best_for": "Small to medium online stores",
        "caribbean_fit": 5
    },
    "Medusa": {
        "category": "E-commerce",
        "description": "Headless commerce platform built with Node.js",
        "complexity": "medium",
        "cost": "free",
        "hosting": "self-hosted or cloud",
        "strengths": ["Modern architecture", "Developer-friendly", "Composable", "Fast"],
        "weaknesses": ["Requires dev resources", "Newer ecosystem"],
        "best_for": "Custom e-commerce experiences",
        "caribbean_fit": 4
    },
    "Saleor": {
        "category": "E-commerce",
        "description": "Headless e-commerce with GraphQL API",
        "complexity": "high",
        "cost": "free (cloud available)",
        "hosting": "self-hosted or cloud",
        "strengths": ["GraphQL", "Multi-channel", "Enterprise features"],
        "weaknesses": ["Complex setup", "Resource intensive"],
        "best_for": "Large-scale commerce operations",
        "caribbean_fit": 3
    },
    # Communication
    "Mattermost": {
        "category": "Communication",
        "description": "Slack alternative for team collaboration",
        "complexity": "medium",
        "cost": "free (Enterprise available)",
        "hosting": "self-hosted or cloud",
        "strengths": ["Slack-like UX", "File sharing", "Integrations", "Compliance"],
        "weaknesses": ["Resource usage", "Setup complexity"],
        "best_for": "Teams needing Slack alternative with data control",
        "caribbean_fit": 5
    },
    "Rocket.Chat": {
        "category": "Communication",
        "description": "Full-featured team communication platform",
        "complexity": "medium",
        "cost": "free (Enterprise available)",
        "hosting": "self-hosted or cloud",
        "strengths": ["Video calls", "Screen sharing", "Omnichannel", "Marketplace"],
        "weaknesses": ["Heavy resource usage", "Complex admin"],
        "best_for": "Organizations needing full collaboration suite",
        "caribbean_fit": 4
    },
    # Project Management
    "Plane": {
        "category": "Project Management",
        "description": "Open-source project management, Linear alternative",
        "complexity": "low",
        "cost": "free",
        "hosting": "self-hosted or cloud",
        "strengths": ["Clean UI", "Fast", "Cycles/Sprints", "Issues"],
        "weaknesses": ["Newer project"],
        "best_for": "Software teams and startups",
        "caribbean_fit": 5
    },
    "OpenProject": {
        "category": "Project Management",
        "description": "Full project management suite",
        "complexity": "medium",
        "cost": "free (Enterprise available)",
        "hosting": "self-hosted",
        "strengths": ["Gantt charts", "Time tracking", "Agile boards", "Budgeting"],
        "weaknesses": ["Complex setup", "Heavy resource usage"],
        "best_for": "Large organizations with complex projects",
        "caribbean_fit": 4
    },
    # Automation
    "n8n": {
        "category": "Automation",
        "description": "Visual workflow automation tool",
        "complexity": "medium",
        "cost": "free (cloud available)",
        "hosting": "self-hosted or cloud",
        "strengths": ["Visual editor", "400+ integrations", "Self-hostable", "Fair-code license"],
        "weaknesses": ["Complex workflows can be slow"],
        "best_for": "Connecting apps and automating workflows",
        "caribbean_fit": 5
    },
    "Node-RED": {
        "category": "Automation",
        "description": "Flow-based programming for IoT and integrations",
        "complexity": "low",
        "cost": "free",
        "hosting": "self-hosted",
        "strengths": ["Visual flows", "Lightweight", "IoT focus", "Easy to learn"],
        "weaknesses": ["Not a full automation platform"],
        "best_for": "IoT projects and simple integrations",
        "caribbean_fit": 4
    },
    # Documentation
    "BookStack": {
        "category": "Documentation",
        "description": "Simple, self-hosted wiki and documentation",
        "complexity": "low",
        "cost": "free",
        "hosting": "self-hosted",
        "strengths": ["Book/chapter structure", "WYSIWYG editor", "Simple permissions"],
        "weaknesses": ["Limited collaboration features"],
        "best_for": "Organizations needing structured documentation",
        "caribbean_fit": 5
    },
    # Farm Management
    "FarmOS": {
        "category": "Farm Management",
        "description": "Web-based farm management and record-keeping",
        "complexity": "medium",
        "cost": "free",
        "hosting": "self-hosted",
        "strengths": ["Field mapping", "Plant/animal records", "Logging", "Open data"],
        "weaknesses": ["Requires tech comfort", "Setup learning curve"],
        "best_for": "Farms of any size needing digital records",
        "caribbean_fit": 5
    },
    # AI/ML
    "Ollama": {
        "category": "AI/ML",
        "description": "Run large language models locally",
        "complexity": "medium",
        "cost": "free",
        "hosting": "self-hosted",
        "strengths": ["Local LLM", "Privacy", "Multiple models", "API-compatible"],
        "weaknesses": ["Requires GPU for large models", "Resource intensive"],
        "best_for": "Teams wanting private AI without cloud costs",
        "caribbean_fit": 4
    },
    "Open WebUI": {
        "category": "AI/ML",
        "description": "ChatGPT-like interface for Ollama and other LLMs",
        "complexity": "low",
        "cost": "free",
        "hosting": "self-hosted",
        "strengths": ["Beautiful UI", "Multi-model", "RAG support", "User management"],
        "weaknesses": ["Requires LLM backend"],
        "best_for": "Teams wanting private AI chat",
        "caribbean_fit": 5
    },
    "Flowise": {
        "category": "AI/ML",
        "description": "No-code AI agent builder with LangChain",
        "complexity": "low",
        "cost": "free",
        "hosting": "self-hosted",
        "strengths": ["Visual builder", "Chatflows", "Agents", "Document QA"],
        "weaknesses": ["Limited custom logic"],
        "best_for": "Building AI chatbots without coding",
        "caribbean_fit": 5
    }
}


def find_solutions(need: str, field: str = None, budget: str = "free") -> dict:
    """Find open source solutions matching a business need."""
    need_lower = need.lower()
    results = []

    for name, tool in TOOLS_DB.items():
        score = 0
        # Match by category
        if tool["category"].lower() in need_lower:
            score += 3
        # Match by description
        for word in need_lower.split():
            if word in tool["description"].lower():
                score += 1
            if word in tool["best_for"].lower():
                score += 2
        # Match by strengths
        for strength in tool["strengths"]:
            for word in need_lower.split():
                if word in strength.lower():
                    score += 1
        # Budget filter
        if budget == "free" and tool["cost"] not in ["free", "free (hosting costs)", "free (cloud available)", "free (Enterprise available)"]:
            continue
        # Field relevance
        if field:
            field_lower = field.lower()
            if field_lower in tool["best_for"].lower():
                score += 2
            if any(word in tool["category"].lower() for word in field_lower.split()):
                score += 1
        # Caribbean fit bonus
        score += tool["caribbean_fit"] * 0.5

        if score > 2:
            results.append({
                "name": name,
                "score": score,
                **tool
            })

    # Sort by score
    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "need": need,
        "field": field,
        "budget": budget,
        "matches": results[:5],
        "total_found": len(results)
    }


def compare_tools(tool_names: str) -> dict:
    """Compare multiple tools side by side."""
    names = [n.strip() for n in tool_names.split(",")]
    comparison = []
    for name in names:
        found = None
        for db_name, tool in TOOLS_DB.items():
            if db_name.lower() == name.lower():
                found = {"name": db_name, **tool}
                break
        if found:
            comparison.append(found)
        else:
            comparison.append({"name": name, "error": "Not found in database"})

    return {"comparison": comparison}


def main():
    parser = argparse.ArgumentParser(description="IBT Solutions Finder Tool")
    subparsers = parser.add_subparsers(dest="command")

    # Find command
    find_parser = subparsers.add_parser("find", help="Find solutions for a need")
    find_parser.add_argument("--need", required=True, help="Business need to solve")
    find_parser.add_argument("--field", help="Business field/industry")
    find_parser.add_argument("--budget", choices=["free", "low", "any"], default="free")

    # Compare command
    compare_parser = subparsers.add_parser("compare", help="Compare tools")
    compare_parser.add_argument("--options", required=True, help="Comma-separated tool names")

    # List command
    list_parser = subparsers.add_parser("list", help="List available tools")
    list_parser.add_argument("--category", help="Filter by category")

    args = parser.parse_args()

    if args.command == "find":
        result = find_solutions(args.need, args.field, args.budget)
        print(json.dumps(result, indent=2))
    elif args.command == "compare":
        result = compare_tools(args.options)
        print(json.dumps(result, indent=2))
    elif args.command == "list":
        tools = []
        for name, tool in TOOLS_DB.items():
            if args.category and tool["category"].lower() != args.category.lower():
                continue
            tools.append({"name": name, **tool})
        print(json.dumps({"tools": tools, "total": len(tools)}, indent=2))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
