export interface Video {
    id: string;
    url: string;
    title: string;
    thumbnail: string;
}

export interface Scene {
    paragraph: string;
    video?: Video;
    startTime: number;
    endTime: number;
}