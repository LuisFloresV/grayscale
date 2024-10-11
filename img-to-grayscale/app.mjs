// Import required AWS SDK and Node.js modules
import AWS from "aws-sdk"
import { Jimp, JimpMime } from "jimp"

const s3 = new AWS.S3();

export const lambdaHandler = async (event) => {
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    try {

        const objectData = await s3.getObject({
            Bucket: bucketName,
            Key: objectKey
        }).promise();

        const image = await Jimp.read(objectData.Body);

        image.greyscale();

        const output = await image.getBuffer(JimpMime.jpeg);

        const compressedKey = `${objectKey}`.replace('upload', 'grayscale');
        await s3.putObject({
            Bucket: bucketName,
            Key: compressedKey,
            Body: output,
            ContentType: 'image/jpeg'
        }).promise();

        console.log('Image to grayscale convertion done :)' + compressedKey);
    } catch (err) {
        console.error('Error transforming the image:', err);
    }
};
