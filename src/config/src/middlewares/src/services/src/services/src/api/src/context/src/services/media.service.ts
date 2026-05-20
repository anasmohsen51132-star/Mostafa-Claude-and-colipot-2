import cloudinary from "../config/cloudinary";
import crypto from "crypto";

export const getSignedUploadUrl = async (folder: string) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder,
  };
};

export const validateMime = (mimetype: string) => {
  const allowed = ["video/mp4", "image/jpeg", "image/png"];
  if (!allowed.includes(mimetype)) throw new Error("Invalid file type");
};

export const generateThumbnail = async (publicId: string) => {
  return cloudinary.url(publicId, { width: 300, height: 200, crop: "thumb" });
};
