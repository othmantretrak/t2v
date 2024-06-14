import { FFmpeg } from '@ffmpeg/ffmpeg';
import tsWhammy from 'ts-whammy';

export const calculateSceneDuration = (paragraph: string, speechRate: number) => {
  const wordCount = paragraph.split(' ').length;
  const wordsPerMinute = speechRate;
  const durationInMinutes = wordCount / wordsPerMinute;
  const durationInSeconds = durationInMinutes * 60;
  return durationInSeconds;
};

export function isImageUrl(url: string | File) {
  const imageExtensions = /\.(jpg|jpeg|png|gif)$/;
  //check is a file
  if (url instanceof File) {
    return true
  }
  return imageExtensions.test(url.toLowerCase());
}


//returns url from arg
export const getVideoUrl = (url: string | File) => {
  if (url instanceof File) {
    return URL.createObjectURL(url);
  }
  return url;
};
