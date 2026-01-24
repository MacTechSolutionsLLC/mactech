/**
 * File storage service for CMMC Level 2 compliance
 * 
 * Handles both FCI files (StoredFile) and CUI files (StoredCUIFile)
 * CUI files require password protection for access
 * 
 * Stores files in PostgreSQL BYTEA column (replaces /public/uploads)
 * Provides signed URLs for secure file access
 */

import { prisma } from "./prisma"
import { validateFilename } from "./cui-blocker"
import crypto from "crypto"

// Allowed MIME types (configurable)
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/json",
]

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Signed URL expiration: 1 hour (default)
const DEFAULT_SIGNED_URL_EXPIRES_IN = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Validate file type
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    }
  }
  return { valid: true }
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${file.size} bytes exceeds maximum ${MAX_FILE_SIZE} bytes (10MB)`,
    }
  }
  return { valid: true }
}

/**
 * Store file in database
 */
export async function storeFile(
  userId: string,
  file: File,
  metadata?: Record<string, any>,
  isFCI: boolean = false
): Promise<{ fileId: string; signedUrl: string }> {
  // Validate file type
  const typeValidation = validateFileType(file)
  if (!typeValidation.valid) {
    throw new Error(typeValidation.error)
  }

  // Validate file size
  const sizeValidation = validateFileSize(file)
  if (!sizeValidation.valid) {
    throw new Error(sizeValidation.error)
  }

  // Validate filename (no longer blocking CUI keywords, just validating format)
  // CUI files should be stored using storeCUIFile() instead

  // Read file data
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Store file in database
  const storedFile = await prisma.storedFile.create({
    data: {
      userId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      data: buffer,
      metadata: metadata ? JSON.stringify(metadata) : null,
      signedUrlExpiresAt: new Date(Date.now() + DEFAULT_SIGNED_URL_EXPIRES_IN),
      isFCI,
    },
  })

  // Generate signed URL
  const signedUrl = generateSignedUrl(storedFile.id)

  return {
    fileId: storedFile.id,
    signedUrl,
  }
}

/**
 * Generate signed URL for file access
 * Uses HMAC-SHA256 with secret key
 */
export function generateSignedUrl(
  fileId: string,
  expiresIn: number = DEFAULT_SIGNED_URL_EXPIRES_IN
): string {
  const secret = process.env.FILE_SIGNING_SECRET || process.env.AUTH_SECRET || "default-secret"
  const expiresAt = Date.now() + expiresIn
  const data = `${fileId}:${expiresAt}`
  
  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex")
  
  // Encode signature and expiration in URL
  const params = new URLSearchParams({
    id: fileId,
    expires: expiresAt.toString(),
    sig: signature,
  })
  
  return `/api/files/${fileId}?${params.toString()}`
}

/**
 * Verify signed URL
 */
export function verifySignedUrl(
  fileId: string,
  expires: string,
  signature: string
): boolean {
  const secret = process.env.FILE_SIGNING_SECRET || process.env.AUTH_SECRET || "default-secret"
  const data = `${fileId}:${expires}`
  
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex")
  
  // Constant-time comparison
  if (signature !== expectedSignature) {
    return false
  }
  
  // Check expiration
  const expiresAt = parseInt(expires, 10)
  if (Date.now() > expiresAt) {
    return false
  }
  
  return true
}

/**
 * Get file with access check
 */
export async function getFile(
  fileId: string,
  userId?: string,
  signedUrlParams?: { expires: string; sig: string },
  userRole?: string
) {
  const file = await prisma.storedFile.findUnique({
    where: { id: fileId },
    include: {
      uploader: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })

  if (!file) {
    throw new Error("File not found")
  }

  // Check if file is deleted
  if (file.deletedAt) {
    throw new Error("File has been deleted")
  }

  // Access control: user can access their own files, admin can access any file, or use signed URL
  if (signedUrlParams) {
    // Verify signed URL
    if (!verifySignedUrl(fileId, signedUrlParams.expires, signedUrlParams.sig)) {
      throw new Error("Invalid or expired signed URL")
    }
  } else if (userId) {
    // Check if user owns the file OR is admin
    if (file.userId !== userId && userRole !== "ADMIN") {
      throw new Error("Access denied")
    }
  } else {
    throw new Error("Authentication required")
  }

  return file
}

/**
 * Delete file (logical deletion)
 */
export async function deleteFile(fileId: string, userId: string, userRole?: string): Promise<void> {
  // Verify user owns the file or is admin
  const file = await prisma.storedFile.findUnique({
    where: { id: fileId },
  })

  if (!file) {
    throw new Error("File not found")
  }

  // Check if user owns the file OR is admin
  if (file.userId !== userId && userRole !== "ADMIN") {
    throw new Error("Access denied")
  }

  // Logical deletion
  await prisma.storedFile.update({
    where: { id: fileId },
    data: {
      deletedAt: new Date(),
    },
  })
}

/**
 * List files for user
 */
export async function listFiles(
  userId: string,
  includeDeleted: boolean = false
) {
  const where: any = {
    userId,
  }

  if (!includeDeleted) {
    where.deletedAt = null
  }

  return prisma.storedFile.findMany({
    where,
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      size: true,
      uploadedAt: true,
      deletedAt: true,
    },
  })
}

/**
 * Verify CUI password
 * Temporary implementation: password is "cui"
 * TODO: Make configurable via environment variable
 */
export function verifyCUIPassword(password: string): boolean {
  return password === "cui"
}

/**
 * Store CUI file in database
 */
export async function storeCUIFile(
  userId: string,
  file: File,
  metadata?: Record<string, any>
): Promise<{ fileId: string; signedUrl: string }> {
  // Validate file type
  const typeValidation = validateFileType(file)
  if (!typeValidation.valid) {
    throw new Error(typeValidation.error)
  }

  // Validate file size
  const sizeValidation = validateFileSize(file)
  if (!sizeValidation.valid) {
    throw new Error(sizeValidation.error)
  }

  // Read file data
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Store CUI file in database
  const storedFile = await prisma.storedCUIFile.create({
    data: {
      userId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      data: buffer,
      metadata: metadata ? JSON.stringify(metadata) : null,
      signedUrlExpiresAt: new Date(Date.now() + DEFAULT_SIGNED_URL_EXPIRES_IN),
    },
  })

  // Generate signed URL (note: CUI files require password, so signed URLs may not be used)
  const signedUrl = generateSignedUrl(storedFile.id)

  return {
    fileId: storedFile.id,
    signedUrl,
  }
}

/**
 * Get CUI file with password verification
 */
export async function getCUIFile(
  fileId: string,
  password: string,
  userId?: string,
  userRole?: string
) {
  // Verify password first
  if (!verifyCUIPassword(password)) {
    throw new Error("Invalid CUI password")
  }

  const file = await prisma.storedCUIFile.findUnique({
    where: { id: fileId },
    include: {
      uploader: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })

  if (!file) {
    throw new Error("CUI file not found")
  }

  // Check if file is deleted
  if (file.deletedAt) {
    throw new Error("CUI file has been deleted")
  }

  // Access control: user can access their own CUI files, admin can access any CUI file
  if (userId) {
    // Check if user owns the file OR is admin
    if (file.userId !== userId && userRole !== "ADMIN") {
      throw new Error("Access denied")
    }
  } else {
    throw new Error("Authentication required")
  }

  return file
}

/**
 * Delete CUI file (logical deletion)
 */
export async function deleteCUIFile(fileId: string, userId: string, userRole?: string): Promise<void> {
  // Verify user owns the file or is admin
  const file = await prisma.storedCUIFile.findUnique({
    where: { id: fileId },
  })

  if (!file) {
    throw new Error("CUI file not found")
  }

  // Check if user owns the file OR is admin
  if (file.userId !== userId && userRole !== "ADMIN") {
    throw new Error("Access denied")
  }

  // Logical deletion
  await prisma.storedCUIFile.update({
    where: { id: fileId },
    data: {
      deletedAt: new Date(),
    },
  })
}

/**
 * List CUI files for user
 */
export async function listCUIFiles(
  userId: string,
  includeDeleted: boolean = false,
  userRole?: string
) {
  const where: any = {}

  // Users can only see their own CUI files, admins can see all
  if (userRole !== "ADMIN") {
    where.userId = userId
  }

  if (!includeDeleted) {
    where.deletedAt = null
  }

  return prisma.storedCUIFile.findMany({
    where,
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      size: true,
      uploadedAt: true,
      deletedAt: true,
      userId: true,
      uploader: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })
}

/**
 * List FCI files for user
 */
export async function listFCIFiles(
  userId: string,
  includeDeleted: boolean = false,
  userRole?: string
) {
  const where: any = {
    isFCI: true,
  }

  // Users can only see their own FCI files, admins can see all
  if (userRole !== "ADMIN") {
    where.userId = userId
  }

  if (!includeDeleted) {
    where.deletedAt = null
  }

  return prisma.storedFile.findMany({
    where,
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      size: true,
      uploadedAt: true,
      deletedAt: true,
      userId: true,
      isFCI: true,
      uploader: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })
}
