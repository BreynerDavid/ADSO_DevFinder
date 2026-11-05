/**
 * DevFinder - GitHub API Explorer
 * 
 * Implementación con validación exhaustiva mediante bloques try...catch,
 * consumo asíncrono de la API REST de GitHub y renderizado dinámico.
 */

// ==========================================
// Constantes y Mapeo de Colores por Lenguaje
// ==========================================
const GITHUB_API_URL = "https://api.github.com/users";

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  Vue: "#41b883",
  default: "#94a3b8"
};

// ==========================================
// Elementos del DOM
// ==========================================
const searchForm = document.getElementById("searchForm");
const usernameInput = document.getElementById("usernameInput");
const clearBtn = document.getElementById("clearBtn");
const searchSubmitBtn = document.getElementById("searchSubmitBtn");
const themeToggle = document.getElementById("themeToggle");
const toastMessage = document.getElementById("toastMessage");

// Estados visuales (Contenedores)
const errorCard = document.getElementById("errorCard");
const emptyCard = document.getElementById("emptyCard");
const profileCard = document.getElementById("profileCard");

// Elementos de Error
const errorTitle = document.getElementById("errorTitle");
const errorDescription = document.getElementById("errorDescription");
const retryBtn = document.getElementById("retryBtn");

// Elementos del Perfil
const userAvatar = document.getElementById("userAvatar");
const userTypeBadge = document.getElementById("userTypeBadge");
const userName = document.getElementById("userName");
const userLoginLink = document.getElementById("userLoginLink");
const githubProfileBtn = document.getElementById("githubProfileBtn");
const userCreatedAt = document.getElementById("userCreatedAt");
const userBio = document.getElementById("userBio");

// Elementos de Estadísticas
const statRepos = document.getElementById("statRepos");
const statFollowers = document.getElementById("statFollowers");
const statFollowing = document.getElementById("statFollowing");
const statGists = document.getElementById("statGists");

// Elementos de Metadatos
const metaLocation = document.getElementById("metaLocation");
const metaCompany = document.getElementById("metaCompany");
const metaBlog = document.getElementById("metaBlog");
const metaTwitter = document.getElementById("metaTwitter");

// Elementos de Repositorios
const reposGrid = document.getElementById("reposGrid");
const quickChips = document.querySelectorAll(".quick-chip");

let lastSearchedUser = "";
let toastTimer = null;

// ==========================================
// Inicialización y Eventos
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupEventListeners();
  // Mostrar estado inicial de bienvenida
  showState("empty");
});

function setupEventListeners() {
  // Manejador del formulario de búsqueda
  searchForm.addEventListener("submit", handleFormSubmit);

  // Botón para limpiar campo
  usernameInput.addEventListener("input", () => {
    clearBtn.hidden = usernameInput.value.trim() === "";
  });

  clearBtn.addEventListener("click", () => {
    usernameInput.value = "";
    clearBtn.hidden = true;
    usernameInput.focus();
  });

  // Botón de reintento en caso de error
  retryBtn.addEventListener("click", () => {
    if (lastSearchedUser) {
      usernameInput.value = lastSearchedUser;
      fetchGitHubProfile(lastSearchedUser);
    } else {
      usernameInput.focus();
    }
  });

  // Chips con usuarios populares
  quickChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const user = chip.dataset.user;
      usernameInput.value = user;
      clearBtn.hidden = false;
      fetchGitHubProfile(user);
    });
  });

  // Toggle de Modo Oscuro / Claro
  themeToggle.addEventListener("click", toggleTheme);
}

// ==========================================
// Manejo del Formulario con TRY...CATCH
// ==========================================
async function handleFormSubmit(e) {
  e.preventDefault();

  try {
    // 1. Validar el campo de entrada usando try...catch
    const rawInput = usernameInput.value;
    const validatedUsername = validateSearchInput(rawInput);

    // 2. Ejecutar la búsqueda
    await fetchGitHubProfile(validatedUsername);

  } catch (validationError) {
    // Captura de errores de validación de entrada
    console.warn("[Validación de Entrada]", validationError.message);
    showToast(validationError.message, "warning");
    usernameInput.focus();
  }
}

/**
 * Validador estricto de nombre de usuario en GitHub.
 * Lanza errores descriptivos que son capturados por try...catch.
 */
function validateSearchInput(input) {
  const trimmed = input ? input.trim() : "";

  if (!trimmed) {
    throw new Error("Por favor, ingresa el nombre de usuario de GitHub.");
  }

  if (trimmed.length > 39) {
    throw new Error("El nombre de usuario excede los 39 caracteres permitidos por GitHub.");
  }

  // Los usernames de GitHub solo contienen caracteres alfanuméricos y guiones únicos
  const validGithubPattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
  if (!validGithubPattern.test(trimmed)) {
    throw new Error("El nombre de usuario contiene caracteres no válidos (solo letras, números y guiones).");
  }

  return trimmed;
}

