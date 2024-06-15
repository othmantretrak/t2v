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

  //state
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [text, setText] = useState("");
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [images, setImages] = useState<File[]>([]);
  const [selectedSene, setSelectedSene] = useState<Scene>({
    paragraph: "",
    videoUrlOrImageFile: "",
    duration: 0,
  });

  //end state

  const [audioFile, setAudioFile] = useState<File | null>(null); // useState( );
  const [tab, setTab] = useState<
    "TextInput" | "AudioUpload" | "UploadImages" | "VideoSearch"
  >("TextInput");

  const updateScene = (index: number, updatedScene: Scene) => {
    const updatedScenes = [...scenes];
    updatedScenes[index] = updatedScene;
    setScenes(updatedScenes);
  };

  console.log({ scenes });

  const handleAddScene = (index: number, imageUrl: string | File) => {
    const updatedScene: Scene = {
      ...selectedSene,
      videoUrlOrImageFile: imageUrl,
    };
    const updatedScenes = [...scenes];
    updatedScenes[index] = updatedScene;
    setScenes(updatedScenes);
    setSelectedSene(updatedScene); // Update selected scene
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
    <div className="flex  w-screen h-screen text-gray-800">
      <div className="flex justify-center flex-col items-center bg-slate-600 w-1/12 h-full">
        <button onClick={() => setTab("TextInput")}>TextInput</button>
        <button onClick={() => setTab("AudioUpload")}>AudioUpload</button>
        <button onClick={() => setTab("UploadImages")}>UploadImages</button>
        <button onClick={() => setTab("VideoSearch")}>VideoSearch</button>
      </div>

      <div className="flex   w-1/2 h-full text-gray-800">
        {tab === "TextInput" && (
          <TextInput
            updateScenes={setScenes}
            speechRate={speechRate}
            setText={setText}
            text={text}
          />
        )}

        {tab === "AudioUpload" && (
          <AudioUpload audioFile={audioFile} setAudioFile={setAudioFile} />
        )}
        {tab === "UploadImages" && (
          <UploadImages
            scenes={scenes}
            onAddScene={handleAddScene}
            images={images}
            setImages={setImages}
            selectedSene={selectedSene}
            sceneIndex={selectedSceneIndex}
          />
        )}
        {tab === "VideoSearch" && (
          <VideoSearch
            scenes={scenes}
            selectedSene={selectedSene}
            sceneIndex={selectedSceneIndex}
            onAddScene={handleAddScene}
          />
        )}
      </div>

      <div className="flex flex-col text-gray-800  w-1/2 h-full">
        <div className="pt-4 relative w-[680px] h-[380px] ">
          {selectedSene?.videoUrlOrImageFile &&
          !isImageUrl(selectedSene?.videoUrlOrImageFile) ? (
            <div className="w-full h-full  ">
              <video
                src={getVideoUrl(selectedSene?.videoUrlOrImageFile)}
                controls
                className="w-full h-full"
                style={{ height: "inherit" }}
              />
            </div>
          ) : (
            <div className="w-full h-full ">
              <img
                className="w-full h-full object-cover"
                src={getVideoUrl(selectedSene?.videoUrlOrImageFile)}
              />
            </div>
          )}
          <p className="text-gray-800 absolute bottom-10 bg-slate-400 ">
            {selectedSene?.paragraph}
          </p>
        </div>
        <div className="overflow-auto relative h-28 text-gray-800  ">
          <div className="flex justify-center absolute h-full gap-2 items-center ">
            {scenes.map((scene, index) => {
              return (
                <div
                  onClick={() => {
                    setSelectedSene(scene);
                    setSelectedSceneIndex(index); // Update selected scene index
                  }}
                  className="relative mt-4 inline-block"
                  key={index}
                >
                  <div className="">
                    {scene.videoUrlOrImageFile &&
                    !isImageUrl(scene.videoUrlOrImageFile) ? (
                      <div className="w-28">
                        <video
                          src={getVideoUrl(scene.videoUrlOrImageFile)}
                          controls
                          className="w-28 h-16"
                        />
                      </div>
                    ) : (
                      <div className="w-28">
                        <img
                          className="w-28 h-16 object-cover"
                          src={getVideoUrl(scene.videoUrlOrImageFile)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 text-gray-800  text-sm">
                    <SceneTimer
                      paragraph={scene.paragraph}
                      speechRate={speechRate}
                      //startTime={scene.startTime}
                      //endTime={scene.endTime}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storyboard;
