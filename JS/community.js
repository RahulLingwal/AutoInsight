document.addEventListener("DOMContentLoaded", () => {
    const modalOverlay = document.getElementById("discussion-modal-overlay");
    const openModalBtn = document.getElementById("new-discussion-btn");
    const closeModalX = document.getElementById("close-discussion-x");
    const closeModalBtn = document.getElementById("close-discussion-btn");
    const discussionForm = document.querySelector(".modal-form");

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

    // Handle Replies Toggle
    const toggleReplyBtns = document.querySelectorAll(".toggle-replies");
    toggleReplyBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const discussionCard = btn.closest(".discussion-card");
            const repliesSection = discussionCard.querySelector(".replies-section");
            if (repliesSection) {
                repliesSection.classList.toggle("active");
                // Scroll into view smoothly when opening
                if (repliesSection.classList.contains("active")) {
                    repliesSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }
            }
        });
    });

    // Handle Post Reply button → POST to backend
    const postReplyBtns = document.querySelectorAll(".post-reply-btn");
    postReplyBtns.forEach(btn => {
        btn.addEventListener("click", async () => {
            const user = JSON.parse(sessionStorage.getItem('ai_user') || 'null');
            if (!user) {
                alert('Please log in to post a reply.');
                window.location.href = '../HTML/login.html';
                return;
            }

            const wrapper      = btn.closest(".reply-input-wrapper");
            const textarea     = wrapper.querySelector(".reply-textarea");
            const replyText    = textarea.value.trim();
            const card         = btn.closest(".discussion-card");
            const discussionId = card?.dataset?.discussionId || 1; // set via data attribute

            if (!replyText) {
                textarea.style.borderBottom = "1px solid rgb(220, 53, 69)";
                return;
            }
            textarea.style.borderBottom = '';
            btn.textContent = 'Posting...';
            btn.disabled = true;

            try {
                const res  = await fetch('../backend/community/add_reply.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ discussion_id: discussionId, reply_text: replyText })
                });
                const data = await res.json();

                if (data.success) {
                    const reply = data.reply;
                    const replyList = btn.closest(".replies-section").querySelector(".replies-list");
                    const newCard = document.createElement('div');
                    newCard.className = 'reply-card';
                    newCard.style.borderLeftColor = '#00c853';
                    newCard.innerHTML = `
                        <div class="reply-user-info">
                            <img src="../Asset/Images/person1.jpg" class="user-avatar" alt="User">
                            <span class="username">${reply.author}</span>
                            <span class="discussion-date">Just now</span>
                        </div>
                        <p class="reply-text">${reply.reply_text}</p>
                    `;
                    replyList.appendChild(newCard);
                    textarea.value = '';
                    newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert('Server error. Make sure XAMPP is running.');
            } finally {
                btn.textContent = 'Post Reply';
                btn.disabled = false;
            }
        });
    });

    // Handle Discussion Form Submission → POST to backend
    discussionForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = JSON.parse(sessionStorage.getItem('ai_user') || 'null');
        if (!user) {
            alert('Please log in to post a discussion.');
            window.location.href = '../HTML/login.html';
            return;
        }

        const title    = document.getElementById('discussion-title').value.trim();
        const category = document.getElementById('discussion-category').value;
        const body     = document.getElementById('discussion-desc').value.trim();
        const submitBtn = discussionForm.querySelector('.publish-btn');

        submitBtn.textContent = 'Posting...';
        submitBtn.disabled = true;

        try {
            const res  = await fetch('../backend/community/create_discussion.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ title, category, body })
            });
            const data = await res.json();

            if (data.success) {
                closeModal();
                discussionForm.reset();
                window.location.reload();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Server error. Make sure XAMPP is running.');
        } finally {
            submitBtn.textContent = 'Post Discussion';
            submitBtn.disabled = false;
        }
    });
});
