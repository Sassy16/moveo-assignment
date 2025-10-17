const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const songsDir = path.join(__dirname, "..", "songs");
const catalog = fs.readdirSync(songsDir)
  .filter(f => f.endsWith(".json"))
  .map(f => ({
    id: f.replace(".json",""),
    title: f.replace(".json",""),
    artist: "Unknown",
    image: null
  }));

router.get("/", (req, res) => {
  const q = (req.query.query || "").toLowerCase();
  const out = !q ? catalog : catalog.filter(s =>
    s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
  );
  res.json(out);
});

router.get("/:id", (req, res) => {
  const file = path.join(songsDir, `${req.params.id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({error:"Not found"});
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  // shape: { id,title,artist,image,data }
  res.json({
    id: req.params.id,
    title: req.params.id,
    artist: "Unknown",
    image: null,
    data
  });
});

module.exports = router;
