import Cookies from "js-cookie";

const CookieService = {
  saveAudioDataToCookie: (
    userId,
    lastPlaylistId,
    trackId,
    indexInPlaylist
  ) => {
    Cookies.set(`${userId}_lastPlaylistId`, lastPlaylistId);
    Cookies.set(`${userId}_trackId`, trackId);
    Cookies.set(`${userId}_indexInPlaylist`, indexInPlaylist);
  },

  saveIsFavoriteAudioFilesToCookie: (userId, isFavoriteAudioFiles) => {
    Cookies.set(`${userId}_isFavoriteAudioFiles`, isFavoriteAudioFiles);
  },

  // Загрузка данных из куков
  loadAudioDataFromCookie: (userId) => {
    const lastPlaylistId = stripUsernamePrefix(
      Cookies.get(`${userId}_lastPlaylistId`),
      userId
    );
    const trackId = stripUsernamePrefix(
      Cookies.get(`${userId}_trackId`),
      userId
    );
    const indexInPlaylist = stripUsernamePrefix(
      Cookies.get(`${userId}_indexInPlaylist`),
      userId
    );
    const isFavoriteAudioFiles = stripUsernamePrefix(
      Cookies.get(`${userId}_isFavoriteAudioFiles`),
      userId
    );

    return { lastPlaylistId, isFavoriteAudioFiles, trackId, indexInPlaylist };
  },

  // Удаление данных из куков
  clearAudioDataFromCookie: (userId) => {
    Cookies.remove(`${userId}_lastPlaylistId`);
    Cookies.remove(`${userId}_trackId`);
    Cookies.remove(`${userId}_indexInPlaylist`);
    Cookies.remove(`${userId}_isFavoriteAudioFiles`);
  },
};

const stripUsernamePrefix = (cookieName, userId) => {
  return cookieName ? cookieName.replace(`${userId}_`, "") : undefined;
};

export default CookieService;
