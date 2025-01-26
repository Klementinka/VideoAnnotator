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
                <button id="addVideoBtn">Add Video</button>
                <button id="deleteVideoBtn">Delete Video</button>
                <button id="profileBtn">Profile</button>
            </div>
        </header>
        <ul>
            <li><a href="explore.html">Explore</a></li>
            <li><a href="censor.html">Censor</a></li>
            <li><a href="add_subtitles.html">Add Subtitles</a></li>
            <li><a href="editLobby.html">Edit Videos</a></li>
        </ul>
        
        <!-- Modal -->
        <div id="videoModal" class="modal" style="display: none;">
            <div class="modal-content">
                <span id="closeModal" class="close">&times;</span>
                <h2>Add New Video</h2>
                <form id="addVideoForm" enctype="multipart/form-data">
                    
                    <label for="videoPath">Upload Video:</label>
                    <input type="file" id="videoPath" name="videoPath"
                           placeholder="Enter video path" required />

                    <label for="videoName">Video Name:</label>
                    <input type="text" id="videoName" name="videoName"
                           placeholder="Enter video name" required />

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
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const addVideoBtn = document.getElementById('addVideoBtn');
    const saveBtn = document.getElementById('saveBtn');

    const urlParams = new URLSearchParams(window.location.search);
    const incomingToken = urlParams.get('token');

    if (incomingToken) {
        localStorage.setItem('access_token', incomingToken);
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url);
    }

    const showModal = () => {
        videoModal.style.display = 'block';
    };
    const hideModal = () => {
        videoModal.style.display = 'none';
    };

    addVideoBtn.addEventListener('click', showModal);
    closeModal.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);

    saveBtn.addEventListener('click', () => {
        const form = document.getElementById('addVideoForm');
        const formData = new FormData(form);
        const storedAccessToken = localStorage.getItem('access_token');
        console.log('Stored access token:', storedAccessToken);
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
                    console.error('Error:', data.message || 'Unknown error.');
                    alert('Error: ' + (data.message || 'Unknown error.'));
                }
            })
            .catch((error) => {
                console.error('Fetch error:', error);
                alert('An error occurred while processing your request.');
            });
        hideModal();
    });

    window.addEventListener('click', (event) => {
        if (event.target === videoModal) {
            hideModal();
        }
    });


    const deleteVideoBtn = document.getElementById('deleteVideoBtn');
    const deleteOverlay = document.getElementById('delete-overlay');
    const deletePopup = document.getElementById('delete');
    const submitDelReq = document.getElementById('submitIdButton');

    deleteVideoBtn.addEventListener('click', () => {
        deleteOverlay.style.display = 'block';
        deletePopup.style.display = 'flex';
    });

    submitDelReq.addEventListener('click', () => {
        const videoId = videoIndex.value;
        if (videoId) {
            const storedAccessToken = localStorage.getItem('access_token');
            console.log('Stored access token:', storedAccessToken);

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
                            console.error('Error:', data.message || 'Unknown error.');
                            alert('Error: ' + (data.message || 'Unknown error.'));
                        }
                    })
                    .catch((error) => {
                        console.error('Fetch error:', error);
                        alert('An error occurred while processing your request.');
                    });
            } else {
                alert('You need to be logged in to delete a video.');
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
