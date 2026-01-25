# Maintenance Tool Inventory Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.7.2

**Control ID:** 3.7.2  
**Control Requirement:** Provide controls on the tools, techniques, mechanisms, and personnel used to conduct system maintenance

---

## 1. Purpose

This document provides evidence of the maintenance tool inventory and controls implemented for the MacTech Solutions system. This inventory supports compliance with NIST SP 800-171 Rev. 2, Section 3.7.2, which requires controls on maintenance tools.

---

## 2. Maintenance Tool Inventory

### 2.1 Database Maintenance Tools

| Tool Name | Version | Purpose | Access Level | Authorized Personnel | Location/Installation |
|-----------|---------|---------|--------------|---------------------|----------------------|
| Prisma CLI | 5.22.0 | Database schema management, migrations, query execution | ADMIN | System Administrators | npm package (node_modules/.bin/prisma) |
| Prisma Studio | 0.503.0 | Database GUI for viewing and editing data | ADMIN | System Administrators | npm package (npx prisma studio) |
| PostgreSQL Client | 14+ | Direct database access (via Railway platform) | ADMIN | System Administrators | Railway platform (inherited) |

**Prisma Commands Used:**
- `prisma migrate dev` - Create and apply database migrations
- `prisma migrate deploy` - Deploy migrations in production
- `prisma db push` - Push schema changes to database
- `prisma generate` - Generate Prisma Client
- `prisma studio` - Open database GUI
- `prisma db reset` - Reset database (development only)

**Access Controls:**
- Prisma CLI access restricted to ADMIN role users
- Database credentials stored in environment variables (DATABASE_URL)
- Railway platform provides additional access controls for PostgreSQL

---

### 2.2 Development and Build Tools

| Tool Name | Version | Purpose | Access Level | Authorized Personnel | Location/Installation |
|-----------|---------|---------|--------------|---------------------|----------------------|
| Node.js | 24.6.0 | JavaScript runtime environment | ADMIN, Developer | System Administrators, Development Team | System-level installation |
| npm | 11.5.1 | Package manager and build tool | ADMIN, Developer | System Administrators, Development Team | Bundled with Node.js |
| TypeScript | 5.3.3 | Type checking and compilation | ADMIN, Developer | System Administrators, Development Team | npm package (devDependency) |
| Next.js | 14.0.4 | Web framework and build system | ADMIN, Developer | System Administrators, Development Team | npm package (dependency) |
| tsx | 4.21.0 | TypeScript execution for scripts | ADMIN, Developer | System Administrators, Development Team | npm package (devDependency) |

**Build Commands:**
- `npm run build` - Production build
- `npm run dev` - Development server
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes

**Access Controls:**
- Development tools accessible to authorized development personnel
- Production builds require ADMIN role
- Build processes logged and monitored

---

### 2.3 Deployment and Infrastructure Tools

| Tool Name | Version | Purpose | Access Level | Authorized Personnel | Location/Installation |
|-----------|---------|---------|--------------|---------------------|----------------------|
| Railway CLI | Latest | Command-line interface for Railway platform | ADMIN | System Administrators | npm package (global: @railway/cli) |
| Railway Platform | Web-based | Infrastructure management, deployment, monitoring | ADMIN | System Administrators | Web interface (railway.app) |
| Git | Latest | Version control and code management | ADMIN, Developer | System Administrators, Development Team | System-level installation |

**Railway CLI Commands Used:**
- `railway login` - Authenticate with Railway
- `railway link` - Link project to Railway service
- `railway run` - Execute commands in Railway environment
- `railway logs` - View service logs
- `railway variables` - Manage environment variables

**Access Controls:**
- Railway platform access requires authentication (MFA enabled)
- Railway CLI access restricted to ADMIN role
- Git repository access controlled via authentication and authorization

---

### 2.4 Code Management Tools

| Tool Name | Version | Purpose | Access Level | Authorized Personnel | Location/Installation |
|-----------|---------|---------|--------------|---------------------|----------------------|
| Git | Latest | Version control system | ADMIN, Developer | System Administrators, Development Team | System-level installation |
| GitHub | Web-based | Code repository hosting and collaboration | ADMIN, Developer | System Administrators, Development Team | Web interface (github.com) |

**Git Commands Used:**
- `git clone` - Clone repository
- `git pull` - Update local repository
- `git push` - Push changes to remote
- `git commit` - Commit changes
- `git branch` - Branch management

**Access Controls:**
- Git repository access requires authentication
- GitHub access controlled via authentication and repository permissions
- Code changes require review and approval (pull request process)

---

### 2.5 Monitoring and Logging Tools

