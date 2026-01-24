/**
 * Seed script to add 14 not implemented controls as POA&M items
 * Run with: tsx scripts/seed-poam-items.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const poamItems = [
  {
    poamId: "POAM-011",
    controlId: "3.2.2",
    title: "Security Training",
    description: "Security training program is not established as required by NIST SP 800-171 Rev. 2, Section 3.2.2. Personnel must be trained to carry out their assigned information security-related duties and responsibilities.",
    affectedControls: ["3.2.2"],
    status: "open",
    priority: "medium",
    responsibleParty: "System Administrator",
    targetCompletionDate: new Date("2026-04-26"),
    plannedRemediation: [
      "Develop security training content",
      "Create training delivery mechanism",
      "Deliver training to all personnel",
      "Track training completion",
      "Document training records",
    ],
    milestones: [
      { text: "Training content developed", completed: false },
      { text: "Training delivery mechanism established", completed: false },
      { text: "Training delivered to all personnel", completed: false },
      { text: "Training completion tracked and documented", completed: false },
    ],
    notes: "Security training required for all personnel. Training program planned for Phase 4.",
  },
  {
    poamId: "POAM-012",
    controlId: "3.2.3",
    title: "Insider Threat Awareness",
    description: "Insider threat awareness training is not provided as required by NIST SP 800-171 Rev. 2, Section 3.2.3. Personnel must receive security awareness training on recognizing and reporting potential indicators of insider threat.",
    affectedControls: ["3.2.3"],
    status: "open",
    priority: "medium",
    responsibleParty: "System Administrator",
    targetCompletionDate: new Date("2026-04-26"),
    plannedRemediation: [
      "Develop insider threat awareness training content",
      "Include indicators of insider threat",
      "Include reporting procedures",
      "Deliver training to all personnel",
      "Track training completion",
    ],
    milestones: [
      { text: "Insider threat training content developed", completed: false },
      { text: "Training includes indicators and reporting procedures", completed: false },
      { text: "Training delivered to all personnel", completed: false },
      { text: "Training completion tracked", completed: false },
    ],
    notes: "Insider threat awareness training required for all personnel. Planned for Phase 4.",
  },
  {
    poamId: "POAM-013",
    controlId: "3.3.3",
    title: "Audit Log Review",
    description: "Audit log review process is not established as required by NIST SP 800-171 Rev. 2, Section 3.3.3. Logged events must be reviewed and updated periodically to ensure audit logs remain current and relevant.",
    affectedControls: ["3.3.3"],
    status: "open",
    priority: "high",
    responsibleParty: "System Administrator",
    targetCompletionDate: new Date("2026-03-15"),
    plannedRemediation: [
      "Create audit log review procedure",
      "Establish review schedule",
      "Define review activities",
      "Implement review process",
      "Document review records",
    ],
    milestones: [
      { text: "Audit log review procedure created", completed: false },
      { text: "Review schedule established", completed: false },
      { text: "Review process implemented", completed: false },
      { text: "Review records documented", completed: false },
    ],
    notes: "Audit log review is heavily scrutinized by assessors. Review process planned for Phase 2.",
  },
  {
    poamId: "POAM-014",
    controlId: "3.4.1",
    title: "Baseline Configurations",
    description: "Baseline configurations are not established as required by NIST SP 800-171 Rev. 2, Section 3.4.1. Baseline configurations and inventories of organizational systems must be established and maintained.",
    affectedControls: ["3.4.1"],
    status: "open",
    priority: "medium",
    responsibleParty: "System Administrator",
    targetCompletionDate: new Date("2026-04-05"),
    plannedRemediation: [
      "Create Configuration Management Plan",
      "Establish baseline configurations",
      "Document configuration inventory",
      "Maintain baseline configurations",
      "Update inventory as needed",
    ],
    milestones: [
      { text: "Configuration Management Plan created", completed: false },
      { text: "Baseline configurations established", completed: false },
      { text: "Configuration inventory documented", completed: false },
      { text: "Baseline maintenance process implemented", completed: false },
    ],
    notes: "Baseline configurations required for configuration management. Planned for Phase 3.",
  },
  {
    poamId: "POAM-015",
    controlId: "3.4.4",
    title: "Security Impact Analysis",
    description: "Security impact analysis process is not established as required by NIST SP 800-171 Rev. 2, Section 3.4.4. The security impact of changes must be analyzed prior to implementation.",
    affectedControls: ["3.4.4"],
    status: "open",
    priority: "medium",
    responsibleParty: "System Administrator",
    targetCompletionDate: new Date("2026-04-05"),
    plannedRemediation: [
      "Create security impact analysis procedure",
      "Define analysis criteria",
      "Implement analysis process",
      "Document impact analyses",
      "Integrate with change control",
    ],
    milestones: [
      { text: "Security impact analysis procedure created", completed: false },
      { text: "Analysis criteria defined", completed: false },
      { text: "Analysis process implemented", completed: false },
      { text: "Impact analyses documented", completed: false },
    ],
    notes: "Security impact analysis required for all changes. Planned for Phase 3.",
  },
  {
    poamId: "POAM-016",
    controlId: "3.4.5",
    title: "Change Access Restrictions",
    description: "Change access restrictions are not defined and enforced as required by NIST SP 800-171 Rev. 2, Section 3.4.5. Physical and logical access restrictions associated with changes must be defined, documented, approved, and enforced.",
    affectedControls: ["3.4.5"],
    status: "open",
    priority: "medium",
    responsibleParty: "System Administrator",
    targetCompletionDate: new Date("2026-04-05"),
    plannedRemediation: [
      "Define change access restrictions",
      "Document access restrictions",
      "Implement approval process",
      "Enforce access restrictions",
      "Monitor change access",
    ],
    milestones: [
      { text: "Change access restrictions defined", completed: false },
      { text: "Access restrictions documented", completed: false },
      { text: "Approval process implemented", completed: false },
      { text: "Access restrictions enforced", completed: false },
    ],
    notes: "Change access restrictions required for configuration management. Planned for Phase 3.",
  },
  {
    poamId: "POAM-017",
    controlId: "3.4.8",
    title: "Software Restriction Policy",
    description: "Software restriction policy is not established as required by NIST SP 800-171 Rev. 2, Section 3.4.8. A deny-by-exception (blacklisting) policy must be applied to prevent the use of unauthorized software.",
    affectedControls: ["3.4.8"],
    status: "open",
    priority: "medium",
    responsibleParty: "System Administrator",
    targetCompletionDate: new Date("2026-04-05"),
    plannedRemediation: [
      "Create software restriction policy",
      "Create software inventory",
      "Define authorized software list",
      "Implement software restriction controls",
      "Monitor software usage",
    ],
    milestones: [
      { text: "Software restriction policy created", completed: false },
      { text: "Software inventory created", completed: false },
      { text: "Authorized software list defined", completed: false },
      { text: "Software restriction controls implemented", completed: false },
    ],
    notes: "Software restriction policy required for configuration management. Planned for Phase 3.",
  },
  {
    poamId: "POAM-018",
    controlId: "3.5.6",
    title: "Disable Identifiers After Inactivity",
    description: "Account disablement after inactivity is not implemented as required by NIST SP 800-171 Rev. 2, Section 3.5.6. Identifiers must be disabled after a defined period of inactivity.",
    affectedControls: ["3.5.6"],
    status: "open",
    priority: "medium",
    responsibleParty: "System Administrator, Development Team",
    targetCompletionDate: new Date("2026-05-15"),
    plannedRemediation: [
      "Define inactivity period",
      "Implement inactivity monitoring",
      "Implement automatic disablement",
      "Test disablement functionality",
      "Document disablement process",
    ],
    milestones: [
      { text: "Inactivity period defined", completed: false },
      { text: "Inactivity monitoring implemented", completed: false },
      { text: "Automatic disablement implemented", completed: false },
      { text: "Disablement process tested and documented", completed: false },
    ],
    notes: "Account disablement after inactivity required for identification and authentication. Planned for Phase 5.",
  },
  {
    poamId: "POAM-019",
    controlId: "3.5.8",
    title: "Prohibit Password Reuse",
    description: "Password reuse prevention is not implemented as required by NIST SP 800-171 Rev. 2, Section 3.5.8. Password reuse must be prohibited for a specified number of generations.",
    affectedControls: ["3.5.8"],
    status: "open",
    priority: "high",
    responsibleParty: "System Administrator, Development Team",
    targetCompletionDate: new Date("2026-05-15"),
    plannedRemediation: [
      "Define password history requirement",
      "Implement password history storage",
      "Implement password reuse check",
      "Test password reuse prevention",
      "Document password reuse policy",
    ],
    milestones: [
      { text: "Password history requirement defined", completed: false },
      { text: "Password history storage implemented", completed: false },
      { text: "Password reuse check implemented", completed: false },
      { text: "Password reuse prevention tested and documented", completed: false },
    ],
    notes: "Password reuse prevention required for identification and authentication. Planned for Phase 5.",
  },
  {
    poamId: "POAM-020",
    controlId: "3.6.3",
    title: "Incident Response Testing",
    description: "Incident response capability testing is not conducted as required by NIST SP 800-171 Rev. 2, Section 3.6.3. The organizational incident response capability must be tested.",
    affectedControls: ["3.6.3"],
    status: "open",
    priority: "high",
    responsibleParty: "System Administrator, Security Contact",
    targetCompletionDate: new Date("2026-05-29"),
    plannedRemediation: [
      "Develop incident response testing procedure",
      "Conduct tabletop exercise",
      "Conduct simulation exercise (if applicable)",
      "Document test results",
      "Update incident response procedures based on test results",
    ],
    milestones: [
      { text: "IR testing procedure created", completed: false },
      { text: "Tabletop exercise conducted", completed: false },
      { text: "Test results documented", completed: false },
      { text: "Procedures updated based on test results", completed: false },
    ],
    notes: "IR testing often a finding. Testing planned for Phase 6.",
  },
  {
    poamId: "POAM-021",
    controlId: "3.7.2",
    title: "Maintenance Tool Controls",
    description: "Controls on maintenance tools are not established as required by NIST SP 800-171 Rev. 2, Section 3.7.2. Controls must be provided on the tools, techniques, mechanisms, and personnel used to conduct system maintenance.",
    affectedControls: ["3.7.2"],
    status: "open",
    priority: "medium",
    responsibleParty: "System Administrator",
    targetCompletionDate: new Date("2026-06-12"),
    plannedRemediation: [
      "Identify maintenance tools",
      "Document maintenance tool controls",
      "Implement tool access controls",
      "Monitor maintenance tool usage",
      "Document maintenance procedures",
    ],
    milestones: [
      { text: "Maintenance tools identified", completed: false },
      { text: "Maintenance tool controls documented", completed: false },
      { text: "Tool access controls implemented", completed: false },
      { text: "Maintenance procedures documented", completed: false },
    ],
    notes: "Maintenance tool controls required for maintenance. Planned for Phase 7.",
  },
  {
    poamId: "POAM-022",
    controlId: "3.9.1",
    title: "Personnel Screening",
    description: "Personnel screening procedure is not established as required by NIST SP 800-171 Rev. 2, Section 3.9.1. Individuals must be screened prior to authorizing access to organizational systems containing CUI.",
    affectedControls: ["3.9.1"],
    status: "open",
    priority: "high",
    responsibleParty: "Management, System Administrator",
    targetCompletionDate: new Date("2026-04-26"),
    plannedRemediation: [
      "Create Personnel Security Policy",
      "Develop personnel screening procedure",
      "Define screening criteria",
      "Implement screening process",
      "Document screening records",
    ],
    milestones: [
      { text: "Personnel Security Policy created", completed: false },
      { text: "Screening procedure created", completed: false },
      { text: "Screening criteria defined", completed: false },
      { text: "Screening process implemented and documented", completed: false },
    ],
    notes: "Personnel screening required for CUI access. Procedures planned for Phase 4.",
  },
  {
    poamId: "POAM-023",
    controlId: "3.9.2",
    title: "Personnel Termination Procedures",
    description: "Personnel termination procedures are not established as required by NIST SP 800-171 Rev. 2, Section 3.9.2. Organizational systems containing CUI must be protected during and after personnel actions such as terminations and transfers.",
    affectedControls: ["3.9.2"],
    status: "open",
    priority: "high",
    responsibleParty: "Management, System Administrator",
    targetCompletionDate: new Date("2026-04-26"),
    plannedRemediation: [
      "Create personnel termination procedure",
      "Define access revocation process",
      "Implement termination checklist",
      "Document termination procedures",
      "Test termination process",
    ],
    milestones: [
      { text: "Termination procedure created", completed: false },
      { text: "Access revocation process defined", completed: false },
      { text: "Termination checklist implemented", completed: false },
      { text: "Termination procedures documented and tested", completed: false },
    ],
    notes: "Personnel termination procedures required for CUI protection. Planned for Phase 4.",
  },
  {
    poamId: "POAM-024",
    controlId: "3.13.11",
    title: "FIPS-Validated Cryptography",
    description: "FIPS-validated cryptography assessment is not conducted as required by NIST SP 800-171 Rev. 2, Section 3.13.11. FIPS-validated cryptography must be employed when used to protect the confidentiality of CUI.",
    affectedControls: ["3.13.11"],
    status: "open",
    priority: "medium",
    responsibleParty: "System Administrator",
    targetCompletionDate: new Date("2026-07-26"),
    plannedRemediation: [
      "Assess FIPS validation status of cryptography used",
      "Document cryptography implementation",
      "Identify FIPS-validated vs non-FIPS-validated cryptography",
      "Create FIPS assessment evidence",
      "Plan migration to FIPS-validated cryptography (if needed)",
    ],
    milestones: [
      { text: "FIPS assessment conducted", completed: false },
      { text: "Assessment documented", completed: false },
      { text: "Evidence created", completed: false },
      { text: "POA&M items created if needed", completed: false },
    ],
    notes: "FIPS validation is critical. Assessment planned for Phase 8.",
  },
]

async function main() {
  console.log("Seeding POA&M items...")

  for (const item of poamItems) {
    try {
      await prisma.pOAMItem.create({
        data: {
          ...item,
          affectedControls: JSON.stringify(item.affectedControls),
          plannedRemediation: JSON.stringify(item.plannedRemediation),
          milestones: JSON.stringify(item.milestones),
        },
      })
      console.log(`✓ Created ${item.poamId}: ${item.title}`)
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log(`⊘ Skipped ${item.poamId} (already exists)`)
      } else {
        console.error(`✗ Error creating ${item.poamId}:`, error.message)
      }
    }
  }

  console.log("POA&M seeding completed!")
}

main()
  .catch((e) => {
    console.error("Error seeding POA&M items:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
