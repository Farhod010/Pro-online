/* ProSkill Manager Dashboard Interactivity Script */

document.addEventListener("DOMContentLoaded", function() {
    // 1. Initialize Dark/Light Theme
    initTheme();

    // 2. Add keyboard shortcut for global search focus
    document.addEventListener("keydown", function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById("globalSearchInput");
            if (searchInput) searchInput.focus();
        }
    });
});

// ============ THEME MANAGEMENT ============
function initTheme() {
    const savedTheme = localStorage.getItem("manager-theme") || "dark";
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("manager-theme", theme);
    
    // Update theme icon in topbar
    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) {
        if (theme === "light") {
            themeIcon.className = "bi bi-sun-fill";
        } else {
            themeIcon.className = "bi bi-moon-fill";
        }
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
}

// ============ MOBILE SIDEBAR DRAWER ============
function toggleSidebar() {
    const sidebar = document.getElementById("appSidebar");
    if (sidebar) {
        sidebar.classList.toggle("active");
    }
}

// ============ LIVE CLIENT-SIDE TABLE SEARCH ============
function triggerGlobalSearch(query) {
    const lowercaseQuery = query.toLowerCase().trim();
    
    // Look for any table rows on the page
    const tableRows = document.querySelectorAll(".custom-table tbody tr");
    
    if (tableRows.length === 0) return;

    tableRows.forEach(row => {
        // Skip empty row placeholders
        if (row.cells.length === 1 && row.cells[0].getAttribute("colspan")) return;
        
        let rowText = row.textContent.toLowerCase();
        
        if (rowText.includes(lowercaseQuery)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}
