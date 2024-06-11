import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export async function loadFFmpeg() {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    return ffmpeg;
}

export async function generateVideo(
    ffmpeg: FFmpeg,
    paragraphs: string[],
    audioFile: File | null,
    sceneTimings: Array<{ startTime: number; endTime: number }>
) {
    if (!audioFile) return;

    await ffmpeg.writeFile('audio.mp3', await fetchFile(audioFile));

    let inputOptions = '-i audio.mp3';
    let filterOptions = '';
    let outputOptions = '';

    paragraphs.forEach((paragraph, index) => {
        const { startTime, endTime } = sceneTimings[index];
        inputOptions += ` -i video_${index}.mp4`;
        filterOptions += `[${index + 1}]drawtext=fontfile=/path/to/font.ttf:text='${paragraph}':fontcolor=white:fontsize=24:x=(w-tw)/2:y=h-th-20[v${index}];`;
        outputOptions += `[v${index}][${index}]overlay[v${index + 1}];`;
    });

    filterOptions += `[v${paragraphs.length}]scale=1280:720[v]`;
    outputOptions += '[v]';

    const command = `${inputOptions} ${filterOptions} ${outputOptions} -c:v libx264 -c:a aac -movflags +faststart output.mp4`;

    await ffmpeg.exec(command.split(' '));

    const data = await ffmpeg.readFile('output.mp4') as Uint8Array;
    const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
    return videoBlob;
}

