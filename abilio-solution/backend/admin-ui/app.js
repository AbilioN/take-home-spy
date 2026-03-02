const TOKEN_KEY = 'admin_token';
const API = ''; // same origin

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function api(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'x-admin-token': token }),
    ...options.headers,
  };
  return fetch(API + path, { ...options, headers }).then((res) => {
    if (!res.ok) throw new Error(res.status === 401 ? 'Unauthorized' : await res.text());
    return res.json();
  });
}

// --- DOM ---
const loginBox = document.getElementById('login-box');
const userListBox = document.getElementById('user-list-box');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const userList = document.getElementById('user-list');
const logoutBtn = document.getElementById('logout-btn');
const mapPlaceholder = document.getElementById('map-placeholder');
const mapContainer = document.getElementById('map-container');

let map = null;
let currentLayer = null;

// --- Login / Logout ---
function showLogin() {
  loginBox.classList.remove('hidden');
  userListBox.classList.add('hidden');
  mapPlaceholder.classList.remove('hidden');
  mapContainer.classList.add('hidden');
  if (map) {
    map.remove();
    map = null;
  }
}

function showDashboard() {
  loginBox.classList.add('hidden');
  userListBox.classList.remove('hidden');
  loginError.textContent = '';
  loadUsers();
}

logoutBtn.addEventListener('click', () => {
  clearToken();
  showLogin();
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  try {
    const data = await api('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setToken(data.token);
      showDashboard();
    }
  } catch (err) {
    loginError.textContent = err.message || 'Login failed';
  }
});

// --- Users list ---
function loadUsers() {
  api('/admin/users')
    .then((users) => {
      userList.innerHTML = users
        .map(
          (u) =>
            `<li data-id="${u.id}">
              <span class="email">${escapeHtml(u.email)}</span>
              <span class="meta">${u.totalLocations} locations</span>
            </li>`
        )
        .join('');

      userList.querySelectorAll('li').forEach((li) => {
        li.addEventListener('click', () => selectUser(li.dataset.id));
      });
    })
    .catch(() => showLogin());
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function selectUser(userId) {
  userList.querySelectorAll('li').forEach((li) => li.classList.toggle('selected', li.dataset.id === userId));
  loadTrajectoryMap(userId);
}

// --- Map ---
function loadTrajectoryMap(userId) {
  api(`/admin/users/${userId}/trajectory/geojson`)
    .then((geojson) => {
      mapPlaceholder.classList.add('hidden');
      mapContainer.classList.remove('hidden');

      if (!map) {
        map = L.map('map-container').setView([41.1579, -8.6291], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);
      }

      if (currentLayer) map.removeLayer(currentLayer);
      currentLayer = L.geoJSON(geojson, {
        style: { color: '#e94560', weight: 4 },
      }).addTo(map);
      if (currentLayer.getBounds().isValid()) map.fitBounds(currentLayer.getBounds(), { padding: [20, 20] });
    })
    .catch(() => {
      mapPlaceholder.classList.remove('hidden');
      mapContainer.classList.add('hidden');
    });
}

// --- Init ---
if (getToken()) {
  showDashboard();
} else {
  showLogin();
}
