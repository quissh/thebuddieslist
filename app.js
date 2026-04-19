const cardsContainer = document.querySelector('#cardsContainer');
const searchInput = document.querySelector('#search');

function normalizeText(text) {
  return String(text || '').toLowerCase().trim();
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

function getThumbnailUrl(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '';
}

function createCard(item) {
  if (item.type === 'section') {
    const section = document.createElement('div');
    section.className = 'section-heading';
    if (item.id) section.id = item.id;
    section.textContent = item.title;
    return section;
  }

  const card = document.createElement('article');
  card.className = 'card';

  const thumbnail = getThumbnailUrl(item.youtube);
  const detailLink = `detail.html?id=${encodeURIComponent(item.id)}`;
  const videoLink = item.youtube ? item.youtube : '#';

  card.innerHTML = `
    <a class="card-media" href="${videoLink}" target="_blank" rel="noopener noreferrer">
      <img src="${thumbnail}" alt="${item.level} video thumbnail" loading="lazy" />
    </a>
    <div class="card-body">
      <h2 class="card-title"><a href="${detailLink}">${item.level}</a></h2>
      <div class="card-meta">
        <span class="meta-line">B-verified by ${item.verifier || 'Unknown'}</span>
        <span class="meta-line">ID: <button type="button" class="copy-id" data-id="${item.id}">${item.id}</button></span>
        ${item.records ? `<span class="meta-line">Records: ${item.records}</span>` : ''}
      </div>
    </div>
  `;

  card.querySelectorAll('.copy-id').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const id = button.dataset.id;
      if (!id) return;

      try {
        await navigator.clipboard.writeText(id);
        const previous = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = previous;
        }, 1200);
      } catch (error) {
        console.warn('Copy failed', error);
      }
    });
  });

  return card;
}

function itemMatchesFilter(item, filter) {
  if (!filter) return true;
  if (item.type === 'section') {
    return normalizeText(item.title).includes(filter);
  }

  return [item.level, item.id, item.youtube, item.verifier, item.records]
    .map(normalizeText)
    .some((value) => value.includes(filter));
}

function renderCards(filter = '') {
  const normalizedFilter = normalizeText(filter);
  cardsContainer.innerHTML = '';

  demonData.forEach((item) => {
    if (itemMatchesFilter(item, normalizedFilter)) {
      cardsContainer.appendChild(createCard(item));
    }
  });
}

searchInput.addEventListener('input', (event) => {
  renderCards(event.target.value);
});

renderCards();