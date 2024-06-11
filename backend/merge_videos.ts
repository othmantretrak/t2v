import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const mergeVideos = (videoPaths: string[], outputFilename: string): Promise<string> => {
    const fileListPath = path.resolve('tmp', 'filelist.txt');
    const fileListContent = videoPaths.map(videoPath => `file '${videoPath}'`).join('\n');
    fs.writeFileSync(fileListPath, fileListContent);

    const outputPath = path.resolve('tmp', outputFilename);

    return new Promise((resolve, reject) => {
        exec(`ffmpeg -f concat -safe 0 -i ${fileListPath} -c copy ${outputPath}`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(outputPath);
            }
        });
    });
};

export default mergeVideos;
