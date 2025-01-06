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
    </nav>`
}

const headerString = createHeader();
const header = document.createRange().createContextualFragment(headerString);
document.getElementById('title').appendChild(header);

document.addEventListener('DOMContentLoaded', () => {
    const videoModal = document.getElementById('videoModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');

    // Function to show the modal
    const showModal = () => {
        videoModal.style.display = 'block';
    };

    // Function to hide the modal
    const hideModal = () => {
        videoModal.style.display = 'none';
    };

    // Add event listener to "Add Video" button
    const addVideoBtn = document.getElementById('addVideoBtn');
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', showModal);
    }

    // Close modal on close and cancel buttons
    closeModal.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);

    // Save button logic
    saveBtn.addEventListener('click', () => {
        alert('Video saved!');
        hideModal();
    });

    // Close modal if user clicks outside
    window.addEventListener('click', (event) => {
        if (event.target === videoModal) {
            hideModal();
        }
    });
});     