"use client";
import React, { useState } from "react";
import { Scene } from "./utils/interfaces";
import TextInput from "./components/TextInput";
import AudioUpload from "./components/AudioUpload";
import VideoSearch from "./components/VideoSearch";
import SceneTimer from "./components/SceneTimer";
import VideoGenerator from "./components/VideoGenerator";

const Storyboard: React.FC = () => {
  const speechRate = 150; // Words per minute
  const [scenes, setScenes] = useState<Scene[]>([]);

  const updateScene = (index: number, updatedScene: Scene) => {
    const updatedScenes = [...scenes];
    updatedScenes[index] = updatedScene;
    setScenes(updatedScenes);
  };

  return (
    <div className="text-gray-500">
      <div className="flex">
        <div>
          <TextInput updateScenes={setScenes} speechRate={speechRate} />
          <AudioUpload />
        </div>
        <VideoSearch scenes={scenes} updateScene={updateScene} />
      </div>
      {scenes.map((scene, index) => (
        <div key={index}>
          <SceneTimer
            paragraph={scene.paragraph}
            speechRate={speechRate}
            //startTime={scene.startTime}
            //endTime={scene.endTime}
          />
          {scene.video && (
            <div>
              <h3>{scene.video.title}</h3>
              <video src={scene.video.url} controls />
            </div>
          )}
        </div>
      ))}
      <VideoGenerator scenes={scenes} audioFile={"audio.mp3"} />
    </div>
  );
};

export default Storyboard;
