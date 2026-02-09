#!/bin/bash

# Monitoring Stack Setup Script
# Sets up Prometheus and Grafana for monitoring

echo "📊 Setting up monitoring stack..."

# Create monitoring directory
mkdir -p monitoring/prometheus monitoring/grafana/dashboards monitoring/grafana/datasources

# Create Prometheus configuration
cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'islandfund-api'
    static_configs:
      - targets: ['api:5001']
    metrics_path: /metrics
    scrape_interval: 5s
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
  
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

echo "✅ Monitoring configuration created"
echo ""
echo "To start monitoring:"
echo "  docker-compose -f docker-compose.monitoring.yml up -d"
