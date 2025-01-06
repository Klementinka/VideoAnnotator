// document.getElementById('addAnnotationBtn').addEventListener('click', function() {
//     const video = document.getElementById('video');
//     const timestamp = video.currentTime.toFixed(2); // Get current time in seconds

//     // Create new annotation item
//     const annotationText = prompt("Enter annotation text:");
//     if (annotationText) {
//         const annotationList = document.getElementById('annotationList');
//         const listItem = document.createElement('li');
//         listItem.classList.add('annotation-item');
//         listItem.innerHTML = `<span>Time: ${timestamp}s</span> - ${annotationText}`;
//         annotationList.appendChild(listItem);
//     }
// });

// document.getElementById('saveAnnotationsBtn').addEventListener('click', function() {
//     alert('Annotations saved!');
// });