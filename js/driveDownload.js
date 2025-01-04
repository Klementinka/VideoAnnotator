const CLIENT_ID = window.config.CLIENT_ID;
const API_KEY = window.config.API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const FILE_ID = '1M0aWsRUBKxhDcloZu2RU1CSzzR7kBeqc';
// the above line hard codes the Dosi video

function loadGapi() {
    gapi.load('client:auth2', initializeGapi);
}

function initializeGapi() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: SCOPES,
    }).then(() => {
        document.getElementById('authorize').onclick = handleAuthClick;
        document.getElementById('downloadFile').onclick = downloadFile;
    });
}

function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn().then(() => {
        document.getElementById('downloadFile').disabled = false;
        alert('Authentication successful!');
    });
}

function downloadFile() {
    gapi.client.drive.files.get({
        fileId: FILE_ID,
        alt: 'media',
    }).then((response) => {
        const fileContent = response.body;
        const blob = new Blob([fileContent], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video.mp4';
        a.click();
        URL.revokeObjectURL(url); // Clean up the URL
    }).catch((error) => {
        console.error('Error downloading file: ', error);
    });
}

document.addEventListener('DOMContentLoaded', loadGapi);