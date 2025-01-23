/**
 * headerCreator.js
 * This script dynamically creates a header and includes a modal form
 * for uploading videos to Google Drive. It also handles storing/fetching
 * the access token in local storage.
 */

// 1. Function to generate the header HTML (including the modal form)
function createHeader() {
    return `
    <nav class="navbar">
        <header>
            <div class="title-container">
                <h1 class="mainTitle">
                    <a href="http://localhost/VideoAnnotator/">Video Annotation Tool</a>
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
            <li><a href="edit_videos.html">Edit Videos</a></li>
        </ul>
        
        <!-- Modal -->
        <div id="videoModal" class="modal" style="display: none;">
            <div class="modal-content">
                <span id="closeModal" class="close">&times;</span>
                <h2>Add New Video</h2>
                <form id="addVideoForm" enctype="multipart/form-data">
                    
                    <label for="videoPath">Upload Video:</label>
                    <input type="text" id="videoPath" name="videoPath"
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

        // Retrieve the stored access token (if any)
        const storedAccessToken = localStorage.getItem('access_token');

        // If we have an access token, append it to the formData
        if (storedAccessToken) {
            // We can either append it as a simple string or as JSON
            // If your PHP is expecting just a string:
            //   formData.append('access_token', storedAccessToken);
            // OR if your PHP expects JSON (so it can detect refresh token if present),
            // you'd do something like:
            //   const tokenJSON = JSON.stringify({access_token: storedAccessToken});
            //   formData.append('access_token', tokenJSON);
            // But for simplicity, let's just pass the token as a bare string
            formData.append('access_token', storedAccessToken);
        }

        // POST the formData to uploadVideo.php
        fetch('php/uploadVideo.php', {
            method: 'POST',
            body: formData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Upload successful
                alert(data.message || 'Video uploaded successfully!');
            } else {
                // Some error
                console.error('Error:', data.message || 'Unknown error.');
                alert('Error: ' + (data.message || 'Unknown error.'));
                
                // If your PHP returns a "redirect" property for reauth,
                // you can handle that here. For example:
                // if (data.redirect) {
                //     window.location.href = data.redirect;
                // }
            }
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            alert('An error occurred while processing your request.');
        });

        // Hide the modal after user clicks Save
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
