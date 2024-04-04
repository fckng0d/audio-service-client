import React, { useState, useContext, createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import AudioList from "./components/audioList/AudioList";
import UploadForm from "./components/uploadAudio/UploadForm";
import Navbar from "./components/navbar/Navbar";
import { AudioProvider } from "./components/AudioContext";
import AudioControls from "./components/audioControls/AudioControls";
import PlaylistContainer from "./components/playlistContainer/PlaylistContainer";
import Sidebar from "./components/sideBar/Sidebar";
import AddGlobalPlaylist from "./components/addGlobalPlaylist/AddGlobalPlaylist";
import "./App.css";

const HistoryContext = createContext();
export const useHistoryContext = () => useContext(HistoryContext);

function App() {
  const [isPressedNavButton, setIsPressedNavButton] = useState(false);
  const [isBackAvailable, setIsBackAvailable] = useState(false);
  const [isForwardAvailable, setIsForwardAvailable] = useState(false);

  const setLastStateKey = () => {
    // console.log(isPressedNavButton);

    if (!isPressedNavButton) {
      localStorage.setItem(
        "lastStateKey",
        JSON.stringify(window.history.state)
      );
    }

    setIsPressedNavButton(false);

    const isFirstPage = window.history.state?.isFirstPage;

    const currentState = window.history.state;
    const lastStateStr = localStorage.getItem("lastStateKey");
    const lastState = lastStateStr ? JSON.parse(lastStateStr) : null;

    const isLastPage =
      currentState && lastState && currentState.key === lastState.key;

    setIsBackAvailable(!isFirstPage);
    setIsForwardAvailable(!isLastPage);
  };

  return (
    <div className="App">
      <HistoryContext.Provider
        value={{
          setLastStateKey,
          isBackAvailable,
          isForwardAvailable,
          setIsPressedNavButton,
        }}
      >
        <Router>
          <div className="main-content">
            <Navbar />
            <div style={{ marginLeft: "300px" }}>
              <AudioProvider>
                <Sidebar className="sidebar" />
                <Routes>
                  <Route
                    path="/playlists/:id/upload"
                    element={<UploadForm key="uploadForm" />}
                  />
                  <Route
                    path="/playlists/:id"
                    element={<AudioList key="audioList" />}
                  />
                  <Route
                    path="/playlists"
                    element={<PlaylistContainer key="playlistContainer" />}
                  />
                  <Route
                    path="/playlists/add"
                    element={<AddGlobalPlaylist key="addGlobalPlaylist" />}
                  />
                </Routes>
                <AudioControls />
              </AudioProvider>
            </div>
          </div>
        </Router>
      </HistoryContext.Provider>
    </div>
  );
}

export default App;
