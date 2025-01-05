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