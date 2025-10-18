const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const songsDir = path.join(__dirname, "..", "songs");

// 📜 GET all songs (search by query)
router.get("/", (req, res) => {
  const query = (req.query.query || "").toLowerCase();
  const files = fs.readdirSync(songsDir).filter(f => f.endsWith(".json"));

  const songs = files
    .map(filename => {
      const filePath = path.join(songsDir, filename);
      const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return {
        id: filename.replace(".json", ""),
        title: json.title || filename.replace(".json", ""),
        artist: json.artist || "Unknown Artist",
        image: json.image || null
      };
    })
    .filter(song => song.title.toLowerCase().includes(query));

  res.json(songs);
});


router.get("/:songId", (req, res) => {
  try {
    const songId = req.params.songId;
    const filePath = path.join(songsDir, `${songId}.json`);

    console.log("🔎 Looking for:", filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Song not found" });
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const songData = JSON.parse(rawData);

    if (Array.isArray(songData)) {
      return res.json({
        title: songId.replace(/_/g, " "), 
        artist: "Unknown Artist",         
        data: songData
      });
    }

    return res.json(songData);

  } catch (err) {
    console.error("Song route error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});


module.exports = router;
