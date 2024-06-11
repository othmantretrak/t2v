import fs from 'fs';
import path from 'path';
import axios from 'axios';

const downloadVideo = async (url: string, filename: string): Promise<string> => {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    const filePath = path.resolve('tmp', filename);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
    });
};

export default downloadVideo;
