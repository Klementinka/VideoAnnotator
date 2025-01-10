const {google} = require("googleapis");
const path = require("path");
const fs = require("fs");

const API_KEY = "AIzaSyBqb-lZLqa_bSQDFcX89Tu3EVlbU2oyhJY";
const CLIENT_ID = "207542469934-k8oqld6o88ah3mqom7u8kc5j9hhd8nm6.apps.googleusercontent.com";
const CLIENT_SECRET ="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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN = "1//04x6Xc-cnVoCHCgYIARAAGAQSNwF-L9Irm-vFiFJQfF7tRkZFZAu3D7Tn2E_hALD8Qjm34IvLEh5dtnsJBAiDnPEaHGOlWbMA6Lg";


const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

const drive = google.drive({
    version: "v3",
    auth: oauth2Client
});

const filePath = path.join(__dirname, "6077692-uhd_2160_3840_25fps.mp4");

async function uploadFile() {
    try {
        const response = await drive.files.create({
            requestBody: {
                name: "tesetVideo.mp4",
                mimeType: "video/mp4",
                parents: ["14IWnQhBfaX7-OfVPC_q7tYc_VqzWLIKz"],
            },
            media: {
                mimeType: "video/mp4",
                body: fs.createReadStream(filePath)
            }
        });

        console.log(response.data);
    } catch (error) {
        console.log(error.message);
    }
}

uploadFile();