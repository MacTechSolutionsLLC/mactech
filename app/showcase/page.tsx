'use client'

import Link from 'next/link'
import { useState } from 'react'

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
    integration: 'Integrates with existing Ansible workflows, supports CI/CD pipelines, and generates artifacts compatible with DoD test management systems.'
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
    integration: 'Integrates with eMASS, Xacta, and other RMF management platforms. Accepts inputs from infrastructure-as-code, vulnerability scanners, and compliance tools.'
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
    integration: 'CI/CD pipeline integration (GitHub Actions, GitLab CI, Jenkins), Terraform Cloud, AWS Config, Azure Policy, and compliance management platforms.'
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
    integration: 'Integrates with eMASS, Xacta, SharePoint, document management systems, and ticketing platforms. Provides REST API for custom integrations.'
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
    integration: 'Integrates with vulnerability scanners (Nessus, Qualys), SIEMs (Splunk, ELK), configuration management tools, and RMF platforms. Supports custom data source connectors.'
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
    integration: 'Integrates with RMF platforms, document management systems, evidence collection tools, and assessment management platforms.'
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
    integration: 'Integrates with document management systems, quality management platforms, and ISO certification management tools.'
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
    integration: 'Compatible with Terraform Cloud, Ansible Automation Platform, cloud provider IaC services, and CI/CD pipelines.'
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
    integration: 'Integrates with eMASS, Xacta, document management systems, ticketing platforms, and other RMF tools. Provides API for custom integrations.'
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

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const activeTools = tools.filter(tool => tool.category === activeTab)

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-hero mb-6">Tools & Capabilities Showcase</h1>
          <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed">
            Automation tools and platforms designed to accelerate authorization, reduce manual effort, 
            and ensure compliance for federal programs and defense contractors.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="section-container bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
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
                const isExpanded = expandedItems.has(tool.id)
                return (
                  <div 
                    key={tool.id} 
                    className={`card border border-neutral-200 transition-all duration-gentle fade-in${index > 0 ? `-delay-${Math.min(index, 3)}` : ''}`}
                  >
                    {/* Header - Always visible */}
                    <button
                      onClick={() => toggleItem(tool.id)}
                      className="w-full text-left p-6 hover:bg-neutral-50 transition-colors duration-gentle"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="heading-3">{tool.name}</h3>
                            <span className={`text-body-sm font-medium px-3 py-1 rounded border flex-shrink-0 ${statusColors[tool.status]}`}>
                              {statusLabels[tool.status]}
                            </span>
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

