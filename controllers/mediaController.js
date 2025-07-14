class MediaController {
  static async uploadImage(req, res) {
    try {
      const image = req.file;
      if (!image) return res.status(400).json({ error: 'No image uploaded' });

      return res.status(200).json({
        message: 'Image uploaded successfully',
        url: image.path,
        public_id: image.filename
      });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Image upload failed' });
    }
  }
}

module.exports = MediaController;
