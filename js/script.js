// IMS566 Individual Project - JavaScript Logic
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const currentPage = window.location.pathname.split("/").pop();

  // Keep the sidebar preference consistent across authenticated pages.
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    const savedSidebarState = localStorage.getItem("sidebarCollapsed");
    const isMobileViewport = window.matchMedia("(max-width: 767.98px)").matches;
    const startsCollapsed = isMobileViewport || savedSidebarState === "true";

    function setSidebarCollapsed(collapsed) {
      document.body.classList.toggle("sidebar-collapsed", collapsed);
      document.body.classList.toggle("sidebar-expanded", !collapsed);
      sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
      sidebarToggle.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
      sidebarToggle.title = collapsed ? "Expand sidebar" : "Collapse sidebar";
    }

    setSidebarCollapsed(startsCollapsed);
    sidebarToggle.addEventListener("click", function () {
      const collapsed = !document.body.classList.contains("sidebar-collapsed");
      setSidebarCollapsed(collapsed);
      localStorage.setItem("sidebarCollapsed", String(collapsed));
    });
  }

  // Apply (Light / Dark Mode)
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const savedTheme = sessionStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeIcon) themeIcon.classList.replace("bi-moon-stars-fill", "bi-sun-fill");
  }
  if (themeToggle) {
    const isDark = document.body.classList.contains("dark-mode");
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      sessionStorage.setItem("theme", isDark ? "dark" : "light");

      if (themeIcon) {
        themeIcon.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
      }
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      themeToggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
      // Reload charts so label colors update
      location.reload();
    });
  }

  // Protect pages from unauthorized access
  if (!isLoggedIn && currentPage !== "index.html" && currentPage !== "") {
    window.location.href = "index.html";
  }

  // Display user name in navbar
  const userDisplay = document.getElementById("userDisplay");
  if (userDisplay && isLoggedIn) {
    userDisplay.textContent = localStorage.getItem("userName") || "User";
  }

  // Toggle between Login and Sign Up forms
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const showSignUp = document.getElementById("showSignUp");
  const showLogin = document.getElementById("showLogin");
  const authAlert = document.getElementById("authAlert");

  if (showSignUp) {
    showSignUp.addEventListener("click", function (e) {
      e.preventDefault();
      loginForm.classList.add("d-none");
      signupForm.classList.remove("d-none");
      if (authAlert) authAlert.classList.add("d-none");
    });
  }

  if (showLogin) {
    showLogin.addEventListener("click", function (e) {
      e.preventDefault();
      signupForm.classList.add("d-none");
      loginForm.classList.remove("d-none");
      if (authAlert) authAlert.classList.add("d-none");
    });
  }

  // Handle Login submission (Supports ID or Email)
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const loginInput = document.getElementById("loginEmail").value.trim().toLowerCase();
      const passwordInput = document.getElementById("loginPassword").value.trim();

      // Retrieve registered user details from localStorage (or use default demo values)
      const registeredId = (localStorage.getItem("studentId") || "2025176851").toLowerCase();
      const registeredEmail = (localStorage.getItem("userEmail") || "student@uitm.edu.my").toLowerCase();
      const registeredPassword = localStorage.getItem("userPassword") || "password123";

      const isIdOrEmailCorrect = (
        loginInput === registeredId || 
        loginInput === registeredEmail
      );
      const isPasswordCorrect = (passwordInput === registeredPassword);

      if (isIdOrEmailCorrect && isPasswordCorrect) {
        if (authAlert) authAlert.classList.add("d-none");
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "dashboard.html";
      } else {
        // Show specific red error alert
        if (authAlert) {
          authAlert.classList.remove("d-none");

          if (!isIdOrEmailCorrect && !isPasswordCorrect) {
            authAlert.textContent = "Invalid ID/Email and password entered.";
          } else if (!isIdOrEmailCorrect) {
            authAlert.textContent = "Invalid ID/Email entered. Please try again.";
          } else if (!isPasswordCorrect) {
            authAlert.textContent = "Incorrect password entered. Please try again.";
          }
        }
      }
    });
  }

  // Handle Sign Up submission (Saves ID, Email, Name, and Password)
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const nameInput = document.getElementById("signupName").value.trim();
      const idInput = document.getElementById("signupStudentId").value.trim();
      const emailInput = document.getElementById("signupEmail").value.trim();
      const passwordInput = document.getElementById("signupPassword").value.trim();

      localStorage.clear();
      sessionStorage.removeItem("theme");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", nameInput || "Nurul Hafizah");
      localStorage.setItem("studentId", idInput || "2025176851");
      localStorage.setItem("userEmail", emailInput || "student@uitm.edu.my");
      localStorage.setItem("userPassword", passwordInput || "password123");

      window.location.href = "dashboard.html";
    });
  }

  // Handle Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.clear();
      sessionStorage.removeItem("theme");
      window.location.href = "index.html";
    });
  }

  // Load page-specific charts
  loadCharts(currentPage);

  // Paginate the complaints list, showing five tickets on each page.
  const complaintTableBody = document.getElementById("complaintTableBody");
  const complaintPagination = document.getElementById("complaintPagination");
  if (complaintTableBody && complaintPagination) {
    const complaintRows = Array.from(complaintTableBody.rows);
    const ticketsPerPage = 5;
    const pageCount = Math.ceil(complaintRows.length / ticketsPerPage);

    function showComplaintPage(page) {
      complaintRows.forEach(function (row, index) {
        row.hidden = index < (page - 1) * ticketsPerPage || index >= page * ticketsPerPage;
      });

      complaintPagination.innerHTML = "";
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const pageItem = document.createElement("li");
        pageItem.className = "page-item" + (pageNumber === page ? " active" : "");

        const pageLink = document.createElement("button");
        pageLink.type = "button";
        pageLink.className = "page-link";
        pageLink.textContent = pageNumber;
        pageLink.setAttribute("aria-label", "Page " + pageNumber);
        if (pageNumber === page) pageLink.setAttribute("aria-current", "page");
        pageLink.addEventListener("click", function () {
          showComplaintPage(pageNumber);
        });

        pageItem.appendChild(pageLink);
        complaintPagination.appendChild(pageItem);
      }
    }

    if (pageCount > 0) showComplaintPage(1);
  }
});