// ==========================================
// Consumo Principal de la API con TRY...CATCH
// ==========================================
async function fetchGitHubProfile(username) {
  lastSearchedUser = username;
  setLoadingState(true);
  showState("loading");

  try {
    // Llamada HTTP al endpoint del usuario
    const userResponse = await fetch(`${GITHUB_API_URL}/${encodeURIComponent(username)}`, {
      headers: {
        Accept: "application/vnd.github.v3+json"
      }
    });

    // Validar el código de respuesta HTTP con try...catch
    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        throw new Error("USUARIO_NO_ENCONTRADO");
      } else if (userResponse.status === 403) {
        throw new Error("LIMITE_EXCEDIDO");
      } else {
        throw new Error(`ERROR_HTTP_${userResponse.status}`);
      }
    }

    const userData = await userResponse.json();

    // Intentar obtener los repositorios del usuario (controlado independientemente)
    let reposData = [];
    try {
      reposData = await fetchUserRepositories(username);
    } catch (reposError) {
      console.warn("[Error al cargar repositorios]:", reposError.message);
      // No bloqueamos el render del perfil principal si fallan los repos
    }

    // Renderizar datos exitosos en la interfaz
    renderUserProfile(userData);
    renderRepositories(reposData);
    showState("profile");

  } catch (error) {
    // Captura global de errores durante la petición o procesamiento
    console.error("[Error en fetchGitHubProfile]:", error);
    handleFetchError(error, username);
  } finally {
    setLoadingState(false);
  }
}

/**
 * Obtiene los repositorios públicos más recientes de un usuario con TRY...CATCH.
 */
