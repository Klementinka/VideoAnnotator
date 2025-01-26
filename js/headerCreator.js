/**
 * headerCreator.js
 * This script dynamically creates a header and includes a modal form
 * for uploading videos to Google Drive. It also handles storing/fetching
 * the access token in local storage.
 */

function createHeader() {
    console.log('creating header');
    return `
    <nav class="navbar">
        <header>
            <div class="title-container">
                <h1 class="mainTitle">
                    <a href="http://localhost/VideoAnnotator/index.html${window.location.search}">Video Annotation Tool</a>
                </h1>
            </div>
            <div class="header-buttons">
                <button id="addSubBtn">Add Subtitle</button>
                <button id="addVideoBtn">Add Video</button>
                <button id="deleteVideoBtn">Delete Video</button>
                <button id="profileBtn">Profile</button>
            </div>
        </header>
        <ul>
            <li><a href="explore.html">Explore</a></li>
            <li><a href="upload.html">Upload</a></li>
            <li><a href="editSubtitlesLobby.html">Add Subtitles</a></li>
            <li><a href="editLobby.html">Edit Videos</a></li>
        </ul>
        
        <!-- Video Modal -->
        <div id="videoModal" class="modal" style="display: none;">
            <div class="modal-content">
                <span id="closeModal" class="close">&times;</span>
                <h2>Add New Video</h2>
                <form id="addVideoForm" enctype="multipart/form-data">
                    <label for="videoPath">Upload Video:</label>
                    <input type="file" id="videoPath" name="videoPath" placeholder="Enter video path" required />
                    
                    <label for="videoName">Video Name:</label>
                    <input type="text" id="videoName" name="videoName" placeholder="Enter video name" required />

                    <label for="videoType">Video Type:</label>
                    <div class="slider-container">
                        <label class="switch">
                            <input type="checkbox" id="videoType" name="videoType" />
                            <span class="slider"></span>
                        </label>
                        <span id="videoTypeLabel">Public</span>
                    </div>

                    <div class="modal-buttons">
                        <button type="button" id="saveBtn">Save</button>
                        <button type="button" id="cancelBtn">Cancel</button>
                    </div>

                </form>
            </div>
        </div>

        <!-- Subtitle Modal -->
        <div id="subtitlesModal" class="modal" style="display: none;">
            <div class="modal-content">
                <span id="closeSubtitlesModal" class="close">&times;</span>
                <h2>Add Subtitles</h2>
                <form id="addSubtitlesForm" enctype="multipart/form-data">
                    <label for="subtitlesFile">Upload Subtitles:</label>
                    <input type="file" id="subtitlesFile" name="subtitlesFile" accept=".srt,.vtt,.txt" required />

                    <label for="videoId">Video ID:</label>
                    <input type="text" id="videoId" name="videoId" placeholder="Enter associated Video ID" required />

                    <div class="modal-buttons">
                        <button type="button" id="saveSubBtn">Save</button>
                        <button type="button" id="cancelSubBtn">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="delete-overlay"></div>
        <div id="delete" class="delete">
            <label for="videoIndex">Enter id of video:</label>
            <input type="number" id="videoIndex" class="idInput">
            <button id="submitIdButton">Delete</button>
        </div>
    </nav>
    `;
}

const headerString = createHeader();
const headerFragment = document.createRange().createContextualFragment(headerString);
document.getElementById('title').appendChild(headerFragment);

document.addEventListener('DOMContentLoaded', () => {
    const videoModal = document.getElementById('videoModal');
    const subtitlesModal = document.getElementById('subtitlesModal');
    const closeModal = document.getElementById('closeModal');
    const closeSubtitlesModal = document.getElementById('closeSubtitlesModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelSubBtn = document.getElementById('cancelSubBtn');
    const addVideoBtn = document.getElementById('addVideoBtn');
    const addSubBtn = document.getElementById('addSubBtn');
    const saveBtn = document.getElementById('saveBtn');
    const saveSubBtn = document.getElementById('saveSubBtn');
    const deleteVideoBtn = document.getElementById('deleteVideoBtn');
    const deleteOverlay = document.getElementById('delete-overlay');
    const deletePopup = document.getElementById('delete');
    const submitDelReq = document.getElementById('submitIdButton');

    // Handle Add Video Modal
    const showModal = () => videoModal.style.display = 'block';
    const hideModal = () => videoModal.style.display = 'none';

    addVideoBtn.addEventListener('click', showModal);
    closeModal.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);

    saveBtn.addEventListener('click', () => {
        const form = document.getElementById('addVideoForm');
        const formData = new FormData(form);
        const storedAccessToken = localStorage.getItem('access_token');
        if (storedAccessToken) {
            formData.append('access_token', storedAccessToken);
        }

        fetch('php/uploadVideo.php', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert(data.message || 'Video uploaded successfully!');
                } else {
                    alert('Error: ' + (data.message || 'Unknown error.'));
                }
            })
            .catch((error) => alert('An error occurred while processing your request.'));
        hideModal();
    });

    // Handle Add Subtitle Modal
    const showSubtitlesModal = () => subtitlesModal.style.display = 'block';
    const hideSubtitlesModal = () => subtitlesModal.style.display = 'none';

    addSubBtn.addEventListener('click', showSubtitlesModal);
    closeSubtitlesModal.addEventListener('click', hideSubtitlesModal);
    cancelSubBtn.addEventListener('click', hideSubtitlesModal);

    saveSubBtn.addEventListener('click', () => {
        const form = document.getElementById('addSubtitlesForm');
        const formData = new FormData(form);
        const storedAccessToken = localStorage.getItem('access_token');
        if (storedAccessToken) {
            formData.append('access_token', storedAccessToken);
        }

        fetch('php/uploadSubtitles.php', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert(data.message || 'Subtitles uploaded successfully!');
                } else {
                    alert('Error: ' + (data.message || 'Unknown error.'));
                }
            })
            .catch((error) => alert('An error occurred while processing your request.'));
        hideSubtitlesModal();
    });

    // Handle Delete Video Modal
    deleteVideoBtn.addEventListener('click', () => {
        deleteOverlay.style.display = 'block';
        deletePopup.style.display = 'flex';
    });

    submitDelReq.addEventListener('click', () => {
        const videoId = videoIndex.value;
        if (videoId) {
            const storedAccessToken = localStorage.getItem('access_token');
            if (storedAccessToken) {
                fetch('php/deleteVideo.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        videoId: videoId,
                        access_token: storedAccessToken,
                    }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.success) {
                            alert(data.message || 'Video deleted successfully!');
                        } else {
                            alert('Error: ' + (data.message || 'Unknown error.'));
                        }
                    })
                    .catch((error) => alert('An error occurred while processing your request.'));
            }
        } else {
            alert('Please enter a valid video ID.');
        }
        deleteOverlay.style.display = 'none';
        deletePopup.style.display = 'none';
    });

    deleteOverlay.addEventListener('click', () => {
        deleteOverlay.style.display = 'none';
        deletePopup.style.display = 'none';
    });
});
