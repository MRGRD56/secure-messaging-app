export enum FileType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
    OTHER = 'OTHER'
}

const getFileType = (mime: string): FileType => {
    if (mime.startsWith('image/')) {
        return FileType.IMAGE;
    }

    if (mime.startsWith('video/')) {
        return FileType.VIDEO;
    }

    if (mime.startsWith('audio/') || mime === 'application/ogg') {
        return FileType.AUDIO;
    }

    return FileType.OTHER;
};

export default getFileType;
