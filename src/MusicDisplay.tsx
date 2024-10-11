import React, { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import AudioPlayer from "osmd-audio-player";
import axios from "axios";

const MusicSheet: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bpmInputRef = useRef<HTMLInputElement | null>(null);
  const scoreContainerRef = useRef<HTMLDivElement | null>(null);
  const [osmdInstance, setOsmdInstance] = useState<OpenSheetMusicDisplay | null>(null);
  const [audioPlayer] = useState(new AudioPlayer());
  const [scoreXml, setScoreXml] = useState<string | null>(null); // State để lưu trữ XML nhạc

  // Hàm khởi tạo sheet nhạc
  const initializeSheetMusic = async (xmlData: string) => {
    if (osmdInstance) {
      osmdInstance.load(xmlData);
      osmdInstance.render();
      audioPlayer.playbackSettings.masterVolume = 0; // Thiết lập âm lượng
      audioPlayer.loadScore(osmdInstance); // Tải score vào audio player
    }
  };

  // Hàm lấy score mặc định từ URL
  const fetchDefaultScore = async () => {
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/Audiveris/audiveris/2d6796cbdcb263dcfde9ffaad9db861f6f37eb9e/test/cases/01-klavier/target.xml"
      );
      return response.data; // Trả về dữ liệu XML
    } catch (error) {
      console.error("Error fetching score:", error);
      return null;
    }
  };

  // Hàm thiết lập OSMD
  const setupOsmd = () => {
    if (scoreContainerRef.current) {
      const osmd = new OpenSheetMusicDisplay(scoreContainerRef.current);
      setOsmdInstance(osmd);
    }
  };

  useEffect(() => {
    setupOsmd(); // Thiết lập OSMD khi component được mount
  }, []);

  useEffect(() => {
    const loadDefaultScore = async () => {
      const defaultScoreXml = await fetchDefaultScore();
      if (defaultScoreXml) {
        setScoreXml(defaultScoreXml); // Lưu trữ score mặc định
      }
    };
    loadDefaultScore();
  }, []);

  // Theo dõi thay đổi của scoreXml và gọi lại hàm khởi tạo
  useEffect(() => {
    if (scoreXml) {
      initializeSheetMusic(scoreXml);
    }
  }, [scoreXml]);

  // Xử lý khi người dùng tải lên file XML
  const handleFileLoad = (event: ProgressEvent<FileReader>) => {
    const xmlData = event.target?.result as string;
    if (xmlData) {
      audioPlayer.stop(); 
      setScoreXml(xmlData);
    }
  };

  // Xử lý sự kiện tải file
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = handleFileLoad;
      reader.readAsText(file); // Đọc file XML
    }
  };

  // Xử lý thay đổi BPM
  const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    audioPlayer.setBpm(Number(event.target.value)); // Cập nhật BPM
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange} // Gọi hàm xử lý khi tải file
      />
      <input
        type="number"
        ref={bpmInputRef}
        onChange={handleBpmChange} // Gọi hàm xử lý khi thay đổi BPM
        placeholder="BPM"
      />
      <button id="btn-play" onClick={() => audioPlayer.play()}>
        Play
      </button>
      <button id="btn-pause" onClick={() => audioPlayer.pause()}>
        Pause
      </button>
      <button id="btn-stop" onClick={() => audioPlayer.stop()}>
        Stop
      </button>
      <div id="score" ref={scoreContainerRef}></div>
    </div>
  );
};

export default MusicSheet;
