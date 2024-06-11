import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import downloadVideo from '../../backend/download_videos';
import mergeVideos from '../../backend/merge_videos';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { scenes } = req.body;

    try {
        // Ensure the tmp directory exists
        const tmpDir = path.resolve('tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir);
        }

        // Download videos
        const videoPaths = await Promise.all(scenes.map((scene: any, index: number) =>
            downloadVideo(scene.videoUrl, `scene_${index}.mp4`)
        ));

        // Merge videos
        const outputFilename = 'final_video.mp4';
        const finalVideoPath = await mergeVideos(videoPaths, outputFilename);

        // Serve the video
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename=${outputFilename}`);
        const readStream = fs.createReadStream(finalVideoPath);
        readStream.pipe(res);

        // Clean up local files after response
        readStream.on('end', () => {
            videoPaths.forEach(fs.unlinkSync);
            fs.unlinkSync(finalVideoPath);
        });
    } catch (error) {
        res.status(500).json({ error: 'Error generating video' });
    }
}
