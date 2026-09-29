import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB

export type UploadTarget = {
  key: string;
  uploadUrl: string;
  uploadMethod: "PUT";
  publicUrl: string;
};

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^\w.\-()а-яА-ЯёЁ ]/gu, "_").slice(-120);
}

function driver() {
  return process.env.STORAGE_DRIVER === "r2" ? "r2" : "local";
}

function r2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function createUploadTarget(
  originalFileName: string,
  contentType: string
): Promise<UploadTarget> {
  const key = `${randomUUID()}-${sanitizeFileName(originalFileName)}`;

  if (driver() === "r2") {
    const bucket = process.env.R2_BUCKET_NAME!;
    const client = r2Client();
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType || "application/octet-stream",
      }),
      { expiresIn: 300 }
    );
    const publicBase = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
    return {
      key,
      uploadUrl,
      uploadMethod: "PUT",
      publicUrl: `${publicBase}/${key}`,
    };
  }

  return {
    key,
    uploadUrl: `/api/uploads/local/${encodeURIComponent(key)}`,
    uploadMethod: "PUT",
    publicUrl: `/uploads/${key}`,
  };
}
