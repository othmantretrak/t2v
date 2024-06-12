import React, { useState } from "react";
import { Scene, Video } from "../utils/interfaces";

interface VideoSearchProps {
  scenes: Scene[];
  updateScene: (index: number, updatedScene: Scene) => void;
}

const VideoSearch: React.FC<VideoSearchProps> = ({ scenes, updateScene }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Video[]>([]);

  console.log({ searchResults });
  const handleSearch = async (query: string) => {
    if (!query) return; // Handle empty search cases

    // Replace hardcoded results with Pixabay API call
    const apiKey = "14618037-0b5f38c85bf6f1bbf5fe4810d"; // Replace with your actual API key
    const response = await fetch(
      `https://pixabay.com/api/videos/?key=${apiKey}&q=${query}`
    );
    const data = await response.json();

    if (data.hits) {
      console.log({ data });
      const videoResults = data.hits.map((hit: any) => ({
        id: hit.id,
        duration: hit.duration,
        url: hit.videos?.tiny.url || hit.videos?.small.url, // Adjust URL based on desired video quality
        title: hit.tags, // Or use a different property for title if available
        thumbnail: hit.videos?.tiny.thumbnail || hit.videos?.small.thumbnail,
      }));
      setSearchResults(videoResults);
    } else {
      // Handle no results case (optional)
      console.log("No video results found.");
    }
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

      <div className="mt-4 flex flex-wrap overflow-y-auto h-96 scroll-auto text-gray-500">
        {searchResults.map((video) => (
          <div
            className="flex flex-col items-center w-52 text-sm "
            key={video.id}
          >
            <div className="w-52 h-52">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-52 h-52"
              />
            </div>
            <span className="w-10 bg-red-700 text-white">{video.duration}</span>
            <h3 className=" w-52">{video.title}</h3>
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
