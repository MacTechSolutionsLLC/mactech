'use client'

import Link from 'next/link'
import { useState, useCallback } from 'react'

interface Tool {
  id: string
  name: string
  category: string
  status: 'available' | 'coming-soon' | 'in-development'
  description: string
  features: string[]
  useCases: string[]
  technicalDetails: string
  integration: string
  deliverables?: {
    templates?: string[]
    modules?: string[]
    platforms?: string[]
    programs?: string[]
  }
}

const tools: Tool[] = [
  {
    id: 'stig-generator',
    name: 'STIG Generator',
    category: 'Automation & Compliance',
    status: 'available',
    description: 'Automated generation of Ansible hardening playbooks, checker playbooks, and Certification Test Procedure (CTP) documents from DISA STIG XCCDF XML files.',
    features: [
      'Parses XCCDF XML STIG files from public.cyber.mil',
      'Generates production-ready Ansible playbooks',
      'Creates standardized CTP documents for manual controls',
      'Supports RHEL 8/9, Windows 11/2022, and Cisco IOS STIGs',
      'Classifies controls as automatable vs manual',
      'Extracts NIST 800-53 control mappings'
    ],
    useCases: [
      'Accelerate STIG compliance implementation',
      'Generate consistent automation artifacts across environments',
      'Reduce manual documentation effort for CTP development',
      'Standardize STIG remediation processes'
    ],
    technicalDetails: 'Python CLI application with extensible architecture. Generates idempotent Ansible playbooks with proper tagging, structured CTP CSV documents, and validates command extraction for production readiness.',
    integration: 'Integrates with existing Ansible workflows, supports CI/CD pipelines, and generates artifacts compatible with DoD test management systems.',
    deliverables: {
      modules: ['Ansible hardening playbook generator', 'Ansible checker playbook generator', 'CTP document generator'],
      templates: ['STIG parsing templates', 'Ansible playbook templates', 'CTP CSV templates']
    }
  },
  {
    id: 'rmf-artifact-generator',
    name: 'RMF Artifact Generator',
    category: 'Automation & Compliance',
    status: 'in-development',
    description: 'Automated generation of RMF Step 1-6 documentation including System Security Plans (SSP), Risk Assessment Reports (RAR), POA&Ms, and Continuous Monitoring Strategies from system inventories and templates.',
    features: [
      'Generates complete SSPs from system architecture inputs',
      'Automates RAR development with risk scoring',
      'Creates POA&Ms with remediation timelines',
      'Produces ConMon strategies aligned with NIST 800-53',
      'Validates control implementations against evidence',
      'Exports to standard DoD formats (Word, PDF)'
    ],
    useCases: [
      'Reduce ATO package development time from months to weeks',
      'Ensure consistency across multiple system authorizations',
      'Automate updates for system changes and re-authorizations',
      'Standardize documentation across program portfolios'
    ],
    technicalDetails: 'Template-driven system with intelligent control mapping. Uses system inventory data, network diagrams, and security control evidence to generate compliant documentation following DoD RMF guidance.',
    integration: 'Integrates with eMASS, Xacta, and other RMF management platforms. Accepts inputs from infrastructure-as-code, vulnerability scanners, and compliance tools.',
    deliverables: {
      templates: ['SSP templates', 'RAR templates', 'POA&M templates', 'ConMon strategy templates'],
      modules: ['SSP generator module', 'RAR generator module', 'POA&M generator module', 'Control mapping module']
    }
  },
  {
    id: 'control-validator',
    name: 'Control Implementation Validator',
    category: 'Automation & Compliance',
    status: 'in-development',
    description: 'Automated validation tool that assesses NIST 800-53 control implementations against evidence artifacts, identifying gaps before Security Control Assessments (SCA).',
    features: [
      'Validates control implementations against NIST 800-53 requirements',
      'Identifies missing or insufficient evidence artifacts',
      'Scores control implementation maturity',
      'Generates gap analysis reports with remediation guidance',
      'Tracks evidence collection progress',
      'Pre-validates controls before SCA events'
    ],
    useCases: [
      'Prepare for Security Control Assessments with confidence',
      'Identify compliance gaps early in the authorization process',
      'Maintain continuous compliance posture',
      'Reduce SCA findings through proactive validation'
    ],
    technicalDetails: 'Rule-based validation engine that analyzes evidence artifacts (configurations, logs, documentation) against NIST control requirements. Uses machine learning for pattern recognition in evidence quality assessment.',
    integration: 'Integrates with eMASS, Xacta, document management systems, and evidence collection tools. Exports validation results to RMF platforms.'
  },
  {
    id: 'infrastructure-scanner',
    name: 'Infrastructure Compliance Scanner',
    category: 'Automation & Compliance',
    status: 'in-development',
    description: 'Pre-deployment compliance scanning for Infrastructure-as-Code (Terraform, Ansible, CloudFormation) that identifies STIG, NIST, and DoD policy violations before infrastructure is provisioned.',
    features: [
      'Scans Terraform, Ansible, and CloudFormation configurations',
      'Validates against STIG, NIST 800-53, and DoD Cloud SRG requirements',
      'Identifies security misconfigurations pre-deployment',
      'Provides remediation guidance with code fixes',
      'Integrates with CI/CD pipelines',
      'Generates compliance reports for authorization packages'
    ],
    useCases: [
      'Catch compliance issues before infrastructure deployment',
      'Accelerate cloud migration authorization processes',
      'Maintain compliance in DevOps workflows',
      'Reduce rework and security findings'
    ],
    technicalDetails: 'Static analysis engine that parses IaC configurations and validates against policy rule sets. Supports custom rule development for organization-specific requirements.',
    integration: 'CI/CD pipeline integration (GitHub Actions, GitLab CI, Jenkins), Terraform Cloud, AWS Config, Azure Policy, and compliance management platforms.',
    deliverables: {
      modules: ['Terraform scanner module', 'Ansible scanner module', 'CloudFormation scanner module', 'Policy rule engine module']
    }
  },
  {
    id: 'network-config-generator',
    name: 'Network Security Configuration Generator',
    category: 'Automation & Compliance',
    status: 'coming-soon',
    description: 'Automated generation of compliant network security configurations including firewall rules, ACLs, and routing policies aligned with DoD network security requirements.',
    features: [
      'Generates firewall rule sets from network architecture',
      'Creates ACL configurations for routers and switches',
      'Validates configurations against DISA Network STIGs',
      'Produces network security documentation',
      'Supports Cisco, Juniper, and other major vendors',
      'Exports to vendor-specific configuration formats'
    ],
    useCases: [
      'Accelerate network security configuration development',
      'Ensure network designs meet DoD security requirements',
      'Standardize network security across environments',
      'Reduce manual configuration errors'
    ],
    technicalDetails: 'Network topology analyzer that generates security configurations based on network diagrams, security zones, and DoD network security requirements. Validates against DISA Network STIGs and SRGs.',
    integration: 'Integrates with network management platforms, configuration management tools, and network documentation systems.'
  },
  {
    id: 'ato-dashboard',
    name: 'ATO Readiness Dashboard',
    category: 'Assessment & Readiness',
    status: 'in-development',
    description: 'Web-based dashboard providing real-time visibility into RMF step completion, artifact status, and authorization readiness metrics for program offices and ISSOs.',
    features: [
      'Real-time RMF step completion tracking',
      'Artifact status monitoring and alerts',
      'Readiness scoring and gap identification',
      'Timeline visualization for authorization milestones',
      'Collaborative workspace for authorization teams',
      'Exportable readiness reports for leadership'
    ],
    useCases: [
      'Provide visibility to program offices on authorization progress',
      'Identify bottlenecks in the authorization process',
      'Support ISSO workload management',
      'Enable data-driven authorization planning'
    ],
    technicalDetails: 'React-based web application with real-time updates. Integrates with RMF management platforms and document repositories to automatically track progress.',
    integration: 'Integrates with eMASS, Xacta, SharePoint, document management systems, and ticketing platforms. Provides REST API for custom integrations.',
    deliverables: {
      platforms: ['ATO Readiness Dashboard platform'],
      modules: ['RMF tracking module', 'Readiness scoring module', 'Reporting module']
    }
  },
  {
    id: 'conmon-platform',
    name: 'Continuous Monitoring Automation Platform',
    category: 'Assessment & Readiness',
    status: 'in-development',
    description: 'Automated collection, analysis, and reporting of security control evidence for Continuous Monitoring programs, reducing manual effort and ensuring consistent evidence quality.',
    features: [
      'Automated evidence collection from multiple sources',
      'Real-time compliance status monitoring',
      'Automated evidence quality validation',
      'Scheduled compliance reporting',
      'Alert generation for control failures',
      'Integration with vulnerability scanners and SIEMs'
    ],
    useCases: [
      'Reduce manual effort in Continuous Monitoring programs',
      'Maintain real-time compliance visibility',
      'Automate evidence collection and validation',
      'Support ongoing authorization maintenance'
    ],
    technicalDetails: 'Agent-based and agentless collection architecture. Uses scheduled jobs, API integrations, and log parsing to collect evidence. Includes evidence validation rules and automated reporting.',
    integration: 'Integrates with vulnerability scanners (Nessus, Qualys), SIEMs (Splunk, ELK), configuration management tools, and RMF platforms. Supports custom data source connectors.',
    deliverables: {
      platforms: ['Continuous Monitoring Automation Platform'],
      modules: ['Evidence collection module', 'Validation module', 'Reporting module', 'Connector modules']
    }
  },
  {
    id: 'sca-toolkit',
    name: 'SCA Preparation Toolkit',
    category: 'Assessment & Readiness',
    status: 'in-development',
    description: 'Comprehensive toolkit for Security Control Assessment preparation including automated evidence collection, control mapping, gap analysis, and assessment readiness scoring.',
    features: [
      'Automated evidence collection and organization',
      'Control-to-evidence mapping validation',
      'Gap analysis with remediation recommendations',
      'Assessment readiness scoring',
      'SCA team collaboration workspace',
      'Pre-assessment checklist and validation'
    ],
    useCases: [
      'Prepare thoroughly for Security Control Assessments',
      'Reduce pre-assessment preparation time',
      'Identify and remediate gaps before assessment',
      'Ensure complete evidence packages'
    ],
    technicalDetails: 'Evidence collection automation combined with validation workflows. Uses control requirement analysis to identify evidence gaps and provides structured preparation guidance.',
    integration: 'Integrates with RMF platforms, document management systems, evidence collection tools, and assessment management platforms.',
    deliverables: {
      modules: ['Evidence collection module', 'Control mapping module', 'Gap analysis module', 'Readiness scoring module']
    }
  },
  {
    id: 'process-doc-generator',
    name: 'Process Documentation Generator',
    category: 'Automation & Compliance',
    status: 'coming-soon',
    description: 'Automated generation of ISO-compliant process documentation including procedures, work instructions, and quality management system documentation from templates and workflow inputs.',
    features: [
      'Generates ISO 9001 and ISO 17025 compliant documentation',
      'Creates procedures and work instructions from templates',
      'Validates documentation against ISO requirements',
      'Maintains document version control',
      'Supports document review and approval workflows',
      'Exports to standard formats (Word, PDF)'
    ],
    useCases: [
      'Accelerate ISO certification preparation',
      'Standardize process documentation across organizations',
      'Maintain documentation currency',
      'Support laboratory accreditation efforts'
    ],
    technicalDetails: 'Template-driven documentation system with ISO requirement mapping. Uses workflow inputs and organizational data to generate compliant documentation with proper structure and formatting.',
    integration: 'Integrates with document management systems, quality management platforms, and ISO certification management tools.',
    deliverables: {
      templates: ['ISO 9001 procedure templates', 'ISO 17025 procedure templates', 'Work instruction templates', 'Quality manual templates'],
      modules: ['Document generator module', 'ISO requirement mapper module', 'Version control module']
    }
  },
  {
    id: 'audit-evidence-collector',
    name: 'Audit Evidence Collector',
    category: 'Automation & Compliance',
    status: 'coming-soon',
    description: 'Automated collection and organization of evidence artifacts for ISO, accreditation, and compliance audits, eliminating last-minute evidence gathering.',
    features: [
      'Automated evidence collection from multiple sources',
      'Evidence organization by audit requirement',
      'Evidence quality validation and completeness checking',
      'Audit readiness scoring',
      'Evidence package generation',
      'Audit timeline tracking and reminders'
    ],
    useCases: [
      'Eliminate last-minute audit evidence scrambling',
      'Maintain ongoing audit readiness',
      'Standardize evidence collection processes',
      'Support multiple audit types (ISO, accreditation, compliance)'
    ],
    technicalDetails: 'Scheduled evidence collection system with requirement mapping. Organizes evidence by audit standard requirements and validates completeness before audit events.',
    integration: 'Integrates with document management systems, quality management platforms, ticketing systems, and audit management tools.'
  },
  {
    id: 'compliant-templates',
    name: 'Compliant Infrastructure Templates',
    category: 'Infrastructure & Engineering',
    status: 'in-development',
    description: 'Pre-built, STIG-compliant infrastructure templates for Terraform and Ansible covering common DoD architectures including web applications, databases, and cloud environments.',
    features: [
      'Pre-configured STIG-compliant infrastructure templates',
      'Terraform and Ansible module libraries',
      'Templates for common DoD architectures',
      'Cloud provider support (AWS, Azure, GCP)',
      'Documentation and deployment guides',
      'Regular updates for STIG revisions'
    ],
    useCases: [
      'Accelerate compliant infrastructure deployment',
      'Reduce infrastructure design time',
      'Ensure compliance from initial deployment',
      'Standardize infrastructure across programs'
    ],
    technicalDetails: 'Infrastructure-as-Code templates with embedded STIG compliance. Includes Terraform modules, Ansible playbooks, and deployment documentation. Validated against current STIG versions.',
    integration: 'Compatible with Terraform Cloud, Ansible Automation Platform, cloud provider IaC services, and CI/CD pipelines.',
    deliverables: {
      templates: ['Web application stack templates', 'Database infrastructure templates', 'Cloud environment templates', 'Network security templates'],
      modules: ['Terraform STIG compliance modules', 'Ansible hardening modules', 'Cloud provider modules (AWS, Azure, GCP)']
    }
  },
  {
    id: 'rmf-workflow-platform',
    name: 'RMF Workflow Automation Platform',
    category: 'Infrastructure & Engineering',
    status: 'coming-soon',
    description: 'End-to-end platform managing the complete RMF lifecycle (Steps 1-6) with automated workflows, artifact generation, progress tracking, and collaboration tools.',
    features: [
      'Complete RMF Step 1-6 workflow management',
      'Automated artifact generation and tracking',
      'Collaborative workspace for authorization teams',
      'Integration with RMF management platforms',
      'Real-time progress tracking and reporting',
      'Customizable workflows for organization needs'
    ],
    useCases: [
      'Streamline entire RMF authorization process',
      'Reduce manual coordination and tracking',
      'Ensure consistent RMF implementation',
      'Support multiple concurrent authorizations'
    ],
    technicalDetails: 'Comprehensive workflow automation platform integrating artifact generation, progress tracking, and team collaboration. Includes integrations with major RMF management platforms and custom workflow capabilities.',
    integration: 'Integrates with eMASS, Xacta, document management systems, ticketing platforms, and other RMF tools. Provides API for custom integrations.',
    deliverables: {
      platforms: ['RMF workflow automation platform', 'Collaborative authorization workspace'],
      modules: ['Workflow engine module', 'Artifact tracking module', 'Integration adapter modules'],
      templates: ['RMF workflow templates', 'Authorization process templates']
    }
  },
  {
    id: 'contract-risk-analyzer',
    name: 'Contract Risk Analyzer',
    category: 'Automation & Compliance',
    status: 'coming-soon',
    description: 'Automated analysis tool that identifies contractual risks and alignment gaps in scopes of work, vendor agreements, and delivery models for regulated programs.',
    features: [
      'Analyzes contracts for cyber and compliance obligation alignment',
      'Identifies risk areas in scopes of work and delivery models',
      'Maps contractual requirements to technical deliverables',
      'Flags vendor and subcontractor agreement misalignments',
      'Generates risk mitigation recommendations',
      'Provides governance and signature authority clarity'
    ],
    useCases: [
      'Reduce contractual risk before program execution',
      'Ensure contracts align with technical capabilities',
      'Identify vendor agreement gaps early',
      'Support risk-aware project planning'
    ],
    technicalDetails: 'AI-powered contract analysis system that parses contract language and identifies risk patterns. Maps contractual obligations to technical deliverables and compliance requirements.',
    integration: 'Integrates with contract management systems, project management platforms, and compliance tools. Exports risk analysis reports for stakeholder review.'
  },
  {
    id: 'iso-compliance-tracker',
    name: 'ISO Compliance Tracker',
    category: 'Assessment & Readiness',
    status: 'in-development',
    description: 'Automated tracking and monitoring of ISO 9001 and ISO 17025 compliance status across organizational processes, identifying gaps and generating compliance reports for audits.',
    features: [
      'Tracks compliance status against ISO 9001 and ISO 17025 requirements',
      'Identifies gaps and non-conformances in real-time',
      'Generates compliance reports for internal and external audits',
      'Tracks corrective actions and improvement initiatives',
      'Monitors process compliance across departments',
      'Provides compliance dashboards and metrics'
    ],
    useCases: [
      'Maintain ongoing ISO compliance visibility',
      'Prepare for ISO certification audits',
      'Track corrective action effectiveness',
      'Support laboratory accreditation efforts'
    ],
    technicalDetails: 'Rule-based compliance tracking system that maps organizational processes to ISO requirements. Uses automated data collection and validation to assess compliance status continuously.',
    integration: 'Integrates with quality management systems, document management platforms, ticketing systems, and audit management tools. Exports compliance data to ISO certification platforms.'
  },
  {
    id: 'quality-management-builder',
    name: 'Quality Management System Builder',
    category: 'Automation & Compliance',
    status: 'in-development',
    description: 'Interactive tool for building complete Quality Management Systems (QMS) aligned with ISO 9001 and ISO 17025 requirements, generating procedures, work instructions, and quality manuals.',
    features: [
      'Interactive QMS builder with ISO requirement mapping',
      'Generates procedures and work instructions from templates',
      'Creates quality manuals and policy documents',
      'Validates QMS structure against ISO requirements',
      'Supports document control and review workflows',
      'Exports QMS documentation in standard formats'
    ],
    useCases: [
      'Build QMS from scratch for ISO certification',
      'Standardize quality processes across organizations',
      'Accelerate ISO 9001 or ISO 17025 implementation',
      'Maintain QMS documentation currency'
    ],
    technicalDetails: 'Template-driven QMS builder with intelligent requirement mapping. Uses organizational inputs and process data to generate compliant quality management system documentation with proper structure and formatting.',
    integration: 'Integrates with document management systems, quality management platforms, and ISO certification management tools. Supports export to Word, PDF, and QMS software formats.',
    deliverables: {
      platforms: ['QMS builder platform'],
      templates: ['QMS structure templates', 'Procedure templates', 'Work instruction templates', 'Quality manual templates'],
      modules: ['QMS builder engine', 'ISO requirement mapper', 'Document generator module']
    }
  },
  {
    id: 'audit-readiness-scorecard',
    name: 'Audit Readiness Scorecard',
    category: 'Assessment & Readiness',
    status: 'in-development',
    description: 'Automated scoring and assessment of audit readiness across ISO, accreditation, and compliance audits, identifying high-risk areas and generating readiness reports for leadership.',
    features: [
      'Automated audit readiness scoring across multiple standards',
      'Tracks evidence completeness by audit requirement',
      'Identifies high-risk areas before audit events',
      'Generates readiness reports for leadership',
      'Provides gap analysis with remediation priorities',
      'Tracks readiness trends over time'
    ],
    useCases: [
      'Assess readiness before external audits',
      'Identify and prioritize audit preparation gaps',
      'Provide leadership visibility into audit readiness',
      'Support proactive audit preparation'
    ],
    technicalDetails: 'Scoring engine that analyzes evidence completeness, process maturity, and compliance status against audit requirements. Uses weighted scoring algorithms to calculate readiness scores and identify risk areas.',
    integration: 'Integrates with document management systems, quality management platforms, evidence collection tools, and audit management systems. Exports readiness reports to executive dashboards.'
  },
  {
    id: 'infrastructure-performance-optimizer',
    name: 'Infrastructure Performance Optimizer',
    category: 'Infrastructure & Engineering',
    status: 'in-development',
    description: 'Automated analysis and optimization of infrastructure performance metrics, identifying bottlenecks, capacity issues, and optimization opportunities across data center and cloud environments.',
    features: [
      'Analyzes infrastructure performance metrics in real-time',
      'Identifies performance bottlenecks and optimization opportunities',
      'Provides capacity planning recommendations',
      'Generates performance reports for stakeholders',
      'Tracks performance trends and anomalies',
      'Recommends infrastructure improvements'
    ],
    useCases: [
      'Optimize infrastructure performance and efficiency',
      'Identify capacity planning needs',
      'Troubleshoot performance issues',
      'Support infrastructure modernization decisions'
    ],
    technicalDetails: 'Performance monitoring and analysis system that collects metrics from infrastructure components. Uses machine learning to identify patterns, predict capacity needs, and recommend optimizations.',
    integration: 'Integrates with monitoring tools (Prometheus, Grafana, CloudWatch), infrastructure management platforms, and capacity planning systems. Exports performance data to reporting dashboards.'
  },
  {
    id: 'disaster-recovery-planner',
    name: 'Disaster Recovery Planner',
    category: 'Infrastructure & Engineering',
    status: 'in-development',
    description: 'Automated generation of disaster recovery plans from infrastructure inventory, mapping dependencies, recovery priorities, and creating RTO/RPO-aligned recovery procedures.',
    features: [
      'Generates disaster recovery plans from infrastructure inventory',
      'Maps system dependencies and recovery priorities',
      'Creates RTO/RPO-aligned recovery procedures',
      'Validates against business continuity requirements',
      'Generates recovery runbooks and procedures',
      'Tracks recovery testing and validation'
    ],
    useCases: [
      'Develop comprehensive disaster recovery plans',
      'Ensure DR plans align with business requirements',
      'Maintain DR plan currency as infrastructure changes',
      'Support business continuity planning'
    ],
    technicalDetails: 'DR plan generator that analyzes infrastructure topology, dependencies, and business requirements to create recovery procedures. Maps recovery time objectives (RTO) and recovery point objectives (RPO) to technical recovery steps.',
    integration: 'Integrates with infrastructure management platforms, configuration management databases (CMDB), business continuity tools, and documentation systems. Exports DR plans to standard formats.'
  },
  {
    id: 'infrastructure-cost-optimizer',
    name: 'Infrastructure Cost Optimizer',
    category: 'Infrastructure & Engineering',
    status: 'in-development',
    description: 'Automated analysis of infrastructure costs across on-premises and cloud environments, identifying optimization opportunities, cost trends, and providing cloud migration cost projections.',
    features: [
      'Analyzes infrastructure costs across environments',
      'Identifies cost optimization opportunities',
      'Provides cloud migration cost projections',
      'Generates cost-benefit analysis reports',
      'Tracks cost trends and anomalies',
      'Recommends cost-saving strategies'
    ],
    useCases: [
      'Optimize infrastructure costs and spending',
      'Evaluate cloud migration economics',
      'Identify cost-saving opportunities',
      'Support infrastructure investment decisions'
    ],
    technicalDetails: 'Cost analysis engine that aggregates cost data from multiple sources (cloud providers, on-premises systems, vendor invoices). Uses cost modeling and optimization algorithms to identify savings opportunities.',
    integration: 'Integrates with cloud provider billing APIs (AWS Cost Explorer, Azure Cost Management), financial systems, and infrastructure management platforms. Exports cost analysis to financial reporting tools.'
  },
  {
    id: 'vendor-risk-assessor',
    name: 'Vendor Risk Assessment Tool',
    category: 'Automation & Compliance',
    status: 'in-development',
    description: 'Automated assessment of vendor and subcontractor risk profiles, evaluating contract compliance, performance, and identifying risk areas in vendor relationships for regulated programs.',
    features: [
      'Assesses vendor and subcontractor risk profiles',
      'Evaluates contract compliance and performance',
      'Identifies risk areas in vendor relationships',
      'Generates risk mitigation recommendations',
      'Tracks vendor performance over time',
      'Provides vendor risk scoring and categorization'
    ],
    useCases: [
      'Assess vendor risk before contract execution',
      'Monitor ongoing vendor compliance and performance',
      'Identify and mitigate vendor-related risks',
      'Support vendor management decisions'
    ],
    technicalDetails: 'Risk assessment engine that analyzes vendor contracts, performance data, and compliance information. Uses risk scoring algorithms to evaluate vendor risk and generate mitigation recommendations.',
    integration: 'Integrates with vendor management systems, contract management platforms, performance monitoring tools, and risk management systems. Exports risk assessments to procurement and compliance platforms.'
  },
  {
    id: 'governance-structure-builder',
    name: 'Governance Structure Builder',
    category: 'Automation & Compliance',
    status: 'in-development',
    description: 'Interactive tool for designing governance frameworks for complex programs, mapping decision-making authority, approval workflows, and identifying governance gaps and conflicts.',
    features: [
      'Helps design governance frameworks for complex programs',
      'Maps decision-making authority and approval workflows',
      'Identifies governance gaps and conflicts',
      'Generates governance documentation',
      'Validates governance structure completeness',
      'Supports role and responsibility mapping'
    ],
    useCases: [
      'Design governance structures for new programs',
      'Improve governance clarity in existing programs',
      'Identify and resolve governance conflicts',
      'Support program management and decision-making'
    ],
    technicalDetails: 'Governance modeling tool that uses organizational structure and program requirements to design governance frameworks. Maps roles, responsibilities, decision rights, and approval workflows.',
    integration: 'Integrates with project management platforms, organizational charting tools, and documentation systems. Exports governance documentation to program management and collaboration platforms.'
  },
  {
    id: 'contract-obligation-tracker',
    name: 'Contract Obligation Tracker',
    category: 'Automation & Compliance',
    status: 'in-development',
    description: 'Automated tracking of contractual obligations across multiple contracts, mapping obligations to deliverables and milestones, with alerts for upcoming obligations and deadlines.',
    features: [
      'Tracks contractual obligations across contracts',
      'Maps obligations to deliverables and milestones',
      'Alerts on upcoming obligations and deadlines',
      'Generates obligation compliance reports',
      'Tracks obligation fulfillment status',
      'Identifies obligation conflicts and dependencies'
    ],
    useCases: [
      'Track and manage contractual obligations',
      'Ensure timely fulfillment of contract requirements',
      'Identify obligation conflicts and gaps',
      'Support contract compliance monitoring'
    ],
    technicalDetails: 'Obligation tracking system that parses contracts to extract obligations and maps them to deliverables. Uses calendar and milestone tracking to alert on upcoming obligations and deadlines.',
    integration: 'Integrates with contract management systems, project management platforms, and compliance tools. Exports obligation tracking data to reporting and dashboard systems.'
  }
]

