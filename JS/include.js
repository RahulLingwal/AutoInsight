document.addEventListener("DOMContentLoaded", () => {
    const isRoot = !window.location.pathname.includes("/HTML/");
    const headerPath = isRoot ? "HTML/header.html" : "header.html";

    fetch(headerPath)
        .then(response => response.text())
        .then(data => {
            const headerContainer = document.getElementById("header");
            if (!headerContainer) return;
            
            headerContainer.innerHTML = data;

            // 1. Path Fixing
            const links = headerContainer.querySelectorAll("a");
            const images = headerContainer.querySelectorAll("img");

            links.forEach(link => {
                let href = link.getAttribute("href");
                if (!href) return;
                
                if (isRoot) {
                    if (href.startsWith("../HTML/")) link.setAttribute("href", href.replace("../HTML/", "HTML/"));
                    if (href.startsWith("../Asset/")) link.setAttribute("href", href.replace("../Asset/", "Asset/"));
                } else {
                    if (href === "index.html") link.setAttribute("href", "../index.html");
                }
            });

            images.forEach(img => {
                let src = img.getAttribute("src");
                if (!src) return;
                if (isRoot && src.startsWith("../Asset/")) {
                    img.setAttribute("src", src.replace("../Asset/", "Asset/"));
                }
            });

            // 2. Auth Logic
            const user = JSON.parse(sessionStorage.getItem('ai_user') || 'null');
            const loggedOut = document.getElementById('nav-logged-out');
            const loggedIn  = document.getElementById('nav-logged-in');

            if (user && loggedOut && loggedIn) {
                loggedOut.style.display = 'none';
                loggedIn.style.display  = 'flex';
                
                // Populate Dropdown & Pill
                document.getElementById('nav-user-name').textContent = user.name;
                document.getElementById('dropdown-name').textContent = user.name;
                document.getElementById('dropdown-email').textContent = user.email;
                
                // Handle Avatar
                if (user.avatar) {
                    const avatarPath = isRoot ? user.avatar : '../' + user.avatar;
                    document.getElementById('nav-avatar').src = avatarPath;
                    document.getElementById('dropdown-avatar').src = avatarPath;
                }

                // Dropdown Toggle
                const pill = document.getElementById('profile-pill');
                const dropdown = document.getElementById('profile-dropdown');
                
                pill.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('active');
                });

                document.addEventListener('click', () => {
                    dropdown.classList.remove('active');
                });

                // Path fixing for injected dropdown links
                const prefix = isRoot ? 'HTML/' : '';
                document.getElementById('dropdown-profile-link').href = prefix + 'profile.html';
                document.getElementById('dropdown-settings-link').href = prefix + 'profile.html?tab=settings';

                // Admin Panel link injection if needed (as a regular nav item)
                if (user.role === 'admin') {
                    const navList = headerContainer.querySelector('.navlist');
                    const adminLi = document.createElement('li');
                    adminLi.className = 'navlist-items';
                    const assetPrefix = isRoot ? 'Asset/' : '../Asset/';
                    adminLi.innerHTML = `<a href="${prefix}admin.html"><img class="icons" src="${assetPrefix}Icons/profile.svg" alt="Admin" />Admin Panel</a>`;
                    navList.appendChild(adminLi);
                }
            }

            // 3. Highlight Active Page
            const currentPage = window.location.pathname.split("/").pop() || "index.html";
            const navLinks = headerContainer.querySelectorAll(".navlist-items a");
            
            navLinks.forEach(link => {
                const linkHref = link.getAttribute("href");
                if (!linkHref) return;
                const linkPage = linkHref.split("/").pop().split("#")[0];
                if (linkPage === currentPage) {
                    link.parentElement.classList.add("active");
                }
            });

            // 4. Logout Handler
            const logoutBtn = document.getElementById('nav-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    try {
                        const path = isRoot ? 'backend/auth/logout.php' : '../backend/auth/logout.php';
                        await fetch(path, { method: 'POST' });
                    } catch (e) {}
                    sessionStorage.removeItem('ai_user');
                    window.location.href = isRoot ? 'index.html' : '../index.html';
                });
            }
        })
    // --- Footer Inclusion ---
    const footerPath = isRoot ? "HTML/footer.html" : "footer.html";
    fetch(footerPath)
        .then(response => response.text())
        .then(data => {
            const footerContainers = document.querySelectorAll(".footer");
            footerContainers.forEach(container => {
                container.outerHTML = data;
            });

            // Re-select after injection to fix paths
            const freshFooter = document.querySelector("footer.footer");
            if (freshFooter) {
                const links = freshFooter.querySelectorAll("a");
                links.forEach(link => {
                    let href = link.getAttribute("href");
                    if (!href || href.startsWith("#")) return;

                    if (isRoot) {
                        // index.html is in root, footer links are relative to HTML/
                        if (!href.includes("://") && !href.startsWith("../")) {
                            link.setAttribute("href", "HTML/" + href);
                        }
                        if (href.startsWith("../index.html")) {
                            link.setAttribute("href", "index.html");
                        }
                    } else {
                        // Pages in HTML/ directory
                        if (href === "index.html") link.setAttribute("href", "../index.html");
                    }
                });
            }
        })
        .catch(e => console.error("Error loading footer:", e));
});
