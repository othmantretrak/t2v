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
        url: "/v1.mp4",
        title: "zwaj litihal tagost Video 1",
        thumbnail: "/thum1.jpeg",
      },
      {
        id: "2",
        url: "/v2.mp4",
        title: "talghat litihal tachlhit Video 2",
        thumbnail: "/thum2.jpeg",
      },
      {
        id: "3",
        url: "/v3.mp4",
        title: "zin titiz tagost Video 3",
        thumbnail: "/thum3.jpeg",
      },
      {
        id: "4",
        url: "/v4.mp4",
        title: "azzan tadssa tagost Video 4",
        thumbnail: "/thum4.jpeg",
      },
      // Add more sample videos as needed
    ];
    setSearchResults(results);
  };

  const handleAssociateVideo = (sceneIndex: number, video: Video) => {
    const updatedScene: Scene = {
      ...scenes[sceneIndex],
      video,
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
            <img src={video.thumbnail} alt={video.title} width={200} />
            <h3>{video.title}</h3>
            {scenes.map((scene, index) => (
              <button
                key={index}
                onClick={() => handleAssociateVideo(index, video)}
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
