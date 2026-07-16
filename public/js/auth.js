import { apiRequest } from "./api.js";

// Checks if a session is active and toggles the navbar accordingly.
async function checkAuth() {
  const res = await apiRequest("/auth/me");
  const authLinks = document.getElementById("auth-links");
  const userInfo = document.getElementById("user-info");
  const userEmailSpan = document.getElementById("user-email");

  if (res.ok && res.userWithoutPassword) {
    authLinks.style.display = "none";
    userInfo.style.display = "inline-flex";
    userEmailSpan.textContent = res.userWithoutPassword.email;
  } else {
    authLinks.style.display = "inline-flex";
    userInfo.style.display = "none";
  }
  return res.ok;
}

async function handleLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorBox = document.getElementById("login-error");
  errorBox.style.display = "none";

  const res = await apiRequest("/auth/login", "POST", { email, password });
  if (res.ok) {
    window.location.href = "/index.html";
  } else {
    document.getElementById("login-error-text").textContent = res.message || "Login failed.";
    errorBox.style.display = "flex";
  }
}

async function handleSignup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorBox = document.getElementById("signup-error");
  errorBox.style.display = "none";

  const res = await apiRequest("/auth/signup", "POST", { email, password });
  if (res.ok) {
    window.location.href = "/login.html";
  } else {
    document.getElementById("signup-error-text").textContent = res.message || "Signup failed.";
    errorBox.style.display = "flex";
  }
}

async function handleLogout() {
  await apiRequest("/auth/logout", "POST");
  window.location.href = "/login.html";
}

// Toggles between light and dark mode and remembers the choice.
function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initThemeToggle();

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.addEventListener("click", handleLogin);

  const signupBtn = document.getElementById("signup-btn");
  if (signupBtn) signupBtn.addEventListener("click", handleSignup);

  // Hamburger menu — toggles the nav open/closed on small screens
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navLinks = document.getElementById("nav-links");
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      hamburgerBtn.classList.toggle("active");
    });

    // Close the menu automatically if a link inside it is clicked
    navLinks.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("click", () => {
        navLinks.classList.remove("open");
        hamburgerBtn.classList.remove("active");
      });
    });
  }
});

export { checkAuth };
