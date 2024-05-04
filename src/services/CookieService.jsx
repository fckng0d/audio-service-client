import Cookies from "js-cookie";

const CookieService = {
  // Сохранение данных в куки
  saveAudioDataToCookie: (lastPlaylistId, trackId, indexInPlaylist) => {
    Cookies.set("lastPlaylistId", lastPlaylistId);
    Cookies.set("trackId", trackId);
    Cookies.set("indexInPlaylist", indexInPlaylist);
  },

  // Загрузка данных из куков
  loadAudioDataFromCookie: () => {
    const lastPlaylistId = Cookies.get("lastPlaylistId");
    const trackId = Cookies.get("trackId");
    const indexInPlaylist = Cookies.get("indexInPlaylist");
    return { lastPlaylistId, trackId, indexInPlaylist };
  },

  // Удаление данных из куков
  clearAudioDataFromCookie: () => {
    Cookies.remove("lastPlaylistId");
    Cookies.remove("trackId");
    Cookies.remove("indexInPlaylist");
  },
};

export default CookieService;
