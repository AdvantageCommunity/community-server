import SDK from 'aws-sdk';
import dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();

const S3Client = new SDK.S3({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY,
  },
});
const imageFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'
  ) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error('Only JPEG and PNG files are allowed!'), false);
  }
};

export const upload = multer({
  // fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
export const uploadToS3 = (fileData, imagePath) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: fileData,
      Key: imagePath,
    };
    S3Client.upload(params, (err, data) => {
      if (err) {
        console.log('Error in uploadToS3 function :' + err.message);
        reject(err.message);
      }
      return resolve(data);
    });
  });
};
