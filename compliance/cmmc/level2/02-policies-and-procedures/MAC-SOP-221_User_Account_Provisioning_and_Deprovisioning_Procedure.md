# User Account Provisioning and Deprovisioning Procedure - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Purpose

This procedure provides detailed step-by-step instructions for provisioning (creating) and deprovisioning (removing) user accounts in the MacTech Solutions system. This procedure supports the Account Lifecycle Enforcement Procedure (`MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`).

---

## 2. Account Provisioning Procedure

### 2.1 Prerequisites

Before provisioning a user account, ensure:
- Business justification for access has been approved
- User role has been determined (USER or ADMIN)
- User email address is available and valid
- User has been notified of account creation

### 2.2 Step-by-Step Provisioning Process

**Step 1: Access Admin Interface**
- Log in to the system as an ADMIN user
- Navigate to `/admin/users`
- Verify admin re-authentication if required

**Step 2: Initiate Account Creation**
- Click "Create User" or equivalent button
- Navigate to user creation form

**Step 3: Enter User Information**
- **Email:** Enter user's email address (must be unique)
- **Name:** Enter user's full name
- **Role:** Select USER or ADMIN based on business need
- **Password:** Generate or enter initial password (minimum 14 characters per password policy)

**Step 4: Validate Input**
- System validates email format
- System validates password against password policy (minimum 14 characters, not in common password list)
- System validates no CUI-related keywords in input fields
- System checks for duplicate email addresses

**Step 5: Create Account**
- Click "Create User" button
- System hashes password using bcrypt (12 rounds)
- System creates user record in database
- System logs account creation event (AppEvent table)

**Step 6: Notify User**
- User receives notification (email or other method)
- User is provided with:
  - System URL
  - Initial credentials (if applicable) or password reset instructions
  - Link to User Access and FCI Handling Acknowledgement form

**Step 7: User Onboarding**
- User accesses system
- User completes User Access and FCI Handling Acknowledgement (`MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`)
- User changes password on first login (if required)
- Access is activated

**Evidence:** Account creation is logged in AppEvent table with actionType `admin_action` and details indicating user creation.

---

## 3. Account Deprovisioning Procedure

### 3.1 Prerequisites

Before deprovisioning a user account, ensure:
- Revocation trigger has been identified (see `MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`)
- Authorization for revocation has been obtained
- Business justification has been documented

### 3.2 Step-by-Step Deprovisioning Process

**Step 1: Access Admin Interface**
- Log in to the system as an ADMIN user
- Navigate to `/admin/users`
- Verify admin re-authentication if required

**Step 2: Locate User Account**
- Search for user by email or name
- Select user from user list
- Review user account details

**Step 3: Disable or Delete Account**

**Option A: Disable Account (Recommended for Temporary Revocation)**
- Click "Disable" or equivalent action
- Account is marked as disabled in database (User.disabled = true)
- User cannot log in while disabled
- Account can be re-enabled if needed

**Option B: Delete Account (Permanent Removal)**
- Click "Delete" or equivalent action
- Confirm deletion action
- System permanently removes user record from database
- **Note:** Deletion is permanent and cannot be undone

**Step 4: Verify Deprovisioning**
- Verify account is disabled or deleted
- Verify user cannot access system
- Verify user sessions are terminated (if applicable)

**Step 5: Document Deprovisioning**
- Record deprovisioning action in deprovisioning log
- Include: date, time, user email, action taken, authorized by, reason
- System logs deprovisioning event (AppEvent table)

**Step 6: Notify Relevant Parties**
- Notify user (if applicable and appropriate)
- Notify supervisor or project manager
- Update access records

**Evidence:** Account deprovisioning is logged in AppEvent table with actionType `admin_action` and details indicating account revocation or deletion.

---

## 4. Account Modification Procedure

### 4.1 Role Changes

**Step 1: Access Admin Interface**
- Log in as ADMIN user
- Navigate to `/admin/users`
- Locate user account

**Step 2: Modify Role**
- Select user account
- Click "Edit" or equivalent
- Change role (USER ↔ ADMIN)
- Save changes

**Step 3: Verify Changes**
- Verify role change in database
- Verify access permissions reflect new role
- System logs role change event

**Evidence:** Role changes are logged in AppEvent table.

---

## 5. Identifier Reuse Prevention (3.5.5)

### 5.1 Identifier Reuse Policy

**Requirement:** Prevent reuse of identifiers (email addresses) for a defined period after account deletion.

**Implementation:**
- User account identifiers (email addresses) are not reused after account deletion
- Database unique constraint prevents duplicate email addresses
- Deleted account identifiers remain in system history (soft delete) or are permanently removed
- Identifier reuse prevention period: Permanent (identifiers not reused)

### 5.2 Identifier Reuse Prevention Process

**Step 1: Account Deletion**
- When account is deleted, email address is removed from active use
- Email address cannot be reused for new accounts
- Database unique constraint enforces this at database level

**Step 2: Identifier Tracking**
- Deleted account identifiers tracked in system
- Email addresses remain unique in database
- System prevents reuse of deleted identifiers

**Step 3: New Account Creation**
- System validates email address uniqueness
- Database constraint prevents duplicate email addresses
- If email was previously used, new account cannot be created with same email

**Evidence:**
- Database schema: `prisma/schema.prisma` (User model with unique email constraint)
- Identifier Reuse Prevention Evidence: `../05-evidence/MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md`

---

## 6. Related Documents

- Account Lifecycle Enforcement Procedure: `MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`
- Identification and Authentication Policy: `MAC-POL-211_Identification_and_Authentication_Policy.md`
- Identifier Reuse Prevention Evidence: `../05-evidence/MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md`

### 4.2 Password Reset

**Step 1: Access Admin Interface**
- Log in as ADMIN user
- Navigate to `/admin/users`
- Locate user account

**Step 2: Initiate Password Reset**
- Select user account
- Click "Reset Password" or equivalent
- Generate new temporary password or send reset link

**Step 3: Notify User**
- User receives password reset instructions
- User completes password reset
- User changes password on next login

**Evidence:** Password resets are logged in AppEvent table.

---

## 5. Technical Implementation Details

### 5.1 Account Creation API

**Endpoint:** `POST /api/admin/create-user`

**Implementation:**
- Requires admin re-authentication (`requireAdminReauth()`)
- Validates password against password policy
- Validates input for CUI keywords
- Hashes password using bcrypt (12 rounds)
- Creates user record in database
- Logs account creation event

**Code Location:** `app/api/admin/create-user/route.ts`

### 5.2 Account Deprovisioning API

**Endpoint:** `PATCH /api/admin/users/[id]` (disable)  
**Endpoint:** `DELETE /api/admin/users/[id]` (delete)

**Implementation:**
- Requires admin re-authentication
- Updates User.disabled field (for disable)
- Deletes user record (for delete)
- Logs deprovisioning event

**Code Location:** `app/api/admin/users/[id]/route.ts`

---

## 6. Related Documents

- Account Lifecycle Enforcement Procedure (`MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`)
- Access Control Policy (`MAC-POL-210_Access_Control_Policy.md`)
- Identification & Authentication Policy (`MAC-POL-211_Identification_and_Authentication_Policy.md`)
- User Access and FCI Handling Acknowledgement (`MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`)

---

## 7. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 2.0 (2026-01-24): Updated from CMMC Level 2 to Level 2, updated scope to FCI and CUI, updated references to NIST SP 800-171 Rev. 2
- Version 1.0 (2026-01-21): Initial document creation for CMMC Level 2

---

**Document Status:** This document reflects the system state as of 2026-01-21 and is maintained under configuration control.

---
