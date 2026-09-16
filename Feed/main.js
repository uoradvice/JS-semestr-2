const API_BASE   = 'https://jsonplaceholder.typicode.com/posts';
const PAGE_LIMIT = 9; 

const searchInput   = document.getElementById('search-input');
const clearBtn      = document.getElementById('search-clear');
const postsGrid     = document.getElementById('posts-grid');
const statusArea    = document.getElementById('status-area');
const loadMoreBtn   = document.getElementById('load-more-btn');
const sentinel      = document.getElementById('sentinel');
const counter       = document.getElementById('counter');

/* ── Состояние ── */
let currentQuery  = '';   // текущий поисковый запрос
let currentPage   = 1;    // номер следующей страницы для загрузки
let isLoading     = false; // идёт ли загрузка прямо сейчас
let hasMore       = true;  // есть ли ещё посты
let totalLoaded   = 0;     // сколько постов показано

/* ── Intersection Observer ── */
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

/* ─────────────────────────────────────────────────────────
   Утилиты
───────────────────────────────────────────────────────── */

/** Debounce: вызывает fn не чаще чем раз в delay мс */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Собирает URL с query-параметрами */
function buildUrl(query, page) {
  const params = new URLSearchParams({
    _page:  page,
    _limit: PAGE_LIMIT,
  });
  if (query.trim()) {
    params.set('q', query.trim()); // JSONPlaceholder поддерживает ?q= для full-text поиска
  }
  return `${API_BASE}?${params}`;
}

/* ─────────────────────────────────────────────────────────
   Рендеринг
───────────────────────────────────────────────────────── */

/** Создаёт DOM-карточку поста */
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

/** Создаёт skeleton-карточку (заглушка при загрузке) */
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

/** Рендерит skeleton-карточки в сетку */
function showSkeletons(count = PAGE_LIMIT) {
  for (let i = 0; i < count; i++) {
    postsGrid.appendChild(createSkeletonCard());
  }
}

/** Убирает все skeleton-карточки из сетки */
function removeSkeletons() {
  postsGrid.querySelectorAll('.skeleton-card').forEach(el => el.remove());
}

/** Показывает/скрывает спиннер внизу при дозагрузке */
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

/** Показывает сообщение (ошибка / пусто) */
function showMessage(text, type = '') {
  clearMessages();
  const box = document.createElement('div');
  box.className = `message-box${type ? ' ' + type : ''}`;
  box.textContent = text;
  statusArea.insertBefore(box, loadMoreBtn);
}

/** Убирает все сообщения */
function clearMessages() {
  statusArea.querySelectorAll('.message-box').forEach(el => el.remove());
}

/** Обновляет счётчик */
function updateCounter() {
  counter.textContent = totalLoaded > 0 ? `Показано постов: ${totalLoaded}` : '';
}

/** Экранирует HTML */
function escapeHtml(str) {
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

/* ─────────────────────────────────────────────────────────
   Логика загрузки
───────────────────────────────────────────────────────── */

/**
 * Сбрасывает состояние и загружает первую страницу
 * (вызывается при инициализации и при смене поиска)
 */
async function resetAndLoad(query) {
  currentQuery = query;
  currentPage  = 1;
  hasMore      = true;
  totalLoaded  = 0;
  isLoading    = false;

  // Очищаем сетку и сообщения
  postsGrid.innerHTML = '';
  clearMessages();
  updateCounter();

  // Сбрасываем кнопку
  loadMoreBtn.disabled = false;
  loadMoreBtn.style.display = 'none'; // скроем до первого ответа

  // Показываем скелетоны
  showSkeletons(PAGE_LIMIT);

  await loadNextPage(true);
}

/**
 * Загружает следующую страницу и добавляет посты в сетку
 * @param {boolean} isFirst — является ли это первой загрузкой
 */
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

    // Убираем скелетоны (только при первой загрузке)
    if (isFirst) removeSkeletons();
    showLoader(false);

    if (posts.length === 0 && isFirst) {
      // Ничего не найдено
      hasMore = false;
      showMessage(
        currentQuery
          ? `По запросу «${currentQuery}» ничего не найдено`
          : 'Нет доступных постов',
        'empty'
      );
      loadMoreBtn.style.display = 'none';
    } else if (posts.length === 0) {
      // Дошли до конца
      hasMore = false;
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'Всё загружено';
    } else {
      // Рендерим карточки
      const fragment = document.createDocumentFragment();
      posts.forEach(post => fragment.appendChild(createPostCard(post)));
      postsGrid.appendChild(fragment);

      totalLoaded += posts.length;
      updateCounter();

      currentPage++;

      if (posts.length < PAGE_LIMIT) {
        // Это была последняя страница
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

/* ─────────────────────────────────────────────────────────
   Обработчики событий
───────────────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────────────────
   Старт
───────────────────────────────────────────────────────── */

initObserver();
resetAndLoad('');
