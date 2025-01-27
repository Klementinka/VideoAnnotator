document.getElementById('loadSubs').addEventListener('click', () => {
  document.getElementById('subtitleModal').style.display = 'flex';
  const select = document.getElementById('subtitleDropdown');
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('id');
  fetch(`./php/get_subs_by_movie.php?video_id=${videoId}`)
    .then(response => response.json())
    .then(data => {
      Array.from(select.options).forEach(option => {
        if (!option.disabled) {
          option.remove();
        }
      });
      data.forEach(subtitle => {
        const option = document.createElement('option');
        option.value = subtitle.drive_id;
        option.textContent = subtitle.subtitle_name;
        select.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error fetching subtitles:', error);
      alert('Failed to load subtitles.');
    });
});

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('subtitleModal').style.display = 'none';
});

document.getElementById('fetchSubtitles').addEventListener('click', () => {
  const subtitleDriveId = document.getElementById('subtitleDropdown').value;

  if (!subtitleDriveId) {
    alert('Please enter a valid subtitle ID.');
    return;
  }
  fetch('./config.json')
    .then(response => response.json())
    .then(data => {
      const subtitleText = fetchSubtitleFromDrive(subtitleDriveId, localStorage.getItem('access_token'), data.API_KEY);
    });

  function fetchSubtitleFromDrive(driveId, token, API_KEY) {
    const subtitleUrl = `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&key=${API_KEY}`;
    fetch(subtitleUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(response => {
        if (response.ok) {
          response.body.getReader().read().then(({ value, done }) => {
            const decoder = new TextDecoder('utf-8');
            const subtitleText = decoder.decode(value);
            parseAndLoadSubtitles(subtitleText);
            document.getElementById('subtitleModal').style.display = 'none';
          });
        } else {
          throw new Error('Failed to fetch subtitles from Google Drive');
        }
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
    subtitles = [];

    const subtitleLines = subtitleText.split('\n\n');
    subtitleLines.forEach(line => {
      console.log(line)
      const parts = line.split('\n');
      if (parts.length >= 3) {
        const time = parts[1];
        const text = parts.slice(2).join(' ');

        const [startTime, endTime] = time.split(' --> ');

        const startMinutes = startTime.replace(',000', '');
        const endMinutes = endTime.replace(',000', '');

        document.getElementById('startTime').value = startMinutes;
        document.getElementById('endTime').value = endMinutes;
        document.getElementById('subtitleText').value = text;

        document.getElementById('addSubtitle').click();
      }
    });
  }

  function convertTimeToMinutes(time) {
    const [hours, minutes, seconds] = time.split(':');
    const [sec, ms] = seconds.split(',');
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    return `${totalMinutes}:${sec.padStart(2, '0')}`;
  }

});