// Chart.js graphs setup
function loadCharts(page) {
  if (typeof Chart === "undefined") return;
  
  const isDark = document.body.classList.contains("dark-mode");
  const chartTextColor = isDark ? '#f1f5f9' : '#212529';
  Chart.defaults.color = chartTextColor;
  Chart.defaults.plugins.tooltip = {
    enabled: true,
    displayColors: true,
    mode: 'nearest',
    intersect: false,
    backgroundColor: isDark ? '#252b34' : '#212529',
    titleColor: '#ffffff',
    bodyColor: '#ffffff',
    borderColor: isDark ? '#475569' : '#d1d5db',
    borderWidth: 1
  };

  // Dashboard Overview Chart
  if (page === "dashboard.html" || page === "") {
    const ctx = document.getElementById("overviewChart");
    if (ctx) {
      new Chart(ctx.getContext("2d"), {
        type: "bar",
        data: {
          labels: ["Pending", "In Progress", "Resolved"],
          datasets: [{
            label: "Tickets",
            data: [8, 12, 34],
            backgroundColor: ["#ffc107", "#0dcaf0", "#198754"]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: chartTextColor, font: { weight: 'bold' } } },
            y: { ticks: { color: chartTextColor, font: { weight: 'bold' } } }
          }
        }
      });
    }
  }

  // Analytics Page Charts
  if (page === "analytics.html") {
    const catCtx = document.getElementById("categoryChart");
    if (catCtx) {
      new Chart(catCtx.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: ["Plumbing", "Wi-Fi", "Electrical", "Furniture"],
          datasets: [{
            data: [18, 12, 8, 4],
            backgroundColor: ["#8a2be2", "#0dcaf0", "#ffc107", "#d0d0d0"]
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    const resCtx = document.getElementById("resolutionChart");
    if (resCtx) {
      new Chart(resCtx.getContext("2d"), {
        type: "bar",
        data: {
          labels: ["Block J1", "Block J2", "Block J3", "Block J4", "Block J5"],
          datasets: [
            { label: "Resolved", data: [15, 10, 9, 20, 5], backgroundColor: "#198754" },
            { label: "Pending", data: [3, 2, 3, 15, 1], backgroundColor: "#ffc107" }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: chartTextColor, font: { weight: 'bold' } } },
            y: { ticks: { color: chartTextColor, font: { weight: 'bold' } } }
          }
        }
      });
    }
  }
}