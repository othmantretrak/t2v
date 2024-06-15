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
    <div className="text-gray-800 ">
      <p
        className="text-wrap p-3 text-[3px] line-clamp-3 w-24 bg-slate-300  "
        style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}
      >
        {paragraph}
      </p>
      <p>{endTime.toFixed(2)} seconds</p>
    </div>
  );
};

export default SceneTimer;
