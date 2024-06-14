"use client";
import React, { useState } from "react";
import { Scene } from "./utils/interfaces";
import TextInput from "./components/TextInput";
import AudioUpload from "./components/AudioUpload";
import VideoSearch from "./components/VideoSearch";
import SceneTimer from "./components/SceneTimer";
import NoSSRWrapper from "./components/NoSSRWrapper";
import UploadImages from "./components/UploadImages";
import { getVideoUrl, isImageUrl } from "./utils/timing";

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

  const handleAddScene = (sceneIndex: number, imageUrl: string | File) => {
    const updatedScene: Scene = {
      ...scenes[sceneIndex],
      videoUrlOrImageFile: imageUrl,
    };
    updateScene(sceneIndex, updatedScene);
  };
  const handleGenerateVideo = async () => {
    // Create a FormData instance
    const formData = new FormData();

    // Append scenes to the FormData
    formData.append("scenes", JSON.stringify(scenes));

    // Append audioFile to the FormData
    if (audioFile) {
      formData.append("audioFile", audioFile);
    }

    // Append videoFiles to the FormData
    scenes.forEach((scene, index) => {
      if (scene.videoUrlOrImageFile instanceof File) {
        formData.append(`imageFile-${index}`, scene.videoUrlOrImageFile);
      }
    });

    try {
      // Send FormData to backend using fetch API
      const response = await fetch("http://localhost:5000/merge-videos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error generating video");
      }

      const responseData = await response.json();
      console.log("Merged video URL:", responseData.videoUrlOrImageFile);

      // Handle successful response (e.g., display generated video URL)
      // ...
    } catch (error) {
      console.error("Error sending data:", error);
      // Handle errors (e.g., display error message)
      // ...
    }
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
                  {scene.videoUrlOrImageFile &&
                  !isImageUrl(scene.videoUrlOrImageFile) ? (
                    <div className="w-72 h-72  ">
                      <video
                        src={getVideoUrl(scene.videoUrlOrImageFile)}
                        controls
                        className="w-full "
                        style={{ height: "inherit" }}
                      />
                    </div>
                  ) : (
                    <div className="w-72 ">
                      <img src={getVideoUrl(scene.videoUrlOrImageFile)} />
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
          <button onClick={handleGenerateVideo}>Generate Video</button>
          {/* <VideoGenerator scenes={scenes} audioFile={audioFile} /> */}
        </div>
      </div>
    </NoSSRWrapper>
  );
};

export default Storyboard;
