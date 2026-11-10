const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const imageTypes = [
  { mimeType: 'image/jpeg', extension: '.jpg' },
  { mimeType: 'image/png', extension: '.png' },
  { mimeType: 'image/webp', extension: '.webp' },
];

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, _file, callback) => callback(null, crypto.randomUUID()),
});

async function detectImageType(file) {
  const handle = await fs.promises.open(file.path, 'r');
  try {
    const header = Buffer.alloc(12);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    const bytes = header.subarray(0, bytesRead);
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return imageTypes[0];
    if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return imageTypes[1];
    if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return imageTypes[2];
    return null;
  } finally {
    await handle.close();
  }
}

function invalidImageError() {
  const error = new Error('Only valid JPG, PNG, or WEBP image files are allowed.');
  error.code = 'INVALID_IMAGE_TYPE';
  return error;
}

const multerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/octet-stream') return callback(invalidImageError());
    return callback(null, true);
  },
}).single('image');

function uploadImage(req, res, next) {
  multerUpload(req, res, async (error) => {
    if (error) return next(error);
    if (!req.file) return next();

    try {
      const detectedType = await detectImageType(req.file);
      if (!detectedType) {
        await fs.promises.unlink(req.file.path);
        return next(invalidImageError());
      }

      const filename = `${path.parse(req.file.filename).name}${detectedType.extension}`;
      const destination = path.join(uploadDirectory, filename);
      await fs.promises.rename(req.file.path, destination);
      req.file.filename = filename;
      req.file.path = destination;
      req.file.mimetype = detectedType.mimeType;
      return next();
    } catch (validationError) {
      try { await fs.promises.unlink(req.file.path); } catch {}
      return next(validationError);
    }
  });
}

module.exports = { uploadImage, uploadDirectory };
