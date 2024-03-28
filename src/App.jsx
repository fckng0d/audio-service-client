import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AudioList from "./components/audioList/AudioList";
import UploadForm from "./components/uploadAudio/UploadForm";
import Navbar from "./components/navbar/Navbar";
import { AudioProvider } from "./components/AudioContext";
import AudioControls from "./components/audioControls/AudioControls";
import PlaylistContainer from "./components/playlistContainer/PlaylistContainer";
import Sidebar from "./components/sideBar/Sidebar";
import AddGlobalPlaylist from "./components/addGlobalPlaylist/AddGlobalPlaylist";
import "./App.css";

function App() {
  const showMainControls = false; 

  return (
    <div className="App">
      <Router>
        <div className="main-content">
          <Navbar />
          <div style={{ marginLeft: "300px" }}>
            <AudioProvider>
              <Sidebar className="sidebar" />
              <Routes>
                <Route path="/playlists/:id/upload" element={<UploadForm />} />
                <Route path="/playlists/:id" element={<AudioList />} />
                <Route path="/playlists" element={<PlaylistContainer />} />
                <Route path="/playlists/add" element={<AddGlobalPlaylist />} />
              </Routes>
              <AudioControls />
            </AudioProvider>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
