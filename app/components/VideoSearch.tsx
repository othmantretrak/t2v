import React, { useEffect, useRef, useState } from "react";
import { Scene, Video } from "../utils/interfaces";
import { freeVideos } from "../utils/freeVideos";
import { siteUrl } from "../utils/constants";

interface VideoSearchProps {
  scenes: Scene[];
  onAddScene: (sceneIndex: number, image: string | File) => void;
  selectedSene: Scene;
  sceneIndex: number;
}

const VideoSearch: React.FC<VideoSearchProps> = ({
  scenes,
  onAddScene,
  selectedSene,
  sceneIndex,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Video[]>(freeVideos);
  const cloudinaryVideosRef = useRef<Video[]>([]);

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

  // Fetch videos from Cloudinary when the component mounts
  useEffect(() => {
    const fetchCloudinaryVideos = async () => {
      if (cloudinaryVideosRef.current.length > 0) {
        // If videos are already fetched, use the cached result
        setSearchResults(cloudinaryVideosRef.current);
        return;
      }

      try {
        const response = await fetch(`${siteUrl}/api/cloudinary-videos`);
        const data = await response.json();
        console.log({ data });
        /*   const videoResults = data.resources.map((video: any) => ({
          id: video.asset_id,
          duration: video.duration,
          url: video.secure_url,
          title: video.public_id,
          thumbnail: video.secure_url, // Cloudinary can generate thumbnails, adjust as needed
        })); */

        cloudinaryVideosRef.current = data;
        setSearchResults(data);
      } catch (error) {
        console.error("Error fetching videos from Cloudinary:", error);
      }
    };

    fetchCloudinaryVideos();
  }, []);

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

      <div className="mt-4 flex flex-wrap overflow-y-auto  gap-x-3  scroll-auto text-gray-500">
        {searchResults.map((video, i) => (
          <div
            className="flex flex-col flex-wrap w-52 items-center text-sm "
            key={i}
            onClick={() => onAddScene(sceneIndex, video.url)}
          >
            <div className="">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-32 object-cover"
              />
            </div>
            <span className="w-10 bg-red-700 text-white">{video.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoSearch;
