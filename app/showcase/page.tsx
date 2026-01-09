'use client'

import Link from 'next/link'
import { useState, useCallback } from 'react'

type Pillar = 'Governance' | 'Infrastructure' | 'Quality' | 'Security'

interface Tool {
  id: string
  name: string
  category: string
  pillar: Pillar
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
    pillar: 'Security',
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
    pillar: 'Security',
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
    pillar: 'Security',
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
    pillar: 'Security',
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
    pillar: 'Security',
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
    pillar: 'Security',
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
    pillar: 'Security',
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
    pillar: 'Security',
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
    pillar: 'Quality',
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
    pillar: 'Quality',
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
    pillar: 'Infrastructure',
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
    pillar: 'Security',
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
  // Infrastructure Domain - James Adams
  {
    id: 'data-center-deployment',
    name: 'Data Center Deployment Automation',
    category: 'Infrastructure & Engineering',
    pillar: 'Infrastructure',
    status: 'available',
    description: 'Automated infrastructure provisioning templates for common DoD architectures with storage array configuration automation, VMWare host attachment, and pre-deployment STIG compliance checking.',
    features: [
      'Storage array configuration (Dell/EMC, VxRail, Unity, XtremIO)',
      'VMWare host attachment and configuration',
      'Network configuration validation',
      'Pre-deployment STIG compliance checking',
      'ML-based capacity planning',
      'Deployment template library'
    ],
    useCases: [
      'Accelerate data center infrastructure deployment',
      'Eliminate manual configuration errors',
      'Ensure compliance from initial deployment',
      'Reduce deployment time from weeks to days'
    ],
    technicalDetails: 'Automated infrastructure provisioning with built-in compliance validation. Supports multiple storage arrays, VMWare environments, and network configurations. Includes deployment templates for common DoD architectures.',
    integration: 'Integrates with VMWare vCenter, storage management APIs, network management tools, and compliance scanners. Supports Terraform and Ansible for infrastructure-as-code.',
    deliverables: {
      modules: ['Deployment automation module', 'Storage configuration module', 'Network validation module'],
      templates: ['Web application stack templates', 'Database infrastructure templates', 'Cloud environment templates']
    }
  },
  {
    id: 'infrastructure-health-monitoring',
    name: 'Infrastructure Health Monitoring & Predictive Analytics',
    category: 'Infrastructure & Engineering',
    pillar: 'Infrastructure',
    status: 'available',
    description: 'Real-time infrastructure health dashboards with predictive failure analysis, automated ticket generation, and ML-based anomaly detection.',
    features: [
      'Predictive failure analysis using ML',
      'Real-time health dashboards',
      'Automated ticket generation for proactive maintenance',
      'Anomaly detection and alerting',
      'Automated root cause analysis',
      'Integration with NinjaOne, EPS, ITGlue, WFM'
    ],
    useCases: [
      'Prevent critical infrastructure failures',
      'Reduce unplanned downtime',
      'Optimize maintenance scheduling',
      'Improve infrastructure reliability'
    ],
    technicalDetails: 'ML-powered monitoring platform that predicts failures before they occur. Integrates with major infrastructure management tools and provides automated remediation workflows.',
    integration: 'Integrates with NinjaOne, EPS, ITGlue, WFM, Prometheus, Grafana, and cloud monitoring services. Provides REST API for custom integrations.',
    deliverables: {
      platforms: ['Health Monitoring Platform'],
      modules: ['Predictive analytics module', 'Alerting module', 'Integration adapter modules']
    }
  },
  {
    id: 'network-config-automation',
    name: 'Network Configuration Automation',
    category: 'Infrastructure & Engineering',
    pillar: 'Infrastructure',
    status: 'available',
    description: 'Automated network topology generation, firewall rule generation, and network compliance checking aligned with DISA Network STIGs.',
    features: [
      'Network topology generation from requirements',
      'Firewall rule generation and validation',
      'DISA Network STIG compliance checking',
      'Security zone configuration',
      'Network performance optimization',
      'Configuration export to vendor formats'
    ],
    useCases: [
      'Accelerate network security configuration development',
      'Ensure network designs meet DoD security requirements',
      'Standardize network security across environments',
      'Reduce manual configuration errors'
    ],
    technicalDetails: 'Network topology analyzer that generates security configurations based on network diagrams, security zones, and DoD network security requirements. Validates against DISA Network STIGs.',
    integration: 'Integrates with network management platforms, firewall management tools, and network documentation systems. Supports Cisco, Juniper, and other major vendors.',
    deliverables: {
      modules: ['Topology generator module', 'Firewall rule engine', 'STIG compliance checker'],
      templates: ['Network security templates', 'Firewall rule templates']
    }
  },
  // Quality Assurance Domain - Brian MacDonald
  {
    id: 'iso-compliance-platform',
    name: 'ISO 17025/9001 Compliance Automation',
    category: 'Quality Assurance',
    pillar: 'Quality',
    status: 'available',
    description: 'Automated ISO compliance program management with gap analysis, audit readiness scoring, and SOP generation aligned with ISO 17025 and ISO 9001 requirements.',
    features: [
      'ISO 17025 and ISO 9001 compliance tracking',
      'Automated gap identification and analysis',
      'Audit readiness scoring and recommendations',
      'SOP generation from requirements',
      'Management review automation',
      'Corrective action tracking'
    ],
    useCases: [
      'Maintain ongoing ISO compliance visibility',
      'Prepare for ISO certification audits',
      'Accelerate ISO implementation',
      'Support laboratory accreditation efforts'
    ],
    technicalDetails: 'Comprehensive ISO compliance platform that tracks requirements, identifies gaps, and generates audit-ready documentation. Includes automated SOP generation and management review workflows.',
    integration: 'Integrates with quality management systems, document management platforms, and ISO certification management tools. Exports compliance data to audit platforms.',
    deliverables: {
      platforms: ['ISO Compliance Platform'],
      modules: ['Gap analysis module', 'Audit readiness module', 'SOP generator module'],
      templates: ['ISO procedure templates', 'Quality manual templates']
    }
  },
  {
    id: 'sop-automation-module',
    name: 'SOP Development & Technical Writing Automation',
    category: 'Quality Assurance',
    pillar: 'Quality',
    status: 'available',
    description: 'Automated SOP generation from templates with consistency checking, version control, and review workflows aligned with ISO requirements.',
    features: [
      'Automated SOP generation from requirements',
      'SOP consistency checking and validation',
      'Version control and change management',
      'Review and approval workflows',
      'Multi-format export (Word, PDF, HTML)',
      'ISO requirement mapping'
    ],
    useCases: [
      'Accelerate SOP development and maintenance',
      'Ensure consistency across all SOPs',
      'Maintain version control and change history',
      'Streamline review and approval processes'
    ],
    technicalDetails: 'Template-driven SOP generation system with intelligent requirement mapping. Uses organizational inputs to generate compliant documentation with proper structure and formatting.',
    integration: 'Integrates with document management systems, quality management platforms, and ISO certification tools. Supports export to Word, PDF, and QMS software formats.',
    deliverables: {
      modules: ['SOP generator module', 'Version control module', 'Review workflow module'],
      templates: ['SOP templates', 'Work instruction templates', 'Procedure templates']
    }
  },
  {
    id: 'metrology-management',
    name: 'Laboratory & Metrology Management',
    category: 'Quality Assurance',
    pillar: 'Quality',
    status: 'available',
    description: 'Metrology project tracking for 5,000+ projects with calibration schedule automation, measurement uncertainty analysis, and traceability chain documentation.',
    features: [
      'Metrology project tracking and management',
      'Calibration schedule automation',
      'Equipment lifecycle management',
      'Measurement uncertainty analysis (GUM)',
      'Traceability chain documentation',
      'Equipment certification tracking'
    ],
    useCases: [
      'Manage large-scale metrology programs',
      'Automate calibration scheduling',
      'Maintain measurement traceability',
      'Support laboratory accreditation'
    ],
    technicalDetails: 'Comprehensive metrology management platform that automates calibration scheduling, tracks equipment lifecycle, and maintains traceability chains. Includes uncertainty calculation following GUM methodology.',
    integration: 'Integrates with laboratory information systems, calibration management tools, and quality management platforms. Exports data to accreditation systems.',
    deliverables: {
      platforms: ['Metrology Management Platform'],
      modules: ['Calibration scheduler module', 'Uncertainty calculator module', 'Traceability tracker module']
    }
  },
  {
    id: 'audit-readiness-platform',
    name: 'Regulatory Audit Readiness & Documentation',
    category: 'Quality Assurance',
    pillar: 'Quality',
    status: 'available',
    description: 'Automated audit evidence collection with readiness scoring across DLA, ISO, FDA standards. Includes pre-audit gap analysis and automated audit response generation.',
    features: [
      'Automated audit evidence collection',
      'Audit readiness scoring (DLA, ISO, FDA)',
      'Pre-audit gap analysis',
      'Automated audit response generation',
      'Evidence package generation',
      'CAPA management integration'
    ],
    useCases: [
      'Maintain continuous audit readiness',
      'Prepare for regulatory audits with confidence',
      'Eliminate last-minute evidence scrambling',
      'Support multiple audit types simultaneously'
    ],
    technicalDetails: 'Comprehensive audit readiness platform that collects, validates, and organizes evidence. Uses ML to predict audit questions and generate responses. Tracks readiness scores across multiple standards.',
    integration: 'Integrates with document management systems, quality management platforms, evidence collection tools, and audit management systems. Exports readiness reports to executive dashboards.',
    deliverables: {
      platforms: ['Audit Readiness Platform'],
      modules: ['Evidence collection module', 'Readiness scoring module', 'Response generator module']
    }
  },
  // Legal & Contracts Domain - John Milso
  {
    id: 'contract-management-platform',
    name: 'Contract Management & Analysis',
    category: 'Legal & Contracts',
    pillar: 'Governance',
    status: 'available',
    description: 'Complete contract lifecycle management with risk analysis, obligation tracking, and automated compliance monitoring for vendor and subcontractor agreements.',
    features: [
      'Contract lifecycle management',
      'Automated risk analysis and scoring',
      'Obligation tracking and alerts',
      'Contract compliance monitoring',
      'Vendor and subcontractor management',
      'Expiration and renewal tracking'
    ],
    useCases: [
      'Track and manage contractual obligations',
      'Identify and mitigate contract risks',
      'Ensure timely fulfillment of contract requirements',
      'Support vendor management decisions'
    ],
    technicalDetails: 'Comprehensive contract management platform that analyzes contracts for risks, tracks obligations, and monitors compliance. Uses AI/NLP to identify risk patterns and generate recommendations.',
    integration: 'Integrates with contract management systems, project management platforms, financial systems, and compliance tools. Exports contract data to reporting and dashboard systems.',
    deliverables: {
      platforms: ['Contract Management Platform'],
      modules: ['Risk analysis module', 'Obligation tracker module', 'Compliance monitor module']
    }
  },
  {
    id: 'legal-document-generation',
    name: 'Legal Document Generation & Review',
    category: 'Legal & Contracts',
    pillar: 'Governance',
    status: 'available',
    description: 'Automated generation of legal documents including NDAs, MSAs, SOWs, and licenses with AI-powered risk review and document comparison capabilities.',
    features: [
      'Automated legal document generation',
      'AI-powered risk identification',
      'Document comparison and versioning',
      'Review workflow automation',
      'Multi-format export (Word, PDF)',
      'Template library for common documents'
    ],
    useCases: [
      'Accelerate legal document creation',
      'Identify risks in contract language',
      'Compare document versions',
      'Standardize legal documentation'
    ],
    technicalDetails: 'Template-driven legal document generation system with AI-powered risk analysis. Uses NLP to identify risk patterns, compare documents, and generate recommendations.',
    integration: 'Integrates with contract management systems, document management platforms, and legal review tools. Exports documents to standard formats and legal software.',
    deliverables: {
      modules: ['Document generator module', 'Risk analyzer module', 'Comparison engine module'],
      templates: ['NDA templates', 'MSA templates', 'SOW templates', 'License agreement templates']
    }
  },
  {
    id: 'contract-risk-analysis',
    name: 'Contract Risk Analysis & Mitigation',
    category: 'Legal & Contracts',
    pillar: 'Governance',
    status: 'available',
    description: 'Automated contract risk assessment with dispute prediction, liability analysis, and risk mitigation recommendations for vendor and subcontractor agreements.',
    features: [
      'Automated contract risk scoring',
      'Dispute probability prediction',
      'Liability assessment and analysis',
      'Risk factor identification',
      'Mitigation recommendation generation',
      'Insurance coverage gap analysis'
    ],
    useCases: [
      'Assess vendor risk before contract execution',
      'Predict and prevent contract disputes',
      'Identify liability exposure',
      'Support risk-aware contract negotiation'
    ],
    technicalDetails: 'AI-powered risk analysis engine that evaluates contracts for risks, predicts disputes using ML models, and assesses liability exposure. Generates actionable mitigation recommendations.',
    integration: 'Integrates with contract management systems, vendor management platforms, and risk management tools. Exports risk assessments to procurement and compliance systems.',
    deliverables: {
      modules: ['Risk scoring module', 'Dispute predictor module', 'Liability assessor module']
    }
  },
  // Cybersecurity & RMF Domain - Patrick Caruso
  {
    id: 'rmf-requirements-management',
    name: 'RMF Requirements Management & Traceability',
    category: 'Cybersecurity & RMF',
    pillar: 'Security',
    status: 'available',
    description: 'Complete RMF requirements tracking with BOE planning, control adjudication, and full traceability from requirements to implementation and evidence.',
    features: [
      'RMF requirements tracking and management',
      'BOE (Body of Evidence) plan generation',
      'Control adjudication workflows',
      'Full traceability chain documentation',
      'Implementation status tracking',
      'Evidence requirement mapping'
    ],
    useCases: [
      'Track RMF requirements through full lifecycle',
      'Generate BOE plans automatically',
      'Maintain complete requirement traceability',
      'Support Security Control Assessments'
    ],
    technicalDetails: 'Comprehensive RMF requirements management platform that tracks controls from identification through authorization. Includes automated BOE planning and traceability documentation.',
    integration: 'Integrates with eMASS, Xacta, document management systems, and evidence collection tools. Exports traceability data to RMF platforms.',
    deliverables: {
      platforms: ['RMF Requirements Management Platform'],
      modules: ['Requirements tracker module', 'BOE generator module', 'Traceability module']
    }
  },
  {
    id: 'security-architecture',
    name: 'Security Architecture & Baseline Controls',
    category: 'Cybersecurity & RMF',
    pillar: 'Security',
    status: 'available',
    description: 'Security baseline management with architecture review automation, control implementation validation, and security zone configuration aligned with NIST 800-53.',
    features: [
      'Security baseline creation and management',
      'Architecture review automation',
      'Control implementation validation',
      'Security zone configuration',
      'Baseline compliance checking',
      'Review workflow automation'
    ],
    useCases: [
      'Establish and maintain security baselines',
      'Automate architecture security reviews',
      'Validate control implementations',
      'Ensure consistent security architecture'
    ],
    technicalDetails: 'Security architecture management platform that creates and validates security baselines. Includes automated review workflows and compliance checking against NIST 800-53.',
    integration: 'Integrates with RMF platforms, security tools, and architecture documentation systems. Exports baselines to security management platforms.',
    deliverables: {
      modules: ['Baseline manager module', 'Architecture reviewer module', 'Compliance validator module']
    }
  },
  {
    id: 'vulnerability-compliance',
    name: 'Vulnerability Management & Compliance Scanning',
    category: 'Cybersecurity & RMF',
    pillar: 'Security',
    status: 'available',
    description: 'Automated CVE analysis, vulnerability scanning integration (HBSS/EVSS/STIG), and remediation tracking with compliance validation.',
    features: [
      'Automated CVE analysis and risk assessment',
      'Integration with HBSS, EVSS, STIG scanners',
      'Vulnerability scan orchestration',
      'Remediation tracking and validation',
      'Compliance gap identification',
      'Risk-based prioritization'
    ],
    useCases: [
      'Automate vulnerability management workflows',
      'Integrate multiple scanning tools',
      'Track remediation progress',
      'Maintain continuous compliance'
    ],
    technicalDetails: 'Comprehensive vulnerability management platform that integrates with major scanning tools, analyzes CVEs, and tracks remediation. Includes compliance validation and risk scoring.',
    integration: 'Integrates with HBSS, EVSS, Nessus, Qualys, STIG scanners, and ticketing systems. Exports vulnerability data to RMF platforms and SIEMs.',
    deliverables: {
      platforms: ['Vulnerability Management Platform'],
      modules: ['CVE analyzer module', 'Scanner integration module', 'Remediation tracker module']
    }
  },
  {
    id: 'security-documentation',
    name: 'Security Documentation & CDRL Automation',
    category: 'Cybersecurity & RMF',
    pillar: 'Security',
    status: 'available',
    description: 'Automated generation of security documentation including CDRLs, work instructions, integration plans, and BOE documents with version control and approval workflows.',
    features: [
      'Automated CDRL and non-CDRL document generation',
      'Work instruction generation',
      'Integration plan automation',
      'BOE document creation',
      'Version control and approval workflows',
      'Multi-format export'
    ],
    useCases: [
      'Accelerate security documentation creation',
      'Generate CDRL deliverables automatically',
      'Maintain documentation currency',
      'Streamline approval processes'
    ],
    technicalDetails: 'Template-driven security documentation platform that generates CDRLs, work instructions, and integration plans. Includes version control and automated approval workflows.',
    integration: 'Integrates with document management systems, RMF platforms, and CDRL tracking systems. Exports documents to standard formats.',
    deliverables: {
      modules: ['CDRL generator module', 'Work instruction module', 'Document manager module'],
      templates: ['CDRL templates', 'Work instruction templates', 'Integration plan templates']
    }
  },
  {
    id: 'cybersecurity-team-leadership',
    name: 'Cybersecurity Team Leadership & Performance',
    category: 'Cybersecurity & RMF',
    pillar: 'Security',
    status: 'available',
    description: 'Team management platform for cybersecurity professionals with performance reviews, development planning, workload analysis, and skill gap identification.',
    features: [
      'Team member performance tracking',
      'Automated performance reviews',
      'Development plan creation',
      'Workload analysis and optimization',
      'Skill gap identification',
      'Career goal tracking'
    ],
    useCases: [
      'Manage cybersecurity team performance',
      'Identify skill gaps and training needs',
      'Optimize team workload distribution',
      'Support professional development'
    ],
    technicalDetails: 'Team leadership platform that tracks performance, identifies skill gaps, and supports professional development. Includes workload analysis and development planning tools.',
    integration: 'Integrates with HR systems, learning management platforms, and project management tools. Exports performance data to HR and leadership dashboards.',
    deliverables: {
      platforms: ['Team Leadership Platform'],
      modules: ['Performance tracker module', 'Development planner module', 'Workload analyzer module']
    }
  },
  // Compliance & Security Domain - Shared
  {
    id: 'stig-compliance-validation',
    name: 'STIG Compliance Validation',
    category: 'Automation & Compliance',
    pillar: 'Security',
    status: 'available',
    description: 'Automated STIG compliance validation with remediation playbook generation, compliance scoring, and gap analysis for RHEL, Windows, and Cisco systems.',
    features: [
      'STIG compliance validation automation',
      'Remediation playbook generation',
      'Compliance scoring and metrics',
      'Gap analysis and recommendations',
      'Multi-system type support (RHEL, Windows, Cisco)',
      'Integration with STIG Generator tool'
    ],
    useCases: [
      'Validate STIG compliance before deployment',
      'Generate remediation playbooks automatically',
      'Track compliance across multiple systems',
      'Maintain continuous STIG compliance'
    ],
    technicalDetails: 'STIG compliance validation platform that scans systems, identifies gaps, and generates remediation playbooks. Integrates with STIG Generator for automated playbook creation.',
    integration: 'Integrates with STIG Generator, vulnerability scanners, configuration management tools, and RMF platforms. Exports compliance data to security management systems.',
    deliverables: {
      modules: ['STIG validator module', 'Playbook generator module', 'Compliance scorer module']
    }
  },
  {
    id: 'evidence-collection',
    name: 'Security Control Evidence Collection & Validation',
    category: 'Automation & Compliance',
    pillar: 'Security',
    status: 'available',
    description: 'Automated evidence collection, quality validation, and gap identification for security control assessments with evidence package generation.',
    features: [
      'Automated evidence collection from multiple sources',
      'Evidence quality validation and scoring',
      'Gap identification and analysis',
      'Evidence package generation',
      'Evidence organization by control',
      'Validation workflow automation'
    ],
    useCases: [
      'Automate evidence collection for SCAs',
      'Validate evidence quality before assessments',
      'Identify evidence gaps early',
      'Generate complete evidence packages'
    ],
    technicalDetails: 'Evidence collection platform that automates gathering, validates quality using ML, and organizes evidence by control. Includes gap analysis and package generation.',
    integration: 'Integrates with document management systems, configuration management tools, log aggregation systems, and RMF platforms. Exports evidence packages to assessment tools.',
    deliverables: {
      modules: ['Evidence collector module', 'Quality validator module', 'Package generator module']
    }
  },
  {
    id: 'rmf-artifacts',
    name: 'RMF Artifact Generation & Quality Assurance',
    category: 'Automation & Compliance',
    pillar: 'Security',
    status: 'available',
    description: 'Automated generation of RMF artifacts (SSP, RAR, POA&M, CONMON) with quality validation, completeness checking, and standard DoD format export.',
    features: [
      'Automated SSP, RAR, POA&M, CONMON generation',
      'Artifact quality validation',
      'Completeness checking',
      'Standard DoD format export',
      'Version control and approval workflows',
      'Template library for common artifacts'
    ],
    useCases: [
      'Generate RMF artifacts automatically',
      'Ensure artifact quality and completeness',
      'Accelerate ATO package development',
      'Maintain artifact currency'
    ],
    technicalDetails: 'RMF artifact generation platform that creates compliant documentation from system data. Includes quality validation, completeness checking, and automated formatting.',
    integration: 'Integrates with eMASS, Xacta, document management systems, and RMF platforms. Exports artifacts to standard DoD formats.',
    deliverables: {
      modules: ['SSP generator module', 'RAR generator module', 'POA&M generator module', 'CONMON generator module'],
      templates: ['SSP templates', 'RAR templates', 'POA&M templates', 'CONMON templates']
    }
  },
  // Support Automation Domain - Shared
  {
    id: 'ticket-routing-platform',
    name: 'Intelligent Ticket Routing & Resolution',
    category: 'Support & Operations',
    pillar: 'Infrastructure',
    status: 'available',
    description: 'AI-powered ticket routing with intelligent engineer assignment, solution generation, and automated resolution workflows for technical support teams.',
    features: [
      'Intelligent ticket routing using ML',
      'Automated engineer assignment',
      'Solution generation from knowledge base',
      'SLA tracking and management',
      'Ticket metrics and analytics',
      'Historical pattern analysis'
    ],
    useCases: [
      'Route tickets to the right engineer automatically',
      'Generate solutions from historical data',
      'Improve resolution times',
      'Optimize support team workload'
    ],
    technicalDetails: 'ML-powered ticket routing platform that analyzes tickets, routes to appropriate engineers, and generates solutions. Includes SLA tracking and performance analytics.',
    integration: 'Integrates with ticketing systems (Jira, ServiceNow), knowledge bases, and support tools. Provides REST API for custom integrations.',
    deliverables: {
      platforms: ['Ticket Routing Platform'],
      modules: ['Routing engine module', 'Solution generator module', 'Analytics module']
    }
  },
  {
    id: 'knowledge-base-automation',
    name: 'Knowledge Base & Documentation Automation',
    category: 'Support & Operations',
    pillar: 'Infrastructure',
    status: 'available',
    description: 'Automated knowledge base management with intelligent search, Q&A capabilities, and auto-generation of articles from resolved tickets.',
    features: [
      'Automated knowledge article creation',
      'Intelligent search and Q&A',
      'Auto-generation from tickets',
      'Article quality scoring',
      'Usage analytics and optimization',
      'Multi-format content support'
    ],
    useCases: [
      'Build and maintain knowledge bases automatically',
      'Enable self-service support',
      'Capture knowledge from ticket resolutions',
      'Improve support efficiency'
    ],
    technicalDetails: 'Knowledge base platform with AI-powered search, Q&A capabilities, and automated article generation. Includes quality scoring and usage analytics.',
    integration: 'Integrates with ticketing systems, documentation platforms, and support tools. Provides search API for custom applications.',
    deliverables: {
      platforms: ['Knowledge Base Platform'],
      modules: ['Article generator module', 'Search engine module', 'Q&A module']
    }
  },
  {
    id: 'contract-risk-analyzer',
    name: 'Contract Risk Analyzer',
    category: 'Automation & Compliance',
    pillar: 'Governance',
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
    pillar: 'Quality',
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
    pillar: 'Quality',
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
    pillar: 'Quality',
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
    pillar: 'Infrastructure',
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
    pillar: 'Infrastructure',
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
    pillar: 'Infrastructure',
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
    pillar: 'Governance',
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
    pillar: 'Governance',
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
    pillar: 'Governance',
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

const pillars: Pillar[] = [
  'Security',
  'Infrastructure',
  'Quality',
  'Governance'
]

const categories = [
  'Automation & Compliance',
  'Assessment & Readiness',
  'Infrastructure & Engineering',
  'Cybersecurity & RMF',
  'Quality Assurance',
  'Legal & Contracts',
  'Support & Operations'
]

const pillarInfo = {
  'Security': {
    name: 'Security',
    leader: 'Patrick Caruso',
    description: 'Cybersecurity & RMF expertise',
    color: 'bg-red-50 border-red-200 text-red-900'
  },
  'Infrastructure': {
    name: 'Infrastructure',
    leader: 'James Adams',
    description: 'Data center, storage, networking, deployment',
    color: 'bg-blue-50 border-blue-200 text-blue-900'
  },
  'Quality': {
    name: 'Quality',
    leader: 'Brian MacDonald',
    description: 'ISO compliance, metrology, audit readiness',
    color: 'bg-green-50 border-green-200 text-green-900'
  },
  'Governance': {
    name: 'Governance',
    leader: 'John Milso',
    description: 'Legal, contracts, risk analysis, corporate governance',
    color: 'bg-purple-50 border-purple-200 text-purple-900'
  }
}

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
  const [activeTab, setActiveTab] = useState<string>(pillars[0])
  const [viewMode, setViewMode] = useState<'pillar' | 'category'>('pillar')

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

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
    // Clear expanded items when switching tabs
    setExpandedItems(new Set())
  }, [])

  const activeTools = viewMode === 'pillar' 
    ? tools.filter(tool => tool.pillar === activeTab)
    : tools.filter(tool => tool.category === activeTab)

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
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewMode('pillar')
                  setActiveTab(pillars[0])
                }}
                className={`px-4 py-2 text-body-sm font-medium transition-all ${
                  viewMode === 'pillar'
                    ? 'bg-accent-700 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                By Pillar
              </button>
              <button
                onClick={() => {
                  setViewMode('category')
                  setActiveTab(categories[0])
                }}
                className={`px-4 py-2 text-body-sm font-medium transition-all ${
                  viewMode === 'category'
                    ? 'bg-accent-700 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                By Category
              </button>
            </div>
          </div>

          {/* Pillar/Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {viewMode === 'pillar' ? (
              pillars.map((pillar) => {
                const info = pillarInfo[pillar]
                return (
                  <button
                    key={pillar}
                    onClick={() => handleTabChange(pillar)}
                    className={`px-6 py-3 text-body-sm font-medium transition-all duration-gentle text-left ${
                      activeTab === pillar
                        ? `${info.color} border-2`
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="font-semibold">{info.name}</div>
                  </button>
                )
              })
            ) : (
              categories.map((category) => (
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
              ))
            )}
          </div>

          {/* Pillar Header (when viewing by pillar) */}
          {viewMode === 'pillar' && activeTools.length > 0 && (
            <div className={`mb-8 p-6 rounded-lg border-2 ${pillarInfo[activeTab as Pillar].color}`}>
              <h2 className="heading-2 mb-2">{pillarInfo[activeTab as Pillar].name} Module</h2>
              <p className="text-body text-neutral-700">
                {pillarInfo[activeTab as Pillar].description}
              </p>
              <p className="text-body-sm text-neutral-600 mt-2">
                {activeTools.length} {activeTools.length === 1 ? 'tool' : 'tools'} in this module
              </p>
            </div>
          )}

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
                            {viewMode === 'category' && (
                              <span className={`text-body-xs font-medium px-2 py-1 rounded border flex-shrink-0 ${pillarInfo[tool.pillar].color}`}>
                                {tool.pillar}
                              </span>
                            )}
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

