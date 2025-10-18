const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeTab4U(songName) {
  const searchUrl = `https://www.tab4u.com/resultsSimple?tab=songs&q=${encodeURIComponent(songName)}`;

  // Fetch the search results page
  const searchPage = await axios.get(searchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    },
  });
  const $ = cheerio.load(searchPage.data);

  // Grab the first song link from the search results
  const firstSongRelativeUrl = $("a.song_result").first().attr("href");
  if (!firstSongRelativeUrl) {
    throw new Error("No song found for that query.");
  }

  const fullSongUrl = `https://www.tab4u.com${firstSongRelativeUrl}`;

  // 3️⃣ Fetch the song page
  const songPage = await axios.get(fullSongUrl);
  const $$ = cheerio.load(songPage.data);

  // 4️⃣ Extract song title and artist
  const title = $$("h1.song_name").text().trim() || "Unknown Title";
  const artist = $$("h2.artist_name").text().trim() || "Unknown Artist";

  // 5️⃣ Parse lyrics and chords
  let data = [];
  $$("#songContent tr").each((i, row) => {
    let line = [];
    $$(row)
      .find("td")
      .each((j, cell) => {
        const chords = $$(cell).find(".chord").text().trim();
        const lyrics = $$(cell).find(".lyrics").text().trim();
        if (lyrics || chords) {
          line.push({ lyrics, chords });
        }
      });
    if (line.length > 0) data.push(line);
  });

  return {
    id: fullSongUrl.split("/").pop(),
    title,
    artist,
    data,
  };
}

module.exports = { scrapeTab4U };
