import { FFmpeg } from '@ffmpeg/ffmpeg';
import tsWhammy from 'ts-whammy';

export const calculateSceneDuration = (paragraph: string, speechRate: number) => {
  const wordCount = paragraph.split(' ').length;
  const wordsPerMinute = speechRate;
  const durationInMinutes = wordCount / wordsPerMinute;
  const durationInSeconds = durationInMinutes * 60;
  return durationInSeconds;
};

export function isImageUrl(url: string) {
  const imageExtensions = /\.(jpg|jpeg|png|gif)$/;
  return imageExtensions.test(url.toLowerCase());
}


//generate props type
declare global {
  interface Window {
    Whammy: any;
  }
}
const generateVideoFromImage = async (ffmpeg: FFmpeg, image: File, duration: number): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure ffmpeg.wasm is initialized before this function call

      // Read the image file as an ArrayBuffer
      const imgData: ArrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(image);
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
      })

      const imgDataArray = new Uint8Array(imgData);

      // Write the image data to ffmpeg.wasm filesystem
      await ffmpeg.writeFile('input.png', imgDataArray);

      // Create a video from the image
      await ffmpeg.exec([
        '-loop', '1',
        '-t', `${duration + 0.8}`,

        '-i', 'input.png',
        '-vf', `scale=1280:720,format=yuv420p`,  // Scale and format
        '-pix_fmt', 'yuv420p',
        '-r', '1', // Adjust frame rate
        'output.mp4',
      ]);

      // Check for ffmpeg command execution errors


      // Read the generated MP4 file
      const mp4Data = await ffmpeg.readFile('output.mp4') as Uint8Array;
      const mp4Blob = new Blob([mp4Data.buffer], { type: 'video/mp4' });
      const mp4Url = URL.createObjectURL(mp4Blob);

      resolve(mp4Url);
    } catch (error) {
      console.error('Error generating video:', error);
      reject('Error generating video');
    }
  });
};
export default generateVideoFromImage;
