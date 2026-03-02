import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  url: string
  publicId: string
}

/**
 * Upload a file to Cloudinary
 * @param base64 - Base64 encoded file data with data URI prefix (e.g., "data:image/png;base64,...")
 * @param folder - Cloudinary folder path (e.g., "loan-documents")
 * @returns Upload result with URL and public ID
 */
export async function uploadFile(base64: string, folder: string): Promise<CloudinaryUploadResult> {
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: 'auto',
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error: any) {
    throw new Error(`Cloudinary upload failed: ${error.message}`)
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Cloudinary public ID of the file to delete
 */
export async function deleteFile(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error: any) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`)
  }
}
