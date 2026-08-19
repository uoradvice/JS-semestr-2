const API_URL = "https://jsonplaceholder.typicode.com/posts";
const LIMIT = 9;

const postsContainer = document.getElementById("posts");
const searchInput = document.getElementById("searchInput");
const loader = document.getElementById("loader");
const errorBlock = document.getElementById("error");
const emptyBlock = document.getElementById("empty");
const sentinel = document.getElementById("sentinel");

let currentPage = 1;
let currentQuery = "";
let isLoading = false;
let hasMore = true;
let observer;

//to make the load more visible
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPosts(page, query) {
  try {
    isLoading = true;
    showLoader(true);
    showError("");
    
    const params = new URLSearchParams({
      _page: page,
      _limit: LIMIT
    });

    if (query) {
      params.append("q", query);
    }

    const response = await fetch(`${API_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const data = await response.json();
    hasMore = data.length === LIMIT;

    return data;

  } catch (err) {
    showError("Ошибка загрузки данных");
    hasMore = false;
    return [];
  } finally {
    await delay(500);
    isLoading = false;
    showLoader(false);
  }
}

function renderPosts(posts, replace = false) {
  if (replace) {
    postsContainer.innerHTML = "";
  }

  if (posts.length === 0 && replace) {
    emptyBlock.classList.remove("hidden");
    return;
  } else {
    emptyBlock.classList.add("hidden");
  }

  posts.forEach(post => {
    const div = document.createElement("div");
    div.classList.add("post");

    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.body}</p>
    `;

    postsContainer.appendChild(div);
  });
}

async function loadPosts(reset = false) {
  if (isLoading || (!hasMore && !reset)) return;

  if (reset) {
    currentPage = 1;
    hasMore = true;
  }

  const posts = await fetchPosts(currentPage, currentQuery);
  renderPosts(posts, reset);
  currentPage++;

  checkIfScreenFilled();
}

function checkIfScreenFilled() {
  const rect = sentinel.getBoundingClientRect();

  if (rect.top <= window.innerHeight && hasMore && !isLoading) {
    loadPosts();
  }
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const handleSearch = debounce((e) => {
  currentQuery = e.target.value.trim();
  loadPosts(true);
}, 300);

searchInput.addEventListener("input", handleSearch);

function initObserver() {
  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && hasMore && !isLoading) {
      loadPosts();
    }
  });

  observer.observe(sentinel);
}

function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}

function showError(message) {
  if (!message) {
    errorBlock.classList.add("hidden");
    errorBlock.textContent = "";
  } else {
    errorBlock.textContent = message;
    errorBlock.classList.remove("hidden");
  }
}

loadPosts(true);
initObserver();