import promisifyFileReaderMethod from './promisifyFileReaderMethod';

const readFileAsDataUrl = (blob: Blob): Promise<string> =>
    promisifyFileReaderMethod<string>((reader) => {
        reader.readAsDataURL(blob);
    });

export default readFileAsDataUrl;
