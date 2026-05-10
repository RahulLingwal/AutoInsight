document.addEventListener("DOMContentLoaded", () => {
    const modalOverlay = document.getElementById("post-modal-overlay");
    const openModalBtn = document.getElementById("open-modal-btn");
    const closeModalX = document.getElementById("close-modal-x");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const typeBtns = document.querySelectorAll(".type-btn");
    const postTitleInput = document.getElementById("post-title");
    const postDescTextarea = document.getElementById("post-desc");

    // Open Modal
    openModalBtn.addEventListener("click", () => {
        modalOverlay.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent background scroll
    });

    // Close Modal Function
    const closeModal = () => {
        modalOverlay.classList.remove("active");
        document.body.style.overflow = "auto";
    };

    closeModalX.addEventListener("click", closeModal);
    closeModalBtn.addEventListener("click", closeModal);

    // Close on overlay click
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Toggle Post Type
    typeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            typeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Update placeholders based on type
            const type = btn.getAttribute("data-type");
            if (type === "tip") {
                postTitleInput.placeholder = "Share your helpful tip...";
                postDescTextarea.placeholder = "Explain your tip in detail. Include steps, tools needed, and any helpful advice...";
            } else {
                postTitleInput.placeholder = "Report a car problem...";
                postDescTextarea.placeholder = "Describe the problem in detail. When does it happen? What have you tried so far?";
            }
        });
    });

    // Handle Comment Toggle
    const toggleCommentsBtns = document.querySelectorAll(".toggle-comments");
    toggleCommentsBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const postCard = btn.closest(".post-card");
            const commentsSection = postCard.querySelector(".comments-section");
            if (commentsSection) {
                commentsSection.classList.toggle("active");
            }
        });
    });

    // Handle Form Submission → POST to backend
    const postForm = document.querySelector(".modal-form");
    postForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = JSON.parse(sessionStorage.getItem('ai_user') || 'null');
        if (!user) {
            alert('Please log in to create a post.');
            window.location.href = '../HTML/login.html';
            return;
        }

        const activeTypeBtn  = document.querySelector(".type-btn.active");
        const type        = activeTypeBtn?.getAttribute('data-type') || 'tip';
        const title       = document.getElementById('post-title').value.trim();
        const description = document.getElementById('post-desc').value.trim();
        const tags        = document.getElementById('post-tags').value.trim();
        const submitBtn   = postForm.querySelector('.publish-btn');

        submitBtn.textContent = 'Publishing...';
        submitBtn.disabled = true;

        try {
            const res  = await fetch('../backend/tips/create_post.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ type, title, description, tags })
            });
            const data = await res.json();

            if (data.success) {
                closeModal();
                postForm.reset();
                typeBtns[0].classList.add('active');
                // Reload page to show the new post
                window.location.reload();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Server error. Make sure XAMPP is running.');
        } finally {
            submitBtn.textContent = 'Publish Post';
            submitBtn.disabled = false;
        }
    });
});
