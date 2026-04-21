function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getYoutubeId(url) {
  const patterns = [
    /youtu\.be\/([^?#&]+)/,
    /v=([^?#&]+)/,
    /embed\/([^?#&]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return '';
}

function renderDetail(item) {
  const detailTitle = document.getElementById('detailTitle');
  const detailLevel = document.getElementById('detailLevel');
  const detailId = document.getElementById('detailId');
  const detailVerifier = document.getElementById('detailVerifier');
  const detailRecords = document.getElementById('detailRecords');
  const recordHolders = document.getElementById('recordHolders');
  const videoFrame = document.getElementById('videoFrame');

  detailTitle.textContent = item.level;
  detailLevel.textContent = item.level;
  detailId.textContent = item.id;
  detailVerifier.textContent = item.verifier || 'Unknown';
  detailRecords.textContent = item.records || 'None';

  const videoId = getYoutubeId(item.video);
  if (videoId) {
    videoFrame.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?rel=0" title="${item.level} preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    videoFrame.textContent = 'No video available.';
  }

  if (Array.isArray(item.records) && item.records.length) {
    detailRecords.textContent = item.records.map(r => `${r.player} (${r.percent}%)`).join(', ');
    recordHolders.innerHTML = item.records.map(r =>
      r.video
        ? `<div class="record-holder"><a href="${r.video}" target="_blank" rel="noopener noreferrer">${r.player} (${r.percent}%)</a></div>`
        : `<div class="record-holder">${r.player} (${r.percent}%)</div>`
    ).join('');
  } else if (item.records) {
    const recordsText = item.records.split(/[,;]\s*/).filter(Boolean);
    recordHolders.innerHTML = recordsText.map((text) => `<div class="record-holder">${text}</div>`).join('');
  } else {
    recordHolders.textContent = 'No B-record holders available.';
  }
}

function renderNotFound() {
  document.getElementById('detailTitle').textContent = 'Level not found';
  document.getElementById('detailLevel').textContent = '-';
  document.getElementById('detailId').textContent = '-';
  document.getElementById('detailVerifier').textContent = '-';
  document.getElementById('detailRecords').textContent = '-';
  document.getElementById('videoFrame').textContent = 'Could not load level details.';
  document.getElementById('recordHolders').textContent = 'No B-record holders available.';
}

const selectedId = getQueryParam('id');
const allData = [
  ...(typeof demonData !== 'undefined' ? demonData : []),
  ...(typeof challengeData !== 'undefined' ? challengeData : []),
];
const selectedItem = allData.find((item) => item.type === 'entry' && item.id === selectedId);

if (selectedItem) {
  renderDetail(selectedItem);
} else {
  renderNotFound();
}
