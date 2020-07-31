const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    newPipeline
} = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const config = require('config');

const blobServiceClient = BlobServiceClient.fromConnectionString(config.get('azureConnectionString'));

const uploadOptions = {
    bufferSize: 4 * 1024 * 1024,
    maxBuffers: 20
}


async function uploadImage(containerName, fileName, fileBuffer, imageType) {
    const blobName = `${fileName}${uuidv4()}`;
    const stream = getStream(fileBuffer);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
        await blockBlobClient.uploadStream(stream, uploadOptions.bufferSize, uploadOptions.maxBuffers, {
            blobHTTPHeaders: {
                blobContentType: imageType
            }
        });
        return `https://peachedstorage.blob.core.windows.net/profilepics/${blobName}`;
    } catch (e) {
        return null;
    }

}

export default uploadImage;