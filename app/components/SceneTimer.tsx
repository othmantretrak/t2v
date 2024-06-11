import React, { useState, useEffect } from "react";
import { calculateSceneDuration } from "../utils/timing";

const SceneTimer = ({
  paragraph,
  speechRate,
}: {
  paragraph: string;
  speechRate: number;
}) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    const duration = calculateSceneDuration(paragraph, speechRate);
    setEndTime(startTime + duration);
  }, [paragraph, speechRate, startTime]);

  return (
    <div className="text-gray-500 border-b-2 ">
      <p>{paragraph}</p>
      <p>
        Start Time: {startTime.toFixed(2)} seconds | End Time:{" "}
        {endTime.toFixed(2)} seconds
      </p>
    </div>
  );
};

export default SceneTimer;
