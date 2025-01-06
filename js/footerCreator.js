function createFooter() {

    return `<footer>
        <p>&copy; 2025 Web Technologies Video Annotator</p>
    </footer>`
}

const footerString = createFooter();
const footer = document.createRange().createContextualFragment(footerString);
document.getElementById('footer').appendChild(footer);