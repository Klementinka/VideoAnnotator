document.getElementById('loadSubs').addEventListener('click', () => {
  document.getElementById('subtitleModal').style.display = 'flex';
});

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('subtitleModal').style.display = 'none';
});

document.getElementById('fetchSubtitles').addEventListener('click', () => {
  const subtitleId = document.getElementById('subtitleIdInput').value.trim();

  if (!subtitleId) {
    alert('Please enter a valid subtitle ID.');
    return;
  }

  fetch(`subtitles/${subtitleId}.srt`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Subtitles not found locally');
      }
      return response.text();
    })
    .then(subtitleText => {
      parseAndLoadSubtitles(subtitleText);
      document.getElementById('subtitleModal').style.display = 'none';
    })
    .catch(error => {
      fetch(`./php/drive_id_by_id_sb.php?id=${subtitleId}`)
        .then(response => response.json())
        .then(data => {
          console.log(data.drive_id);
          if (data.drive_id) {
            fetchSubtitleFromDrive(data.drive_id,localStorage.getItem('access_token'));
          } else {
            alert('No drive_id found for the given subtitle id.');
          }
        })
        .catch(err => {
          console.error('Error fetching drive ID:', err);
          alert('Failed to fetch subtitle drive ID.');
        });
    });
});

function fetchSubtitleFromDrive(driveId,token,API_KEY) {
  const subtitleUrl = `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&key=${API_KEY}`;

  fetch(subtitleUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
    .then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error('Failed to fetch subtitles from Google Drive');
      }
    })
    .then(subtitleText => {
      parseAndLoadSubtitles(subtitleText);
      document.getElementById('subtitleModal').style.display = 'none';
    })
    .catch(err => {
      console.error('Error fetching subtitles from Google Drive:', err);
      alert('Error fetching subtitles.');
    });
}

function parseAndLoadSubtitles(subtitleText) {
  const table = document.getElementById('subtitleTable');
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  const subtitleLines = subtitleText.split('\n\n');
  subtitleLines.forEach(line => {
    const parts = line.split('\n');
    if (parts.length >= 3) {
      const time = parts[1]; 
      const text = parts.slice(2).join(' ');
      
      const [startTime, endTime] = time.split(' --> '); 
      const startMinutes = convertTimeToMinutes(startTime);
      const endMinutes = convertTimeToMinutes(endTime);

      const row = document.createElement('tr');
      const timeCell = document.createElement('td');
      const textCell = document.createElement('td');

      timeCell.textContent = `${startMinutes} --> ${endMinutes}`;
      textCell.textContent = text;

      row.appendChild(timeCell);
      row.appendChild(textCell);
      tbody.appendChild(row);
    }
  });
}

function convertTimeToMinutes(time) {
  const [hours, minutes, seconds] = time.split(':'); 
  const [sec, ms] = seconds.split(','); 
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes); 
  return `${totalMinutes}:${sec.padStart(2, '0')}`; 
}
