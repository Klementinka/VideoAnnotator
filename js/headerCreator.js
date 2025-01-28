/**
 * headerCreator.js
 * This script dynamically creates a header and includes a modal form
 * for uploading videos to Google Drive. It also handles storing/fetching
 * the access token in local storage.
 */

function createHeader() {
    const currentPath = window.location.pathname;
    const relativePath = currentPath.substring(0, currentPath.lastIndexOf('/')).substring(1);
    return `
    <nav class="navbar">
        <header>
            <section class="title-container">
                <h1 class="mainTitle">
                    <a href="http://localhost/${relativePath}/index.html${window.location.search}">Video Annotation Tool</a>
                </h1>
            </section>
            <section class="header-buttons">
                <a href="profile.html"><img src="assets/profile.png" class="profile"></a>
            </section>
        </header>
        <ul>
            <li><button id="addVideoBtn" class="navbar-menu">Upload Video</button></li>
            <li><button id="deleteVideoBtn" class="navbar-menu">Delete Video</button></li>
            <li><button id="censorBtn" class="navbar-menu">Censor</button></li>
            <li><button id="subtitlesBtn" class="navbar-menu">Add Subtitles</button></li>
            <li><button id="editVideoBtn" class="navbar-menu">Edit Video</button></li>
            <li><button id="uploadSubtitlesBtn" class="navbar-menu">Upload Subtitles</button></li>
        </ul>
        
        <!-- Video Modal -->
        <section id="videoModal" class="modal" style="display: none;">
            <section class="modal-content">
                <span id="closeModal" class="close">&times;</span>
                <h2>Add New Video</h2>
                <form id="addVideoForm" enctype="multipart/form-data">
                    <label for="videoPath">Upload Video:</label>
                    <input type="file" id="videoPath" name="videoPath" placeholder="Enter video path" required />
                    
                    <label for="videoName">Video Name:</label>
                    <input type="text" id="videoName" name="videoName" placeholder="Enter video name" required />

                    <label for="videoType">Video Type:</label>
                    <section class="slider-container">
                        <label class="switch">
                            <input type="checkbox" id="videoType" name="videoType" />
                            <span class="slider"></span>
                        </label>
                        <span id="videoTypeLabel">Public</span>
                    </section>

                    <section class="modal-buttons">
                        <button type="button" id="saveBtn">Save</button>
                        <button type="button" id="cancelBtn">Cancel</button>
                    </section>

                </form>
            </section>
        </section>

        <!-- Subtitle Modal -->
        <section id="subtitlesModal" class="modal" style="display: none;">
            <section class="modal-content">
                <span id="closeSubtitlesModal" class="close">&times;</span>
                <h2>Add Subtitles</h2>
                <form id="addSubtitlesForm" enctype="multipart/form-data">
                    <label for="subtitlesFile">Upload Subtitles:</label>
                    <input type="file" id="subtitlesFile" name="subtitlesFile" accept=".srt,.vtt,.txt" required />

                    <label for="videoId">Video ID:</label>
                    <input type="text" id="videoId" name="videoId" placeholder="Enter associated Video ID" required />

                    <section class="modal-buttons">
                        <button type="button" id="saveSubBtn">Save</button>
                        <button type="button" id="cancelSubBtn">Cancel</button>
                    </section>
                </form>
            </section>
        </section>

        <section id="delete-overlay"></section>
        <section id="delete" class="delete">
            <label for="videoIndex">Enter id of video:</label>
            <input type="number" id="videoIndex" class="idInput">
            <button id="submitIdButton">Delete</button>
        </section>
    </nav>
    `;
}

const headerString = createHeader();
const headerFragment = document.createRange().createContextualFragment(headerString);
document.getElementById('title').appendChild(headerFragment);

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const incomingToken = urlParams.get('token');

    if (incomingToken) {
        localStorage.setItem('access_token', incomingToken);
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url);
    }

    document.getElementById("subtitlesBtn").onclick = function () {
        location.href = "editSubtitlesLobby.html";
    };

    document.getElementById("censorBtn").onclick = function () {
        location.href = "censorLobby.html";
    };

    document.getElementById("editVideoBtn").onclick = function () {
        location.href = "editLobby.html";
    };

    const videoModal = document.getElementById('videoModal');
    const subtitlesModal = document.getElementById('subtitlesModal');
    const closeModal = document.getElementById('closeModal');
    const closeSubtitlesModal = document.getElementById('closeSubtitlesModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelSubBtn = document.getElementById('cancelSubBtn');
    const addVideoBtn = document.getElementById('addVideoBtn');
    const addSubBtn = document.getElementById('uploadSubtitlesBtn');
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
