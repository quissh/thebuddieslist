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

function getFallbackUrl(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
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

  const detailLink = `detail.html?id=${encodeURIComponent(item.id)}`;
  const videoLink = item.youtube || '#';
  const thumbnail = getThumbnailUrl(item.youtube);
  const fallback = getFallbackUrl(item.youtube);

  card.innerHTML = `
    <a class="card-media" href="${videoLink}" target="_blank" rel="noopener noreferrer">
      <img
        src="${thumbnail}"
        alt="${item.level} video thumbnail"
        loading="lazy"
        onerror="this.onerror=null; this.src='${fallback}';"
      />
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

  card.querySelector('.copy-id').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(btn.dataset.id);
      const prev = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = prev; }, 1200);
    } catch {
      console.warn('Copy failed');
    }
  });

  return card;
}

function itemMatchesFilter(item, filter) {
  if (!filter) return true;
  if (item.type === 'section') return normalizeText(item.title).includes(filter);
  return [item.level, item.id, item.youtube, item.verifier, item.records]
    .map(normalizeText)
    .some((v) => v.includes(filter));
}

function renderCards(filter = '') {
  const f = normalizeText(filter);
  cardsContainer.innerHTML = '';
  demonData.forEach((item) => {
    if (itemMatchesFilter(item, f)) cardsContainer.appendChild(createCard(item));
  });
}

searchInput.addEventListener('input', (e) => renderCards(e.target.value));

renderCards();

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
  themeToggle.textContent = '☀️';
}
themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});