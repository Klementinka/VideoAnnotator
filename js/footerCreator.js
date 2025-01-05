function createFooter() {

    return `<footer>
        <p>&copy; 2023 Video Annotator</p>
    </footer>`
}

const footerString = createFooter();
const footer = document.createRange().createContextualFragment(footerString);
document.getElementById('footer').appendChild(footer);