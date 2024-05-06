import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./auth/AuthContext";
import { AudioProvider } from "./components/AudioContext";
import StubPage from "./components/StubPage";
import AddPlaylistContainer from "./components/addPlaylistContainer/AddPlaylistContainer";
import AddPlaylistForm from "./components/addPlaylistForm/AddPlaylistForm";
import AllPlaylistInContainer from "./components/allPlaylistsInContainer/AllPlaylistsInContainer";
import AudioControls from "./components/audioControls/AudioControls";
import AudioList from "./components/audioList/AudioList";
import AuthForm from "./components/authForm/AuthForm";
import Navbar from "./components/navbar/Navbar";
import PlaylistContainerCollection from "./components/playlistContainerCollection/PlaylistContainerCollection";
import RegistrationForm from "./components/registrationForm/RegistrationForm";
import Sidebar from "./components/sideBar/Sidebar";
import UploadAudioForm from "./components/uploadAudio/UploadAudioForm";
import UserFavorites from "./components/userFavorites/UserFavorites";
import UserProfile from "./components/userProfile/UserProfile";

const HistoryContext = createContext();
export const useHistoryContext = () => useContext(HistoryContext);

function App() {
  const [isPressedNavButton, setIsPressedNavButton] = useState(false);
  const isBrowserNavigationButtonPressedRef = useRef(false);

  const [isBackAvailable, setIsBackAvailable] = useState(false);
  const [isForwardAvailable, setIsForwardAvailable] = useState(false);

  const [isAuthFormOpen, setIsAuthFormOpen] = useState(false);
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isMainPageOpen, setIsMainPageOpen] = useState(false);

  const [openFromPlaylistContainerId, setOpenFromPlaylistContainerId] =
    useState(null);

  useEffect(() => {
    const handleNavigationChange = event => {
      isBrowserNavigationButtonPressedRef.current = true;
    };

    window.addEventListener("popstate", handleNavigationChange);

    return () => {
      window.removeEventListener("popstate", handleNavigationChange);
      localStorage.removeItem("token");
    };
  }, []);

  const setLastStateKey = () => {
    setTimeout(() => {
      const isFirstPage = window.history.state?.isFirstPage;

      if (!isPressedNavButton && !isBrowserNavigationButtonPressedRef.current) {
        localStorage.setItem(
          "lastStateKey",
          JSON.stringify(window.history.state)
        );
      }
      isBrowserNavigationButtonPressedRef.current = false;
      setIsPressedNavButton(false);

      const currentState = window.history.state;
      const lastStateStr = localStorage.getItem("lastStateKey");
      const lastState = lastStateStr ? JSON.parse(lastStateStr) : null;

      const isLastPage =
        currentState && lastState && currentState.key === lastState.key;

      setIsBackAvailable(!isFirstPage);
      setIsForwardAvailable(!isLastPage);
    }, 10);
  };

  return (
    <div className="App">
      <HistoryContext.Provider
        value={{
          setLastStateKey,
          isBackAvailable,
          isForwardAvailable,
          setIsForwardAvailable,
          isPressedNavButton,
          setIsPressedNavButton,
          isAuthFormOpen,
          setIsAuthFormOpen,
          isRegistrationFormOpen,
          setIsRegistrationFormOpen,
          openFromPlaylistContainerId,
          setOpenFromPlaylistContainerId,
          isFavoritesOpen,
          setIsFavoritesOpen,
          isMainPageOpen,
          setIsMainPageOpen,
        }}
      >
        <AuthProvider>
          <Router>
            <div className="main-content">
              <Navbar />
              {/* <Routes>
                <Route path="/auth/sign-in" element={<AuthForm />} />
                <Route path="/auth/sign-up" element={<AuthSignUp />} />
              </Routes> */}

              <div className="main-div">
                <AudioProvider>
                  <Sidebar className="sidebar" />
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <PlaylistContainerCollection key="playlistContainersCollection" />
                      }
                    />

                    {/* Любой несуществующий маршрут  */}
                    {/* <Route path="*" element={<NotFoundError />} /> */}

                    {/* <Route path="access-denied" element={<AccessDeniedError />} /> */}

                    <Route
                      className="auth-form"
                      path="/auth/sign-in"
                      element={<AuthForm />}
                    />

                    <Route
                      className="registration-form"
                      path="/auth/sign-up"
                      element={<RegistrationForm />}
                    />

                    <Route
                      className="profile"
                      path="/profile"
                      element={<UserProfile />}
                    />

                    <Route
                      className="favorites"
                      path="/favorites"
                      element={<UserFavorites isFavoriteAudioFiles={true} />}
                    />

                    <Route
                      className="favorites-playlists"
                      path="/favorites/playlists"
                      element={<AllPlaylistInContainer />}
                    />

                    <Route
                      className="favorites-playlists-add"
                      path="/favorites/playlists/add"
                      element={<AddPlaylistForm />}
                    />

                    <Route
                      className="upload-audio-form"
                      path="/playlists/:id/upload"
                      element={<UploadAudioForm key="uploadAudioForm" />}
                    />

                    <Route
                      path="/playlists/:id"
                      element={
                        <AudioList
                          isFavoriteAudioFiles={false}
                          key="audioList"
                        />
                      }
                    />

                    <Route
                      path="/playlist/null"
                      element={<StubPage key="stubPage" />}
                    />

                    <Route
                      className="add-playlist-container"
                      path="/sections/create"
                      element={
                        <AddPlaylistContainer key="addPlaylistContainer" />
                      }
                    />

                    <Route
                      path="/sections/:id"
                      element={
                        <AllPlaylistInContainer key="allPlaylistInContainer" />
                      }
                    />

                    <Route
                      path="/sections/:id/add"
                      element={<AddPlaylistForm key="addGlobalPlaylist" />}
                    />
                  </Routes>
                  <AudioControls />
                </AudioProvider>
              </div>
            </div>
          </Router>
        </AuthProvider>
      </HistoryContext.Provider>
    </div>
  );
}

export default App;
