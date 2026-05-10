document.addEventListener("DOMContentLoaded", () => {
    // Determine path to header.html
    const isRoot = !window.location.pathname.includes("/HTML/");
    const headerPath = isRoot ? "HTML/header.html" : "header.html";

	fetch(headerPath)
		.then((response) => response.text())
		.then((data) => {
			document.getElementById("header").innerHTML = data;

            // Fix link paths if in root
            if (isRoot) {
                const links = document.querySelectorAll("#header a");
                links.forEach(link => {
                    let href = link.getAttribute("href");
                    // If href starts with ../HTML/, remove the ../
                    if (href && href.startsWith("../HTML/")) {
                        link.setAttribute("href", href.replace("../HTML/", "HTML/"));
                    }
                    // If href is ../Asset/, remove ../
                    if (href && href.startsWith("../Asset/")) {
                        link.setAttribute("href", href.replace("../Asset/", "Asset/"));
                    }
                    // If href is index.html, keep it as is (already fixed in header.html)
                });
                
                const navImages = document.querySelectorAll("#header img");
                navImages.forEach(img => {
                    let src = img.getAttribute("src");
                    if (src && src.startsWith("../Asset/")) {
                        img.setAttribute("src", src.replace("../Asset/", "Asset/"));
                    }
                });
            } else {
                // If in HTML folder, and link points to index.html, it should be ../index.html
                const links = document.querySelectorAll("#header a");
                links.forEach(link => {
                    let href = link.getAttribute("href");
                    if (href === "index.html") {
                        link.setAttribute("href", "../index.html");
                    }
                });
            }
			
			// Highlight active page in navbar
			const currentPath = window.location.pathname;
			const currentPage = currentPath.split("/").pop() || "index.html";
			
			const navLinks = document.querySelectorAll("#header a");
			
			navLinks.forEach(link => {
				const linkHref = link.getAttribute("href");
                if (!linkHref) return;

                const linkPage = linkHref.split("/").pop().split("#")[0];
				
				if (linkPage === currentPage) {
                    // Check if it's a navlist item
					if (link.parentElement.classList.contains("navlist-items")) {
					    link.parentElement.classList.add("active");
                    }
                    
                    // Highlight Write Review link (which is in navlist-items)
                    if (currentPage === "review.html" && linkHref.includes("review.html")) {
                        link.parentElement.classList.add("active");



                    }

                    // Highlight Login/Signup buttons if we are on those pages
                    if ((currentPage === "login.html" || currentPage === "signup.html") && linkHref.includes(currentPage)) {
                        const btn = link.querySelector("button");
                        if (btn) {
                            btn.style.backgroundColor = "rgb(26, 135, 255)";
                            btn.style.boxShadow = "0 0 15px rgba(26, 135, 255, 0.4)";
                            btn.style.border = "none";
                        }
                    }
				}
			});
		})
		.catch((error) => console.error("Error loading header:", error));
});
