import { Workflow } from '@antigravity/core';

export const deploymentWorkflows: Workflow[] = [
  {
    name: 'full_application_deployment',
    description: 'Deploy entire IslandFund application stack',
    steps: [
      {
        name: 'health_check',
        action: 'run_system_health_check',
        description: 'Verify all systems are healthy before deployment'
      },
      {
        name: 'backup_database',
        action: 'execute_database_backup',
        description: 'Create database backup before deployment'
      },
      {
        name: 'restart_services',
        action: 'restart_application_services',
        description: 'Restart all application services in correct order'
      },
      {
        name: 'deploy_backend',
        action: 'deploy_backend_service',
        description: 'Deploy backend API service to production'
      },
      {
        name: 'deploy_frontend',
        action: 'deploy_web_application',
        description: 'Deploy Next.js web application to production'
      },
      {
        name: 'deploy_mobile',
        action: 'deploy_mobile_application',
        description: 'Deploy React Native mobile app to production'
      },
      {
        name: 'verify_deployment',
        action: 'verify_service_connectivity',
        description: 'Verify all services are communicating after deployment'
      }
    ]
  },
  {
    name: 'vendor_setup_workflow',
    description: 'Complete vendor onboarding process',
    steps: [
      {
        name: 'validate_business_documents',
        action: 'verify_vendor_kyc_documents',
        description: 'Verify business registration and KYC documents'
      },
      {
        name: 'create_payment_account',
        action: 'setup_vendor_payment_methods',
        description: 'Setup vendor payment processing accounts'
      },
      {
        name: 'configure_storefront',
        action: 'initialize_vendor_store_settings',
        description: 'Configure vendor storefront and store settings'
      },
      {
        name: 'list_test_products',
        action: 'create_sample_listings',
        description: 'Create sample product listings for new vendors'
      }
    ]
  }
];