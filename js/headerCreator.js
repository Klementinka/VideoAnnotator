/**
 * headerCreator.js
 * This script dynamically creates a header and includes a modal form
 * for uploading videos to Google Drive. It also handles storing/fetching
 * the access token in local storage.
 */

// 1. Function to generate the header HTML (including the modal form)
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
                <button id="profileBtn">Profile</button>
            </div>
        </header>
        <ul>
            <li><a href="explore.html">Explore</a></li>
            <li><a href="upload.html">Upload</a></li>
            <li><a href="add_subtitles.html">Add Subtitles</a></li>
            <li><a href="editLobby.html?token=${token}">Edit Videos</a></li>
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
    </nav>
    `;
}

// 2. Insert the header HTML into the DOM
const headerString = createHeader();
const headerFragment = document.createRange().createContextualFragment(headerString);
document.getElementById('title').appendChild(headerFragment);

// 3. Once the DOM is ready, attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    const videoModal = document.getElementById('videoModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const addVideoBtn = document.getElementById('addVideoBtn');
    const saveBtn = document.getElementById('saveBtn');

    // ------------------------------------------------------------------------
    // A) Handle arriving with ?token=XXXX in the URL and storing it
    // ------------------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const incomingToken = urlParams.get('token');

    if (incomingToken) {
        // Store the token in localStorage for future use
        localStorage.setItem('access_token', incomingToken);

        // Optional: remove the token from the URL to keep things clean
        // This part just rewrites the URL without the "token" parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url);
    }

    // ------------------------------------------------------------------------
    // B) Modal show/hide logic
    // ------------------------------------------------------------------------
    const showModal = () => {
        videoModal.style.display = 'block';
    };
    const hideModal = () => {
        videoModal.style.display = 'none';
    };

    addVideoBtn.addEventListener('click', showModal);
    closeModal.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);

    // ------------------------------------------------------------------------
    // C) "Save" button logic - submit the form via fetch()
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // D) Close the modal if user clicks outside of it
    // ------------------------------------------------------------------------
    window.addEventListener('click', (event) => {
        if (event.target === videoModal) {
            hideModal();
        }
    });
});
