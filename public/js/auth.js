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
    errorBox.textContent = res.message || "Login failed.";
    errorBox.style.display = "block";
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
    errorBox.textContent = res.message || "Signup failed.";
    errorBox.style.display = "block";
  }
}

async function handleLogout() {
  await apiRequest("/auth/logout", "POST");
  window.location.href = "/login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

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
    });

    // Close the menu automatically if a link inside it is clicked
    navLinks.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }
});

export { checkAuth };
