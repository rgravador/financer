/**
 * File Validation Utilities
 *
 * Provides utilities for secure file upload validation
 */

/**
 * Allowed MIME types for document uploads
 */
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

/**
 * Maximum file size limits
 */
export const MAX_FILE_SIZE_MB = 10 // 10MB per file
export const MAX_TOTAL_SIZE_MB = 50 // 50MB total per application

/**
 * File type magic numbers (file signatures) for validation
 * First few bytes of common file types
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG
  'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF
  'application/zip': [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]], // ZIP (used by docx, xlsx)
}

/**
 * Validate file MIME type against allowed types
 */
export function validateFileType(mimeType: string, allowedTypes: string[] = ALLOWED_DOCUMENT_TYPES): boolean {
  if (!mimeType) return false
  return allowedTypes.includes(mimeType.toLowerCase())
}

/**
 * Validate file size
 */
export function validateFileSize(sizeInBytes: number, maxSizeInMB: number = MAX_FILE_SIZE_MB): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return sizeInBytes > 0 && sizeInBytes <= maxSizeInBytes
}

/**
 * Validate file signature (magic numbers)
 * Checks the first few bytes of the file to ensure it matches the declared MIME type
 */
export function validateFileSignature(buffer: Buffer, declaredMimeType: string): boolean {
  if (!buffer || buffer.length === 0) return false

  const signatures = FILE_SIGNATURES[declaredMimeType.toLowerCase()]
  if (!signatures) {
    // No signature defined for this MIME type, skip validation
    return true
  }

  // Check if any of the signatures match
  return signatures.some(signature => {
    if (buffer.length < signature.length) return false

    return signature.every((byte, index) => buffer[index] === byte)
  })
}

/**
 * Scan file for malware
 *
 * Note: This is a placeholder for malware scanning integration
 * In production, integrate with:
 * - ClamAV (open-source antivirus)
 * - VirusTotal API
 * - Cloudinary's virus scanning
 * - AWS S3 Malware Detection
 */
export async function scanFileForMalware(buffer: Buffer): Promise<{
  safe: boolean
  threat?: string
}> {
  // TODO: Implement actual malware scanning
  // For now, perform basic checks

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /exec\(/gi,
    /eval\(/gi,
    /<script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
  ]

  const content = buffer.toString('utf8', 0, Math.min(buffer.length, 10000))

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      return {
        safe: false,
        threat: 'Suspicious code pattern detected',
      }
    }
  }

  // In production, call actual malware scanning service here
  // Example:
  // const result = await clamav.scanBuffer(buffer)
  // return { safe: result.isClean, threat: result.virus }

  return { safe: true }
}

/**
 * Sanitize filename
 * Removes special characters, path traversal patterns, and limits length
 */
export function sanitizeFileName(filename: string): string {
  if (!filename) return 'unnamed'

  // Remove path traversal patterns
  let sanitized = filename.replace(/\.\./g, '')
  sanitized = sanitized.replace(/[\/\\]/g, '')

  // Remove special characters except alphanumeric, dash, underscore, and dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_')

  // Remove leading dots to prevent hidden files
  sanitized = sanitized.replace(/^\.+/, '')

  // Ensure there's a filename before extension
  if (sanitized.startsWith('.')) {
    sanitized = 'file' + sanitized
  }

  // Limit length to 255 characters
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'))
    const name = sanitized.substring(0, 255 - ext.length)
    sanitized = name + ext
  }

  return sanitized || 'unnamed'
}

/**
 * Validate file upload completely
 * Combines all validation checks
 */
export async function validateFileUpload(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  options: {
    maxSizeInMB?: number
    allowedTypes?: string[]
    checkMalware?: boolean
  } = {}
): Promise<{
  valid: boolean
  errors: string[]
  sanitizedFilename: string
}> {
  const errors: string[] = []
  const maxSize = options.maxSizeInMB || MAX_FILE_SIZE_MB
  const allowedTypes = options.allowedTypes || ALLOWED_DOCUMENT_TYPES
  const checkMalware = options.checkMalware !== false

  // Sanitize filename
  const sanitizedFilename = sanitizeFileName(filename)

  // Validate MIME type
  if (!validateFileType(mimeType, allowedTypes)) {
    errors.push(`File type '${mimeType}' is not allowed`)
  }

  // Validate file size
  if (!validateFileSize(buffer.length, maxSize)) {
    errors.push(`File size exceeds maximum of ${maxSize}MB`)
  }

  // Validate file signature
  if (!validateFileSignature(buffer, mimeType)) {
    errors.push('File content does not match declared file type')
  }

  // Scan for malware
  if (checkMalware) {
    const scanResult = await scanFileForMalware(buffer)
    if (!scanResult.safe) {
      errors.push(`File failed security scan: ${scanResult.threat}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedFilename,
  }
}
