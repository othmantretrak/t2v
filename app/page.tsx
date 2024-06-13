"use client";
import React, { useState } from "react";
import { Scene } from "./utils/interfaces";
import TextInput from "./components/TextInput";
import AudioUpload from "./components/AudioUpload";
import VideoSearch from "./components/VideoSearch";
import SceneTimer from "./components/SceneTimer";
import VideoGenerator from "./components/VideoGenerator";
import NoSSRWrapper from "./components/NoSSRWrapper";
import UploadImages from "./components/UploadImages";
import { isImageUrl } from "./utils/timing";

const Storyboard: React.FC = () => {
  const speechRate = 145; // Words per minute
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null); // useState( );

  const updateScene = (index: number, updatedScene: Scene) => {
    const updatedScenes = [...scenes];
    updatedScenes[index] = updatedScene;
    setScenes(updatedScenes);
  };

  console.log({ scenes });

  const handleAddScene = (sceneIndex: number, imageUrl: string) => {
    const updatedScene: Scene = {
      ...scenes[sceneIndex],
      videoUrl: imageUrl,
    };
    updateScene(sceneIndex, updatedScene);
  };
  return (
    <NoSSRWrapper>
      <div className="flex text-gray-500">
        <div className="flex w-1/2">
          <div className="text-input w-full">
            <TextInput updateScenes={setScenes} speechRate={speechRate} />
            <AudioUpload audioFile={audioFile} setAudioFile={setAudioFile} />
            <UploadImages scenes={scenes} onAddScene={handleAddScene} />
          </div>
        </div>
        <div className="flex flex-col">
          <VideoSearch scenes={scenes} updateScene={updateScene} />
          <div className="flex">
            {scenes.map((scene, index) => {
              return (
                <div className=" mt-4" key={index}>
                  {scene.videoUrl && !isImageUrl(scene.videoUrl) ? (
                    <div className="w-72 h-72  ">
                      <video
                        src={scene.videoUrl}
                        controls
                        className="w-full "
                        style={{ height: "inherit" }}
                      />
                    </div>
                  ) : (
                    <div className="w-72 ">
                      <img src={scene.videoUrl} />
                    </div>
                  )}
                  <SceneTimer
                    paragraph={scene.paragraph}
                    speechRate={speechRate}
                    //startTime={scene.startTime}
                    //endTime={scene.endTime}
                  />
                </div>
              );
            })}
          </div>
          <VideoGenerator scenes={scenes} audioFile={audioFile} />
        </div>
      </div>
    </NoSSRWrapper>
  );
};

export default Storyboard;
