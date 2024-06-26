import React, { useState, useEffect } from "react";
import { Scene } from "../utils/interfaces";
import { calculateSceneDuration } from "../utils/timing";
import { splitTextIntoParagraphs } from "../utils/text";

interface TextInputProps {
  updateScenes: (scenes: Scene[]) => void;
  speechRate: number;
  setText: (text: string) => void;
  text: string;
}

const TextInput: React.FC<TextInputProps> = ({
  updateScenes,
  speechRate,
  setText,
  text,
}) => {
  const [paragraphs, setParagraphs] = useState<string[]>([]);

  useEffect(() => {
    const scenes: Scene[] = paragraphs.map((paragraph, index) => {
      const duration = calculateSceneDuration(paragraph, speechRate);
      return {
        paragraph,
        videoUrlOrImageFile: "",
        duration,
      };
    });
    updateScenes(scenes);
  }, [paragraphs, speechRate, updateScenes]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setParagraphs(splitTextIntoParagraphs(newText));
  };

  return (
    <div className="w-full">
      <textarea
        className=" text-gray-800 w-full h-full px-4"
        value={text}
        onChange={handleTextChange}
        rows={10}
        placeholder="Enter your script or content here..."
      />
    </div>
  );
};

export default TextInput;
