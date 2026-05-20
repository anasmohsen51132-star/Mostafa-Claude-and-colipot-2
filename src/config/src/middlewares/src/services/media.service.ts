import cloudinary from "../config/cloudinary";

export const uploadMedia = async (fileBuffer: Buffer, folder: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(fileBuffer);
  });
};
