// Hardcoded function to create a header
function createHeader() {

    return `<nav class="navbar">
        <header>
            <div class="title-container">
                <h1 class="mainTitle">Video Annotation Tool</h1>
            </div>
            <div class="header-buttons">
                <button id="addVideoBtn">Add Video</button>
                <button id="profileBtn">Profile</button>
            </div>
        </header>
        <ul>
            <li><a href="#">Explore</a></li>
            <li><a href="#">Upload</a></li>
            <li><a href="#">Add Subtitles</a></li>
            <li><a href="#">Edit Videos</a></li>
        </ul>
    </nav>`
}

const headerString = createHeader();
const header = document.createRange().createContextualFragment(headerString);
document.getElementById('title').appendChild(header);