/**
 * Security Awareness Training Content
 * Structured training content for interactive training module
 * Based on: compliance/cmmc/level2/05-evidence/training/security-awareness-training-content.md
 */

export interface TrainingSection {
  id: string
  title: string
  content?: string[]
  subsections?: TrainingSection[]
}

export const SECURITY_TRAINING_CONTENT: TrainingSection[] = [
  {
    id: 'overview',
    title: 'Training Overview',
    content: [
      'This security awareness training is required for all personnel with access to the MacTech Solutions system. You must complete this training before system access is granted and annually thereafter.',
      'This training covers security risks, policies, procedures, and your responsibilities for protecting sensitive information and maintaining system security.',
    ],
  },
  {
    id: 'security-risks',
    title: 'Security Risks and Threats',
    subsections: [
      {
        id: 'common-threats',
        title: 'Common Security Threats',
        content: [
          'Phishing Attacks: Email-based attacks attempting to steal credentials through suspicious links and attachments. Be cautious of unexpected emails, verify senders before clicking links, and report suspicious emails immediately.',
          'Malware: Viruses, worms, trojans, and ransomware can spread through email attachments, downloads, or compromised websites. Keep software updated, use antivirus protection, and report suspected malware immediately.',
          'Unauthorized Access: Attempts to gain unauthorized system access through password attacks, social engineering, or physical security threats. Protect your credentials and report suspicious access attempts.',
          'Data Breaches: Unauthorized access to sensitive information (CUI) can result from data exfiltration or insider threats. Report any suspected data breaches immediately.',
        ],
      },
      {
        id: 'system-risks',
        title: 'System-Specific Risks',
        content: [
          'CUI Handling Risks: Unauthorized disclosure, improper storage, or unauthorized access to Controlled Unclassified Information (CUI) can result in serious security incidents. Always handle CUI in approved systems only.',
          'Access Control Risks: Unauthorized system access, privilege escalation, account compromise, or session hijacking can compromise system security. Protect your account credentials and report suspicious activity.',
          'Compliance Risks: Policy violations, inadequate security controls, or non-compliance with security requirements can result in assessment failures and loss of system authorization.',
        ],
      },
    ],
  },
  {
    id: 'policies-procedures',
    title: 'Security Policies and Procedures',
    subsections: [
      {
        id: 'access-control',
        title: 'Access Control Policy',
        content: [
          'Authentication is required for all system access. The system uses role-based access control to ensure users only have access to information needed for their role.',
          'Your responsibilities include: protecting your account credentials, using strong passwords, enabling multi-factor authentication if required, reporting suspicious access attempts, and locking your workstation when away.',
        ],
      },
      {
        id: 'cui-handling',
        title: 'CUI Handling Requirements',
        content: [
          'Controlled Unclassified Information (CUI) must be protected from unauthorized disclosure. CUI must not be stored on portable storage devices, emailed, or transmitted insecurely.',
          'Your responsibilities include: understanding what constitutes CUI, handling CUI only in approved systems, reporting CUI spillage incidents immediately, and never downloading CUI to portable storage devices.',
        ],
      },
      {
        id: 'incident-response',
        title: 'Incident Response Procedures',
        content: [
          'Security incidents include: security breaches, CUI spillage, unauthorized access, system compromise, and policy violations. All incidents must be reported immediately.',
          'Report incidents to: security@mactechsolutions.com. Include all relevant details and do not attempt to investigate alone. Prompt reporting helps minimize damage and ensures proper response.',
        ],
      },
      {
        id: 'password-management',
        title: 'Password Management',
        content: [
          'Strong passwords are required with complexity requirements. Passwords must be changed as required, and password sharing or reuse is prohibited.',
          'Your responsibilities include: creating strong passwords, changing passwords as required, never sharing passwords, and reporting suspected password compromise immediately.',
        ],
      },
    ],
  },
  {
    id: 'role-responsibilities',
    title: 'Role-Specific Security Responsibilities',
    subsections: [
      {
        id: 'admin-responsibilities',
        title: 'Administrator Responsibilities',
        content: [
          'Administrators are responsible for: secure system configuration, user account management, security control management, audit log review, and incident response.',
          'Administrators must maintain security controls, monitor system security, review security events, and respond to security incidents promptly.',
        ],
      },
      {
        id: 'user-responsibilities',
        title: 'User Responsibilities',
        content: [
          'All users are responsible for: secure system access, proper CUI handling, incident reporting, and policy compliance.',
          'Users must recognize security threats, report security concerns, follow security procedures, and protect system access credentials.',
        ],
      },
      {
        id: 'manager-responsibilities',
        title: 'Manager Responsibilities',
        content: [
          'Managers are responsible for: ensuring personnel compliance with security requirements, reviewing the security program, allocating security resources, and approving security policies.',
          'Managers must identify, assess, mitigate, and monitor security risks within their areas of responsibility.',
        ],
      },
    ],
  },
  {
    id: 'best-practices',
    title: 'Security Best Practices',
    subsections: [
      {
        id: 'account-security',
        title: 'Account Security',
        content: [
          'Use unique, strong passwords for all accounts. Enable multi-factor authentication when available. Never share account credentials with anyone. Report suspicious account activity immediately. Always lock your workstation when away.',
        ],
      },
      {
        id: 'email-security',
        title: 'Email Security',
        content: [
          'Verify the sender before clicking links in emails. Do not open suspicious attachments. Report phishing attempts immediately. Never send CUI via email. Use secure communication channels for sensitive information.',
        ],
      },
      {
        id: 'physical-security',
        title: 'Physical Security',
        content: [
          'Lock your workstation when away from your desk. Protect physical access to systems and work areas. Report unauthorized physical access immediately. Secure work areas and follow visitor escort procedures.',
        ],
      },
      {
        id: 'data-protection',
        title: 'Data Protection',
        content: [
          'Protect CUI from unauthorized disclosure. Never store CUI on portable storage devices. Use secure methods for data transfer. Report data breaches immediately. Follow proper data disposal procedures.',
        ],
      },
    ],
  },
  {
    id: 'insider-threat',
    title: 'Insider Threat Awareness',
    subsections: [
      {
        id: 'threat-indicators',
        title: 'Insider Threat Indicators',
        content: [
          'Behavioral indicators include: inordinate, long-term job dissatisfaction, attempts to gain unauthorized access, unexplained financial access, bullying or harassment, workplace violence, and policy violations.',
          'Technical indicators include: unusual system access patterns, access to information not required for job duties, unauthorized data downloads, and attempts to bypass security controls.',
        ],
      },
      {
        id: 'reporting-procedures',
        title: 'Reporting Procedures',
        content: [
          'Report insider threat concerns to: security@mactechsolutions.com, your management, or human resources (for personnel issues).',
          'Report observed insider threat indicators, suspicious behavior, policy violations, and any security concerns. Include all relevant details and maintain confidentiality.',
        ],
      },
    ],
  },
]

export const TRAINING_ACKNOWLEDGMENT_TEXT =
  'I have reviewed and understand the security awareness training content. I acknowledge my responsibility to follow security policies and procedures, protect sensitive information, and report security incidents immediately.'
