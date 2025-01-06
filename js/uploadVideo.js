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