const categories = [
  'Automation & Compliance',
  'Assessment & Readiness',
  'Infrastructure & Engineering'
]

const statusLabels = {
  'available': 'Available Now',
  'in-development': 'In Development',
  'coming-soon': 'Coming Soon'
}

const statusColors = {
  'available': 'bg-green-100 text-green-800 border-green-200',
  'in-development': 'bg-blue-100 text-blue-800 border-blue-200',
  'coming-soon': 'bg-neutral-100 text-neutral-800 border-neutral-200'
}

export default function ShowcasePage() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<string>(categories[0])

  const toggleItem = useCallback((id: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    setExpandedItems(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(id)) {
        newExpanded.delete(id)
      } else {
        newExpanded.add(id)
      }
      return newExpanded
    })
  }, [])

  const handleTabChange = useCallback((category: string) => {
    setActiveTab(category)
    // Clear expanded items when switching tabs
    setExpandedItems(new Set())
  }, [])

  const activeTools = tools.filter(tool => tool.category === activeTab)

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-hero mb-6">Tools & Capabilities Showcase</h1>
          <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed mb-8">
            Automation tools and platforms designed to accelerate authorization, reduce manual effort, 
            and ensure compliance for federal programs and defense contractors.
          </p>
          
          {/* Programs/Platforms/Modules/Templates Introduction */}
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-6 mb-6">
            <h2 className="heading-3 mb-4 text-accent-900">What We Deliver: Programs, Platforms, Modules & Templates</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-body-sm font-semibold text-accent-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Templates
                </h3>
                <p className="text-body-sm text-neutral-700 leading-relaxed">
                  Pre-configured, compliant templates for infrastructure, documentation, and processes. 
                  Ready-to-use starting points that accelerate deployment and ensure consistency.
                </p>
              </div>
              <div>
                <h3 className="text-body-sm font-semibold text-accent-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Modules
                </h3>
                <p className="text-body-sm text-neutral-700 leading-relaxed">
                  Reusable, composable modules that provide specific functionality. 
                  Integrate into your workflows to add automation, validation, or generation capabilities.
                </p>
              </div>
              <div>
                <h3 className="text-body-sm font-semibold text-accent-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  Platforms
                </h3>
                <p className="text-body-sm text-neutral-700 leading-relaxed">
                  Comprehensive platforms that manage entire workflows and processes. 
                  End-to-end solutions with integrated capabilities, collaboration, and automation.
                </p>
              </div>
              <div>
                <h3 className="text-body-sm font-semibold text-accent-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Programs
                </h3>
                <p className="text-body-sm text-neutral-700 leading-relaxed">
                  Integrated program solutions combining multiple tools, templates, and modules. 
                  Complete capability sets designed for specific mission requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="section-container bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleTabChange(category)}
                className={`px-6 py-3 text-body-sm font-medium transition-all duration-gentle ${
                  activeTab === category
                    ? 'bg-accent-700 text-white border border-accent-700'
                    : 'bg-white text-neutral-700 border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {activeTools.map((tool, index) => {
                // Use a truly unique key combining category, tool id, and index
                const uniqueKey = `${activeTab}-${tool.id}-${index}`
                const isExpanded = expandedItems.has(uniqueKey)
                return (
                  <div 
                    key={`${tool.id}-${index}`} 
                    className={`card border border-neutral-200 transition-all duration-gentle fade-in${index > 0 ? `-delay-${Math.min(index, 3)}` : ''}`}
                  >
                    {/* Header - Always visible */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleItem(uniqueKey, e)
                      }}
                      className="w-full text-left p-6 hover:bg-neutral-50 transition-colors duration-gentle"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="heading-3">{tool.name}</h3>
                            <span className={`text-body-sm font-medium px-3 py-1 rounded border flex-shrink-0 ${statusColors[tool.status]}`}>
                              {statusLabels[tool.status]}
                            </span>
                            {/* Deliverable badges */}
                            {tool.deliverables && (
                              <div className="flex gap-2 flex-wrap">
                                {tool.deliverables.templates && tool.deliverables.templates.length > 0 && (
                                  <span className="text-body-xs font-medium px-2 py-0.5 rounded bg-accent-100 text-accent-800 border border-accent-200">
                                    Templates
                                  </span>
                                )}
                                {tool.deliverables.modules && tool.deliverables.modules.length > 0 && (
                                  <span className="text-body-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                                    Modules
                                  </span>
                                )}
                                {tool.deliverables.platforms && tool.deliverables.platforms.length > 0 && (
                                  <span className="text-body-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                                    Platform
                                  </span>
                                )}
                                {tool.deliverables.programs && tool.deliverables.programs.length > 0 && (
                                  <span className="text-body-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">
                                    Program
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-body text-neutral-700 leading-relaxed">
                            {tool.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg 
                            className={`w-5 h-5 text-neutral-400 transition-transform duration-gentle ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-neutral-200 pt-6 space-y-6">
                        <div>
                          <h4 className="text-body-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide">
                            Key Features
                          </h4>
                          <ul className="space-y-2">
                            {tool.features.map((feature, idx) => (
                              <li key={idx} className="flex gap-3">
                                <div className="flex-shrink-0 mt-1.5">
                                  <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                                </div>
                                <span className="text-body-sm text-neutral-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-body-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide">
                            Use Cases
                          </h4>
                          <ul className="space-y-2">
                            {tool.useCases.map((useCase, idx) => (
                              <li key={idx} className="flex gap-3">
                                <div className="flex-shrink-0 mt-1.5">
                                  <svg className="w-4 h-4 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <span className="text-body-sm text-neutral-700">{useCase}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Deliverables Section */}
                        {tool.deliverables && (
                          <div className="pt-4 border-t border-neutral-200">
                            <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                              Included Deliverables
                            </h4>
                            <div className="space-y-4">
                              {tool.deliverables.templates && tool.deliverables.templates.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h5 className="text-body-sm font-semibold text-neutral-900">Templates</h5>
                                  </div>
                                  <ul className="space-y-1.5 ml-6">
                                    {tool.deliverables.templates.map((template, idx) => (
                                      <li key={idx} className="text-body-sm text-neutral-700 flex gap-2">
                                        <span className="text-accent-700 mt-1.5">•</span>
                                        <span>{template}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {tool.deliverables.modules && tool.deliverables.modules.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <h5 className="text-body-sm font-semibold text-neutral-900">Modules</h5>
                                  </div>
                                  <ul className="space-y-1.5 ml-6">
                                    {tool.deliverables.modules.map((module, idx) => (
                                      <li key={idx} className="text-body-sm text-neutral-700 flex gap-2">
                                        <span className="text-blue-700 mt-1.5">•</span>
                                        <span>{module}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {tool.deliverables.platforms && tool.deliverables.platforms.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                    <h5 className="text-body-sm font-semibold text-neutral-900">Platforms</h5>
                                  </div>
                                  <ul className="space-y-1.5 ml-6">
                                    {tool.deliverables.platforms.map((platform, idx) => (
                                      <li key={idx} className="text-body-sm text-neutral-700 flex gap-2">
                                        <span className="text-purple-700 mt-1.5">•</span>
                                        <span>{platform}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {tool.deliverables.programs && tool.deliverables.programs.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <h5 className="text-body-sm font-semibold text-neutral-900">Programs</h5>
                                  </div>
                                  <ul className="space-y-1.5 ml-6">
                                    {tool.deliverables.programs.map((program, idx) => (
                                      <li key={idx} className="text-body-sm text-neutral-700 flex gap-2">
                                        <span className="text-green-700 mt-1.5">•</span>
                                        <span>{program}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-neutral-200">
                          <h4 className="text-body-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide">
                            Technical Details
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-body-sm text-neutral-700 leading-relaxed">{tool.technicalDetails}</p>
                            </div>
                            <div>
                              <h5 className="text-body-sm font-semibold text-neutral-900 mb-2">Integration</h5>
                              <p className="text-body-sm text-neutral-700 leading-relaxed">{tool.integration}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

      {/* CTA Section */}
      <section className="section-container bg-accent-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-2 mb-6 text-white">
            Interested in Our Tools & Capabilities?
          </h2>
          <p className="text-body-lg mb-10 text-accent-100 max-w-2xl mx-auto leading-relaxed">
            Contact us to discuss how these tools can accelerate your authorization and compliance efforts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary bg-white text-accent-900 hover:bg-accent-50">
              Contact Us
            </Link>
            <Link href="/services" className="btn-secondary border-white text-white hover:bg-white hover:text-accent-900">
              View Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