| Tool Name | Version | Purpose | Access Level | Authorized Personnel | Location/Installation |
|-----------|---------|---------|--------------|---------------------|----------------------|
| Railway Logs | Platform | Application and service logs | ADMIN | System Administrators | Railway platform web interface |
| Application Audit Logs | Custom | System audit logging | ADMIN | System Administrators | Database (AppEvent table) |

**Access Controls:**
- Log access restricted to ADMIN role
- Audit logs stored in database with access controls
- Railway logs accessible via Railway platform authentication

---

## 3. Tool Approval Process

### 3.1 Approval Requirements

All maintenance tools must be approved before use. The approval process includes:

1. **Tool Request**: Request submitted with justification and use case
2. **Security Review**: Security assessment of tool risks
3. **Approval**: Tool approved by System Administrator
4. **Documentation**: Tool added to inventory and documented
5. **Access Control**: Access restricted to authorized personnel

### 3.2 Approved Tool List

All tools listed in Section 2 are approved for use in the system.

**Approval Authority:** System Administrator  
**Review Frequency:** Quarterly  
**Last Review Date:** 2026-01-25

---

## 4. Access Controls

### 4.1 Role-Based Access

**ADMIN Role:**
- Full access to all maintenance tools
- Database management tools (Prisma CLI, Prisma Studio)
- Deployment tools (Railway CLI, Railway platform)
- Build and development tools
- Monitoring and logging tools

**Developer Role:**
- Access to development and build tools
- Code management tools (Git, GitHub)
- Limited access to production tools

### 4.2 Authentication Requirements

- Railway platform: MFA required
- GitHub: Authentication required
- Database: Credentials via environment variables
- Local tools: System-level authentication

### 4.3 Access Logging

**Logging Implementation:**
- **Application Logging**: Tool usage logged via `lib/maintenance-tool-logging.ts`
  - `logMaintenanceToolAccess()` - Logs tool access events
  - `logMaintenanceToolOperation()` - Logs tool operations and results
  - Events stored in AppEvent table with action types: `maintenance_tool_access`, `maintenance_tool_operation`
- **Node.js Script Logging**: Tool usage logged via `lib/maintenance-tool-logging-node.ts`
  - `logMaintenanceToolAccessNode()` - Logs tool access in Node.js scripts
  - `logMaintenanceToolOperationNode()` - Logs tool operations in Node.js scripts
  - Direct Prisma logging for startup scripts and standalone scripts
- **Logging Integration Points:**
  - Migration API: `app/api/admin/migrate/route.ts` - Logs Prisma CLI operations
  - Startup Script: `scripts/start-with-migration.js` - Logs Prisma CLI operations during startup
  - All Prisma CLI operations logged with tool name, version, operation, and result
- **Railway Platform**: Access logged by platform (inherited)
- **Git**: Commit history tracks code changes
- **Database**: Prisma operations logged via application logs
- **Audit Trail**: All tool access and operations recorded in audit logs for compliance review

**Logging Details Captured:**
- Tool name and version
- Operation performed
- User ID and email
- Timestamp
- Success/failure status
- Additional operation details

---

## 5. Tool Monitoring

### 5.1 Usage Monitoring

**Monitoring Methods:**
- Application audit logs track tool usage
- Railway platform logs track infrastructure changes
- Git commit history tracks code changes
- Database migration history tracks schema changes

### 5.2 Review Process

**Review Frequency:** Quarterly  
**Review Scope:**
- Tool usage patterns
- Access control effectiveness
- Unauthorized access attempts
- Tool updates and version changes

**Review Documentation:**
- Review results documented
- Access control changes documented
- Tool inventory updated as needed

---

## 6. Tool Removal and Decommissioning

### 6.1 Removal Process

1. **Assessment**: Assess impact of tool removal
2. **Migration**: Migrate functionality if needed
3. **Removal**: Remove tool and dependencies
4. **Documentation**: Update inventory and documentation
5. **Verification**: Verify removal and system functionality

### 6.2 Decommissioned Tools

Currently, no tools are decommissioned.

---

## 7. Related Documents

- **Policy:** `../02-policies-and-procedures/MAC-POL-221_Maintenance_Policy.md`
- **Procedure:** `../02-policies-and-procedures/MAC-SOP-238_Maintenance_Tool_Control_Procedure.md`
- **Control Document:** `../07-nist-controls/NIST-3.7.2_controls_on_maintenance_tools.md`

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-25 (Quarterly)

**Change History:**
- Version 1.1 (2026-01-25): Updated with logging implementation details and integration points
- Version 1.0 (2026-01-25): Initial maintenance tool inventory creation

---

## Appendix A: Tool Version Tracking

**Last Updated:** 2026-01-25

**Version Update Process:**
- Tool versions checked quarterly
- Version updates documented in this inventory
- Security updates applied promptly
- Version compatibility verified before updates
