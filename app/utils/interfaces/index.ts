
export interface Video {
    id: string;
    url: string;
    title: string;
    thumbnail: string;
    duration: string;
}

export interface Scene {
    paragraph: string;
    videoUrl: string;
    startTime: number;
    endTime: number;
}