const ftp = require('basic-ftp');
const fs = require('fs');

const ftpConfig = {
    host:  process.env.FILE_HOST,
    user: process.env.FILE_USER,
    password: process.env.FILE_PASSWORD,
    secure: false // or true if using FTPS
};

async function uploadFile(localFilePath, remoteFilePath) {
    const client = new ftp.Client();
    client.ftp.verbose = false;

    try {
        await client.access(ftpConfig);

        // Ensure directory exists before uploading
        const dir = remoteFilePath.substring(0, remoteFilePath.lastIndexOf('/'));
        if (dir) {
            await client.ensureDir(dir);
        }

        await client.uploadFrom(localFilePath, remoteFilePath);
        console.log("✅ Upload successful");
    } catch (err) {
        console.error("❌ Upload failed:", err.message);
    } finally {
        client.close();
    }
}

async function deleteFile(remoteFilePath) {
    const client = new ftp.Client();
    client.ftp.verbose = false;

    try {
        await client.access(ftpConfig);
        await client.remove(remoteFilePath);
        console.log("✅ File deleted");
    } catch (err) {
        console.error("❌ Delete failed:", err.message);
    } finally {
        client.close();
    }
}

module.exports = { uploadFile, deleteFile };