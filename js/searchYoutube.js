// js/searchYouTube.js

const YOUTUBE_API_KEY = "AIzaSyDVkVIOSaFUSrgi2XtTS2u5LN3PyB_XX68";

async function searchYouTube(query) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=6&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error al consultar la API de YouTube:", errorText);
      throw new Error("No se pudo obtener resultados de YouTube");
    }

    const data = await response.json();

    if (!data || !data.items || data.items.length === 0) {
      return { items: [] }; // Siempre devuelve un array para evitar errores
    }

    return data;
  } catch (error) {
    console.error("❌ Error en searchYouTube:", error);
    return { items: [] }; // Fallback para evitar que falle handleSearch
  }
}
