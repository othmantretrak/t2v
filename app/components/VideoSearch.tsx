import React, { useState } from "react";
import { Scene, Video } from "../utils/interfaces";

interface VideoSearchProps {
  scenes: Scene[];
  updateScene: (index: number, updatedScene: Scene) => void;
}

const VideoSearch: React.FC<VideoSearchProps> = ({ scenes, updateScene }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Video[]>([]);

  const handleSearch = async (query: string) => {
    // Implement the logic to search for videos using a royalty-free video API or manual upload
    // Update the searchResults state with the search results
    const results: Video[] = [
      {
        id: "1",
        url: "https://media.gettyimages.com/id/1483768736/video/new-dad-holding-sleeping-baby-and-swaying-gently.mp4?s=mp4-640x640-gi&k=20&c=Iknz-AXs6Tptn8Jap7rFN6_pYjx8pT7qLon5tbdQ6z0=",
        title: "zwaj litihal tagost Video 1",
        thumbnail: "/thum1.jpeg",
      },
      {
        id: "2",
        url: "https://media.gettyimages.com/id/1069732508/video/father-and-daughter-planting-flowers.mp4?s=mp4-480x480-gi&k=20&c=jRDWfAsChoQRa8VUrQDhtbIp6t5B0qnch2huWcwfSig=",
        title: "talghat litihal tachlhit Video 2",
        thumbnail: "/thum2.jpeg",
      },
      {
        id: "3",
        url: "https://media.gettyimages.com/id/1460198385/video/split-shot-swimming-alongside-the-largest-fish-in-the-sea-the-whale-shark-in-clear-deep-blue.mp4?s=lwf&w=0&k=20&c=QqcvpPAO0WpmP2yTaOhfKxRlBP8CuAi5SiWNI5qmEeU=",
        title: "zin titiz tagost Video 3",
        thumbnail: "/thum3.jpeg",
      },
      {
        id: "4",
        url: "https://media.gettyimages.com/id/1483768736/video/new-dad-holding-sleeping-baby-and-swaying-gently.mp4?s=mp4-640x640-gi&k=20&c=Iknz-AXs6Tptn8Jap7rFN6_pYjx8pT7qLon5tbdQ6z0=",
        title: "azzan tadssa tagost Video 4",
        thumbnail: "/thum4.jpeg",
      },
      // Add more sample videos as needed
    ];
    setSearchResults(results);
  };

  const handleAssociateVideo = (sceneIndex: number, videoUrl: string) => {
    const updatedScene: Scene = {
      ...scenes[sceneIndex],
      videoUrl,
    };
    updateScene(sceneIndex, updatedScene);
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for videos"
        className="border border-gray-300 rounded-md p-2"
      />
      <button
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md  "
        onClick={() => handleSearch(searchQuery)}
      >
        Search
      </button>

      <div className="mt-4 flex flex-wrap text-gray-500">
        {searchResults.map((video) => (
          <div className="flex flex-col items-center" key={video.id}>
            <div className="w-52 h-52">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-52 h-52"
              />
            </div>
            <h3>{video.title}</h3>
            {scenes.map((scene, index) => (
              <button
                key={index}
                onClick={() => handleAssociateVideo(index, video.url)}
              >
                Associate with Scene {index + 1}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoSearch;
