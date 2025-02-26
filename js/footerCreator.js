function createFooter() {

    return `<footer class="footer">
        <section class='footer-content'>
            <p>&copy; 2025 Web Technologies Video Annotator</p>
            <a href='https://github.com/Klementinka/VideoAnnotator' target='_blank'>
                <img src='assets/github_logo.png' alt='GitHub repository' width='20px'>
            </a>
        </section>
        <p>With love by team <span>Clementinka &#x2764</span></p>
    </footer>`

}

const footerString = createFooter();
const footer = document.createRange().createContextualFragment(footerString);
document.getElementById('footer').appendChild(footer);