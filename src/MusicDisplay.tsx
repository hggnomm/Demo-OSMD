import React, { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import AudioPlayer from "osmd-audio-player";
import axios from "axios";

const MusicDisplay: React.FC = () => {
  const scoreRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  const fetchScoreXml = async () => {
    const response = await axios.get(
      "https://raw.githubusercontent.com/Audiveris/audiveris/2d6796cbdcb263dcfde9ffaad9db861f6f37eb9e/test/cases/01-klavier/target.xml"
    );
    return response.data;
  };
  const loadMusic = async (
    osmd: OpenSheetMusicDisplay,
    audioPlayer: AudioPlayer
  ) => {
    try {
      const scoreXml = await fetchScoreXml();
      await osmd.load(scoreXml);
      osmd.render();
      audioPlayer.loadScore(osmd);
      hideLoadingMessage();
      registerButtonEvents(audioPlayer);
    } catch (error) {
      console.error("Error loading music:", error);
    }
  };

  useEffect(() => {
    console.log("Loading music..."); // Kiểm tra xem hàm này có được gọi nhiều lần không

    const osmd = new OpenSheetMusicDisplay(scoreRef.current!);
    const audioPlayer = new AudioPlayer();
    audioPlayerRef.current = audioPlayer;

    loadMusic(osmd, audioPlayer); // Gọi hàm tải nhạc
  }, []);

  const hideLoadingMessage = () => {
    if (loadingRef.current) {
      loadingRef.current.style.display = "none";
    }
  };

  const registerButtonEvents = (audioPlayer: AudioPlayer) => {
    const handlePlay = () => {
      if (audioPlayer.state === "STOPPED" || audioPlayer.state === "PAUSED") {
        audioPlayer.play();
      }
    };

    const handlePause = () => {
      if (audioPlayer.state === "PLAYING") {
        audioPlayer.pause();
      }
    };

    const handleStop = () => {
      if (audioPlayer.state === "PLAYING" || audioPlayer.state === "PAUSED") {
        audioPlayer.stop();
      }
    };

    document.getElementById("btn-play")?.addEventListener("click", handlePlay);
    document
      .getElementById("btn-pause")
      ?.addEventListener("click", handlePause);
    document.getElementById("btn-stop")?.addEventListener("click", handleStop);
  };

  return (
    <div className="container">
      <div ref={loadingRef} id="loading">
        Loading...
      </div>
      <div ref={scoreRef} id="score"></div>
      <div className="button-container">
        <button id="btn-play">Play</button>
        <button id="btn-pause">Pause</button>
        <button id="btn-stop">Stop</button>
      </div>
    </div>
  );
};

export default MusicDisplay;
