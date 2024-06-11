import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const PEXELS_API_KEY = 'YOUR_PEXELS_API_KEY'; // Replace with your Pexels API key

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { query } = req.query;

    try {
        const response = await axios.get('https://api.pexels.com/videos/search', {
            headers: { Authorization: PEXELS_API_KEY },
            params: { query, per_page: 5 }
        });
        res.status(200).json({ videos: response.data.videos });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching videos' });
    }
}