async function fetchUserRepositories(username) {
  try {
    const reposResponse = await fetch(
      `${GITHUB_API_URL}/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json"
        }
      }
    );

    if (!reposResponse.ok) {
      throw new Error(`Fallo al consultar repositorios (Status: ${reposResponse.status})`);
    }

    const repos = await reposResponse.json();
    return Array.isArray(repos) ? repos : [];
  } catch (error) {
    // Propagación controlada o manejo específico
    throw error;
  }
}

// ==========================================
// Manejo y Presentación de Errores
// ==========================================
function handleFetchError(error, username) {
  let title = "Ocurrió un error inesperado";
  let message = "No fue posible procesar la solicitud en este momento. Intenta nuevamente.";

  switch (error.message) {
    case "USUARIO_NO_ENCONTRADO":
      title = "Usuario no encontrado";
      message = `No existe ningún perfil público registrado en GitHub con el nombre "@${escapeHtml(username)}".`;
      break;

    case "LIMITE_EXCEDIDO":
      title = "Límite de la API alcanzado";
      message = "GitHub limita las solicitudes anónimas a 60 por hora. Espera unos minutos antes de volver a consultar.";
      break;

    default:
      if (!navigator.onLine || error.name === "TypeError") {
        title = "Sin conexión a internet";
        message = "Parece que no tienes conexión a la red o el servicio de GitHub no responde.";
      } else {
        message = `Detalle del error: ${error.message}`;
      }
      break;
  }

  errorTitle.textContent = title;
  errorDescription.textContent = message;
  showState("error");
  showToast(title, "error");
}

// ==========================================
// Renderizado de Datos del Perfil
// ==========================================
function renderUserProfile(user) {
  // Avatar & Tipo de cuenta
  userAvatar.src = user.avatar_url || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";
  userAvatar.alt = `Avatar de ${user.name || user.login}`;
  userTypeBadge.textContent = user.type === "Organization" ? "Organización" : "Usuario";

  // Identidad
  userName.textContent = user.name || user.login;
  userLoginLink.textContent = `@${user.login}`;
  userLoginLink.href = user.html_url;
  githubProfileBtn.href = user.html_url;

  // Fecha de registro
  userCreatedAt.innerHTML = `<i class="fa-regular fa-calendar"></i> Se unió el ${formatDate(user.created_at)}`;

  // Biografía
  if (user.bio && user.bio.trim()) {
    userBio.textContent = user.bio;
    userBio.classList.remove("empty-bio");
  } else {
    userBio.textContent = "Este usuario no tiene una biografía pública.";
    userBio.classList.add("empty-bio");
  }

  // Estadísticas numéricas con formateo
  statRepos.textContent = formatNumber(user.public_repos || 0);
  statFollowers.textContent = formatNumber(user.followers || 0);
  statFollowing.textContent = formatNumber(user.following || 0);
  statGists.textContent = formatNumber(user.public_gists || 0);

  // Metadatos (Ubicación, Compañía, Web, Twitter)
  renderMetaItem(metaLocation, user.location, '<i class="fa-solid fa-location-dot"></i>');
  renderMetaItem(metaCompany, user.company, '<i class="fa-solid fa-building"></i>');
  renderMetaLink(metaBlog, user.blog, '<i class="fa-solid fa-link"></i>');
  renderMetaTwitter(metaTwitter, user.twitter_username, '<i class="fa-brands fa-x-twitter"></i>');
}

function renderMetaItem(element, value, iconHtml) {
  if (value && value.trim()) {
    element.innerHTML = `${iconHtml} <span class="meta-text">${escapeHtml(value.trim())}</span>`;
    element.classList.remove("disabled");
  } else {
    element.innerHTML = `${iconHtml} <span class="meta-text">No disponible</span>`;
    element.classList.add("disabled");
  }
}

function renderMetaLink(element, url, iconHtml) {
  if (url && url.trim()) {
    const rawUrl = url.trim();
    const href = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") 
      ? rawUrl 
      : `https://${rawUrl}`;

    element.innerHTML = `${iconHtml} <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="meta-text">${escapeHtml(rawUrl)}</a>`;
    element.classList.remove("disabled");
  } else {
    element.innerHTML = `${iconHtml} <span class="meta-text">No disponible</span>`;
    element.classList.add("disabled");
  }
}

function renderMetaTwitter(element, twitterHandle, iconHtml) {
  if (twitterHandle && twitterHandle.trim()) {
    const cleanHandle = twitterHandle.replace("@", "").trim();
    element.innerHTML = `${iconHtml} <a href="https://twitter.com/${encodeURIComponent(cleanHandle)}" target="_blank" rel="noopener noreferrer" class="meta-text">@${escapeHtml(cleanHandle)}</a>`;
    element.classList.remove("disabled");
  } else {
    element.innerHTML = `${iconHtml} <span class="meta-text">No disponible</span>`;
    element.classList.add("disabled");
  }
}

// ==========================================
// Renderizado de Repositorios
// ==========================================
function renderRepositories(repos) {
  reposGrid.innerHTML = "";

  if (!repos || repos.length === 0) {
    reposGrid.innerHTML = `
      <div class="empty-repos-msg">
        <i class="fa-solid fa-folder-open"></i> Este usuario no tiene repositorios públicos recientes.
      </div>
    `;
    return;
  }

  const reposCardsHtml = repos.map(repo => {
    const lang = repo.language || "Markdown";
    const langColor = LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.default;
    const desc = repo.description || "Sin descripción proporcionada.";

    return `
      <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="repo-card">
        <div class="repo-header">
          <div class="repo-title-wrapper">
            <i class="fa-solid fa-book-bookmark repo-icon"></i>
            <span class="repo-name">${escapeHtml(repo.name)}</span>
          </div>
          <p class="repo-desc">${escapeHtml(desc)}</p>
        </div>
        <div class="repo-meta">
          <span class="repo-lang-box">
            <span class="lang-dot" style="background-color: ${langColor};"></span>
            ${escapeHtml(lang)}
          </span>
          <span class="repo-stat">
            <i class="fa-regular fa-star"></i> ${formatNumber(repo.stargazers_count)}
          </span>
          <span class="repo-stat">
            <i class="fa-solid fa-code-fork"></i> ${formatNumber(repo.forks_count)}
          </span>
        </div>
      </a>
    `;
  }).join("");

  reposGrid.innerHTML = reposCardsHtml;
}

// ==========================================
// Control de Estados Visuales
// ==========================================
function showState(state) {
  errorCard.hidden = state !== "error";
  emptyCard.hidden = state !== "empty";
  profileCard.hidden = state !== "profile";
}

function setLoadingState(isLoading) {
  searchSubmitBtn.disabled = isLoading;
  const btnText = searchSubmitBtn.querySelector(".btn-text");
  const btnIcon = searchSubmitBtn.querySelector("i");

  if (isLoading) {
    btnText.textContent = "Buscando...";
    btnIcon.className = "fa-solid fa-spinner fa-spin";
  } else {
    btnText.textContent = "Buscar";
    btnIcon.className = "fa-solid fa-arrow-right";
  }
}

function showToast(message, type = "info") {
  if (toastTimer) clearTimeout(toastTimer);

  toastMessage.textContent = message;
  toastMessage.className = `toast-message toast-${type}`;
  toastMessage.hidden = false;

  toastTimer = setTimeout(() => {
    toastMessage.hidden = true;
  }, 4000);
}

// ==========================================
// Tema Oscuro / Claro
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem("devfinder_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  const theme = savedTheme || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("devfinder_theme", newTheme);
}

// ==========================================
// Funciones de Utilidad
// ==========================================
function formatDate(isoString) {
  try {
    if (!isoString) return "--";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  } catch (e) {
    return isoString;
  }
}

function formatNumber(num) {
  try {
    return new Intl.NumberFormat("es-ES", {
      notation: "compact",
      compactDisplay: "short"
    }).format(num);
  } catch (e) {
    return num.toString();
  }
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
