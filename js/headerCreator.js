function createHeader() {
    return `<nav class="navbar">
        <header>
            <div class="title-container">
                <h1 class="mainTitle"><a href="http://localhost/VideoAnnotator/">Video Annotation Tool</a></h1>
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
                <form id="addVideoForm">
                    <label for="videoUpload">Upload Video:</label>
                    <input type="file" id="videoUpload" accept="video/*" required>

                    <label for="videoName">Video Name:</label>
                    <input type="text" id="videoName" placeholder="Enter video name" required>

                    <label for="videoType">Video Type:</label>
                    <div class="slider-container">
                        <label class="switch">
                            <input type="checkbox" id="videoType">
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
    </nav>`;
}

// Add the header to the DOM
const headerString = createHeader();
const header = document.createRange().createContextualFragment(headerString);
document.getElementById('title').appendChild(header);

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const videoModal = document.getElementById('videoModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const addVideoBtn = document.getElementById('addVideoBtn');
    const saveBtn = document.getElementById('saveBtn');
    const form = document.getElementById('addVideoForm');
    const formData = new FormData(form);

    // Function to show the modal
    const showModal = () => {
        if (videoModal) {
            videoModal.style.display = 'block';
        } else {
            console.error("Error: videoModal not found.");
        }
    };

    // Function to hide the modal
    const hideModal = () => {
        if (videoModal) {
            videoModal.style.display = 'none';
        } else {
            console.error("Error: videoModal not found.");
        }
    };

    // Add event listener to "Add Video" button
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', showModal);
    } else {
        console.error("Error: addVideoBtn not found.");
    }

    // Close modal on close and cancel buttons
    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    } else {
        console.error("Error: closeModal not found.");
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideModal);
    } else {
        console.error("Error: cancelBtn not found.");
    }

    // Save button logic
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const form = document.getElementById('addVideoForm');
            const formData = new FormData(form);

            // Make an AJAX POST request to the PHP script
            fetch('uploadVideo.php', {
                method: 'POST',
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        alert('Video uploaded successfully!');
                    } else {
                        alert('Error uploading video: ' + data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert('An error occurred while uploading the video.');
                });
            alert('Video saved!');
            hideModal();
        });
    } else {
        console.error("Error: saveBtn not found.");
    }

    // Close modal if user clicks outside it
    window.addEventListener('click', (event) => {
        if (event.target === videoModal) {
            hideModal();
        }
    });
});
