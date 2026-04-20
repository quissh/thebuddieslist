const cardsContainer = document.querySelector('#cardsContainer');
const searchInput = document.querySelector('#search');

// Wave title effect
document.querySelector('h1').childNodes.forEach(node => {
  if (node.nodeType !== Node.TEXT_NODE) return;
  const text = node.textContent;
  const wrapped = [...text].map((char, i) =>
    char === ' '
      ? ' '
      : `<span class="wave-letter" style="animation-delay: ${i * 0.04}s">${char}</span>`
  ).join('');
  const span = document.createElement('span');
  span.innerHTML = wrapped;
  node.replaceWith(span);
});

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

function getThumbnailUrl(item) {
  if (item.thumbnail) return item.thumbnail;
  const id = getYoutubeId(item.youtube);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '';
}

function getFallbackUrl(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/sddefault.jpg` : '';
}

function getFallback2Url(url) {
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
  const thumbnail = getThumbnailUrl(item);
  const fallback = getFallbackUrl(item.youtube);
  const fallback2 = getFallback2Url(item.youtube);

  card.innerHTML = `
    <a class="card-media" href="${videoLink}" target="_blank" rel="noopener noreferrer">
      <img
        src="${thumbnail}"
        alt="${item.level} video thumbnail"
        onerror="this.src='${fallback}'; this.onerror=function(){ this.src='${fallback2}'; this.onerror=null; };"
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
  let rank = 0;
  let inMainList = false;
  let inLegacy = false;

  demonData.forEach((item) => {
    if (!itemMatchesFilter(item, f)) return;

    if (item.type === 'section') {
      if (item.id === 'main-list') inMainList = true;
      if (item.id === 'legacy-list') { inMainList = false; inLegacy = true; }
    }

    const card = createCard(item);

    if (item.type === 'entry' && inMainList && !inLegacy) {
      rank++;
      const titleEl = card.querySelector('.card-title a');
      if (titleEl) titleEl.textContent = `#${rank} ${item.level}`;
    }

    cardsContainer.appendChild(card);
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