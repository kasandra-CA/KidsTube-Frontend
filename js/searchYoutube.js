const YOUTUBE_API_KEY = "AIzaSyDVkVIOSaFUSrgi2XtTS2u5LN3PyB_XX68";

async function searchYouTube(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=5&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items;
}
