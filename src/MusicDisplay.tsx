import React, { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import axios from "axios";
import AudioPlayer from "osmd-audio-player"; // Import thư viện AudioPlayer

const fetchMusicXML = async (url: string): Promise<string> => {
  const response = await axios.get(url);
  return response.data;
};

const MUSIC_XML_URL =
  "https://raw.githubusercontent.com/Audiveris/audiveris/2d6796cbdcb263dcfde9ffaad9db861f6f37eb9e/test/cases/01-klavier/target.xml";

const MusicDisplayAndPlayer: React.FC = () => {
  const osmdContainerRef = useRef<HTMLDivElement | null>(null);
   // Tham chiếu đến container hiển thị sheet music

  const [osmd, setOsmd] = useState<OpenSheetMusicDisplay | null>(null); 
  // Trạng thái để lưu OpenSheetMusicDisplay instance
  
  const [audioPlayer, setAudioPlayer] = useState<AudioPlayer | null>(null); 
  // Trạng thái để lưu AudioPlayer instance

  // Tải và hiển thị file MusicXML
  const initializeSheetMusicDisplay = async () => {
    debugger
    try {
      const musicXmlData = await fetchMusicXML(MUSIC_XML_URL); // Fetch dữ liệu MusicXML
      if (osmdContainerRef.current) {
        const osmdInstance = new OpenSheetMusicDisplay(osmdContainerRef.current); // Tạo OpenSheetMusicDisplay
        await osmdInstance.load(musicXmlData); // Load dữ liệu MusicXML
        osmdInstance.render(); // Hiển thị bản nhạc lên giao diện
        setOsmd(osmdInstance); // Lưu instance của OSMD vào state

        // Tạo AudioPlayer và kết nối nó với OSMD
        const player = new AudioPlayer();
        player.loadScore(osmdInstance); // Nạp dữ liệu của OSMD vào AudioPlayer
        setAudioPlayer(player); // Lưu instance của AudioPlayer vào state
      }
    } catch (error) {
      console.error("Lỗi khi tải hoặc hiển thị MusicXML:", error);
    }
  };

  // Khi component được mount, tải và hiển thị bản nhạc
  useEffect(() => {
    initializeSheetMusicDisplay();
  }, []);

  // Hàm phát nhạc
  const handlePlayMusic = () => {
    if (audioPlayer) {
      audioPlayer.play(); // Phát nhạc từ AudioPlayer
    }
  };

  // Hàm dừng phát nhạc
  const handleStopMusic = () => {
    if (audioPlayer) {
      audioPlayer.stop(); // Dừng phát nhạc từ AudioPlayer
    }
  };

  return (
    <div>
      <h2>MusicXML Display and Player</h2>
      <div
        ref={osmdContainerRef}
        style={{
          border: "1px solid black",
          marginBottom: "20px",
          padding: "10px",
        }}
      />

      <button onClick={handlePlayMusic} disabled={!audioPlayer}>
        Play Music
      </button>

      <button onClick={handleStopMusic} disabled={!audioPlayer}>
        Stop Music
      </button>
    </div>
  );
};

export default MusicDisplayAndPlayer;
