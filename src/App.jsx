import React, {
  useState,
  useContext,
  useRef,
  createContext,
  useEffect,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import AudioList from "./components/audioList/AudioList";
import UploadAudioForm from "./components/uploadAudio/UploadAudioForm";
import Navbar from "./components/navbar/Navbar";
import { AudioProvider } from "./components/AudioContext";
import AudioControls from "./components/audioControls/AudioControls";
import PlaylistContainer from "./components/playlistContainer/PlaylistContainer";
import Sidebar from "./components/sideBar/Sidebar";
import AddGlobalPlaylist from "./components/addGlobalPlaylist/AddGlobalPlaylist";
import AuthForm from "./components/authForm/AuthForm";
import { AuthProvider } from "./auth/AuthContext";
import UserProfile from "./components/userProfile/UserProfile";
import "./App.css";
import PlaylistContainerCollection from "./components/playlistContainerCollection/PlaylistContainerCollection";
import AllPlaylistInContainer from "./components/allPlaylistsInContainer/AllPlaylistsInContainer";
import AddPlaylistContainer from "./components/addPlaylistContainer/AddPlaylistContainer";

const HistoryContext = createContext();
export const useHistoryContext = () => useContext(HistoryContext);

function App() {
  const [isPressedNavButton, setIsPressedNavButton] = useState(false);
  const isBrowserNavigationButtonPressedRef = useRef(false);

  const [isBackAvailable, setIsBackAvailable] = useState(false);
  const [isForwardAvailable, setIsForwardAvailable] = useState(false);

  const [isAuthFormOpen, setIsAuthFormOpen] = useState(false);

  useEffect(() => {
    const handleNavigationChange = (event) => {
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
          setIsAuthFormOpen,
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

              <div style={{ marginLeft: "350px" }}>
                <AudioProvider>
                  <Sidebar className="sidebar" />
                  <Routes>
                    {/* Пока нет главной страницы */}
                    {/* <Route
                      path="/"
                      element={<Navigate to="/playlistContainers" replace />}
                    /> */}

                    <Route
                      className="auth-form"
                      path="/auth/sign-in"
                      element={<AuthForm />}
                    />
                    <Route
                      className="profile"
                      path="/profile"
                      element={<UserProfile />}
                    />
                    <Route
                      path="/playlists/:id/upload"
                      element={<UploadAudioForm key="uploadAudioForm" />}
                    />
                    <Route
                      path="/playlists/:id"
                      element={<AudioList key="audioList" />}
                    />
                    {/* <Route
                      path="/playlists"
                      element={<PlaylistContainer key="playlistContainer" />}
                    /> */}

                    <Route
                      path="/"
                      element={
                        <PlaylistContainerCollection key="playlistContainersCollection" />
                      }
                    />

                    <Route
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
                      element={<AddGlobalPlaylist key="addGlobalPlaylist" />}
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
