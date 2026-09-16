const API_BASE   = 'https://jsonplaceholder.typicode.com/posts';
const PAGE_LIMIT = 9;

const searchInput   = document.getElementById('search-input');
const clearBtn      = document.getElementById('search-clear');
const postsGrid     = document.getElementById('posts-grid');
const statusArea    = document.getElementById('status-area');
const loadMoreBtn   = document.getElementById('load-more-btn');
const sentinel      = document.getElementById('sentinel');
const counter       = document.getElementById('counter');

let currentQuery  = '';
let currentPage   = 1;
let isLoading     = false;
let hasMore       = true;
let totalLoaded   = 0;

let observer = null;

function initObserver() {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore && !isLoading) {
      loadNextPage();
    }
  }, { rootMargin: '200px' });

  observer.observe(sentinel);
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function buildUrl(query, page) {
  const params = new URLSearchParams({
    _page:  page,
    _limit: PAGE_LIMIT,
  });
  if (query.trim()) {
    params.set('q', query.trim());
  }
  return `${API_BASE}?${params}`;
}

function createPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.innerHTML = `
    <span class="post-id">#${post.id}</span>
    <h2 class="post-title">${escapeHtml(post.title)}</h2>
    <p class="post-body">${escapeHtml(post.body)}</p>
  `;
  return card;
}

function createSkeletonCard() {
  const card = document.createElement('div');
  card.className = 'skeleton-card';
  card.innerHTML = `
    <div class="skeleton-line short"></div>
    <div class="skeleton-line medium"></div>
    <div class="skeleton-line long"></div>
    <div class="skeleton-line long"></div>
    <div class="skeleton-line medium"></div>
  `;
  return card;
}

function showSkeletons(count = PAGE_LIMIT) {
  for (let i = 0; i < count; i++) {
    postsGrid.appendChild(createSkeletonCard());
  }
}

function removeSkeletons() {
  postsGrid.querySelectorAll('.skeleton-card').forEach(el => el.remove());
}

function showLoader(visible) {
  let loader = statusArea.querySelector('.loader');
  if (visible) {
    if (!loader) {
      loader = document.createElement('div');
      loader.className = 'loader';
      loader.innerHTML = `<div class="spinner"></div><span>Загрузка...</span>`;
      statusArea.insertBefore(loader, loadMoreBtn);
    }
  } else {
    if (loader) loader.remove();
  }
}

function showMessage(text, type = '') {
  clearMessages();
  const box = document.createElement('div');
  box.className = `message-box${type ? ' ' + type : ''}`;
  box.textContent = text;
  statusArea.insertBefore(box, loadMoreBtn);
}

function clearMessages() {
  statusArea.querySelectorAll('.message-box').forEach(el => el.remove());
}

function updateCounter() {
  counter.textContent = totalLoaded > 0 ? `Показано постов: ${totalLoaded}` : '';
}

function escapeHtml(str) {
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

async function resetAndLoad(query) {
  currentQuery = query;
  currentPage  = 1;
  hasMore      = true;
  totalLoaded  = 0;
  isLoading    = false;

  postsGrid.innerHTML = '';
  clearMessages();
  updateCounter();

  loadMoreBtn.disabled = false;
  loadMoreBtn.style.display = 'none';

  showSkeletons(PAGE_LIMIT);

  await loadNextPage(true);
}

async function loadNextPage(isFirst = false) {
  if (isLoading || !hasMore) return;

  isLoading = true;

  if (!isFirst) {
    showLoader(true);
    loadMoreBtn.disabled = true;
  }

  const url = buildUrl(currentQuery, currentPage);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();

    if (!Array.isArray(posts)) {
      throw new Error('Получен некорректный ответ от сервера');
    }

    if (isFirst) removeSkeletons();
    showLoader(false);

    if (posts.length === 0 && isFirst) {
      hasMore = false;
      showMessage(
          currentQuery
              ? `По запросу «${currentQuery}» ничего не найдено`
              : 'Нет доступных постов',
          'empty'
      );
      loadMoreBtn.style.display = 'none';
    } else if (posts.length === 0) {
      hasMore = false;
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'Всё загружено';
    } else {
      const fragment = document.createDocumentFragment();
      posts.forEach(post => fragment.appendChild(createPostCard(post)));
      postsGrid.appendChild(fragment);

      totalLoaded += posts.length;
      updateCounter();

      currentPage++;

      if (posts.length < PAGE_LIMIT) {
        hasMore = false;
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Всё загружено';
        loadMoreBtn.style.display = 'inline-block';
        if (observer) observer.disconnect();
      } else {
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Загрузить ещё';
        loadMoreBtn.style.display = 'inline-block';
      }
    }

  } catch (err) {
    if (isFirst) removeSkeletons();
    showLoader(false);

    const msg = err.message.includes('Failed to fetch')
        ? 'Нет соединения с интернетом. Проверьте сеть и попробуйте снова.'
        : err.message;

    showMessage('⚠ ' + msg, 'error');
    loadMoreBtn.style.display = 'none';
  } finally {
    isLoading = false;
  }
}

const debouncedSearch = debounce((value) => {
  resetAndLoad(value);
}, 350);

searchInput.addEventListener('input', (e) => {
  const val = e.target.value;
  clearBtn.classList.toggle('visible', val.length > 0);
  debouncedSearch(val);
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.classList.remove('visible');
  searchInput.focus();
  resetAndLoad('');
});

loadMoreBtn.addEventListener('click', () => {
  if (!isLoading && hasMore) loadNextPage();
});

initObserver();
resetAndLoad('');
