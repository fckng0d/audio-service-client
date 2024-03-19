import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AudioList from "./components/audioList/AudioList";
import UploadForm from "./components/uploadAudio/UploadForm";
import Navbar from "./components/navbar/Navbar";
import { AudioProvider } from "./components/AudioContext";
import AudioControls from "./components/audioControls/AudioControls";
import PlaylistContainer from "./components/playlistContainer/PlaylistContainer";
import Sidebar from "./components/sideBar/Sidebar";
import "./App.css";

function App() {
  const showMainControls = false; // Флаг для отображения основных контролов

  return (
    <div className="App">
      <Router>
        <Sidebar className="sidebar" />
        <div className="main-content">
          <Navbar />
          <div className="audio-list-container" style={{ marginLeft: "300px" }}>
            <AudioProvider>
              <AudioControls />
              <Routes>
                <Route path="/audio/upload" element={<UploadForm />} />
                <Route exact path="/playlists/:id" element={<AudioList />} />
                <Route path="/playlists" element={<PlaylistContainer />} />
              </Routes>
            </AudioProvider>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
