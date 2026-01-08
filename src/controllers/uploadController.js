import cloudinary from "../lib/cloudinary.js";

export async function uploadFile(req, res) {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "chat-app",
    });

    res.json({ url: result.secure_url });
  } catch (e) {
    console.error("Upload failed:", e);
    res.status(500).json({ error: "Upload failed" });
  }
}
