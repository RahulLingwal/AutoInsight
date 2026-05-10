document.addEventListener("DOMContentLoaded", () => {
    const modalOverlay = document.getElementById("discussion-modal-overlay");
    const openModalBtn = document.getElementById("new-discussion-btn");
    const closeModalX = document.getElementById("close-discussion-x");
    const closeModalBtn = document.getElementById("close-discussion-btn");
    const discussionForm = document.querySelector(".modal-form");
    const forumFeed = document.querySelector(".forum-feed");
    const modalTitle = document.querySelector(".modal-header-text h2");
    const editIdInput = document.getElementById("edit-discussion-id");

    const currentUser = JSON.parse(sessionStorage.getItem('ai_user') || 'null');

    // Open Modal for New Discussion
    if (openModalBtn) {
        openModalBtn.addEventListener("click", () => {
            modalTitle.textContent = "Start a New Discussion";
            editIdInput.value = "";
            discussionForm.reset();
            modalOverlay.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    }

    const closeModal = () => {
        modalOverlay.classList.remove("active");
        document.body.style.overflow = "auto";
    };

    if (closeModalX) closeModalX.addEventListener("click", closeModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

    // Fetch and Render Discussions
    const fetchDiscussions = async (category = '') => {
        try {
            const url = `../backend/community/get_discussions.php?category=${encodeURIComponent(category)}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.success) {
                // 1. Update Stats with Animation
                const animateValue = (id, target) => {
                    const obj = document.getElementById(id);
                    if (!obj) return;
                    let start = 0;
                    const duration = 1000;
                    const step = (timestamp) => {
                        if (!start) start = timestamp;
                        const progress = Math.min((timestamp - start) / duration, 1);
                        const current = Math.floor(progress * target);
                        obj.textContent = current > 999 ? (current/1000).toFixed(1) + 'K' : current;
                        if (progress < 1) window.requestAnimationFrame(step);
                    };
                    window.requestAnimationFrame(step);
                };

                if (data.stats) {
                    animateValue('stat-threads', data.stats.threads);
                    animateValue('stat-posts', data.stats.posts);
                    animateValue('stat-online', data.stats.online);
                }

                // 2. Update Category Counts
                document.getElementById('count-all').textContent = data.stats.threads;
                const catMap = {
                    'Buying Advice': 'count-buying',
                    'Car Comparison': 'count-comparison',
                    'Electric Vehicles': 'count-ev',
                    'Safety': 'count-safety'
                };
                // Reset counts
                Object.values(catMap).forEach(id => document.getElementById(id).textContent = '0');
                data.categories.forEach(c => {
                    const id = catMap[c.category];
                    if (id) document.getElementById(id).textContent = c.count;
                });

                // 3. Render Feed
                forumFeed.innerHTML = '';
                if (data.discussions.length === 0) {
                    forumFeed.innerHTML = '<div style="text-align:center; padding:3rem; opacity:0.5;">No discussions yet in this category. Be the first to start one!</div>';
                    return;
                }

                data.discussions.forEach(d => {
                    const isOwner = currentUser && (currentUser.id == d.user_id);
                    const card = document.createElement('article');
                    card.className = 'discussion-card';
                    card.dataset.id = d.id;
                    card.innerHTML = `
                        <div class="discussion-header">
                            <img src="${d.avatar || '../Asset/Images/person1.jpg'}" alt="User" class="avatar">
                            <div class="discussion-user-meta">
                                <h5>${d.author}</h5>
                                <span class="discussion-date">${new Date(d.created_at).toLocaleDateString()}</span>
                            </div>
                            <span class="discussion-tag">${d.category}</span>
                            ${isOwner ? `
                                <div class="owner-actions" style="margin-left: auto; display: flex; gap: 8px;">
                                    <button class="edit-btn" onclick="openEditDiscussion(${JSON.stringify(d).replace(/"/g, '&quot;')})">Edit</button>
                                    <button class="delete-btn" onclick="deleteDiscussion(${d.id})">Delete</button>
                                </div>
                            ` : ''}
                        </div>
                        <h2 class="discussion-title">${d.title}</h2>
                        <p class="discussion-snippet">${d.body.substring(0, 200)}${d.body.length > 200 ? '...' : ''}</p>
                        <div class="discussion-footer">
                            <div class="discussion-stats">
                                <div class="stat-item toggle-replies" onclick="loadReplies(${d.id}, this)">
                                    <img src="../Asset/Icons/review-chat.svg" alt="Replies">
                                    ${d.reply_count} replies
                                </div>
                                <div class="stat-item">
                                    <img src="../Asset/Icons/profile.svg" alt="Views">
                                    ${d.views} views
                                </div>
                            </div>
                        </div>
                        <div class="replies-section" id="replies-${d.id}">
                            <div class="replies-list"></div>
                            <div class="reply-input-wrapper">
                                <textarea class="reply-textarea" placeholder="Write a reply..."></textarea>
                                <button class="post-reply-btn" onclick="postReply(${d.id}, this)">Post Reply</button>
                            </div>
                        </div>
                    `;
                    forumFeed.appendChild(card);
                });
            }
        } catch (err) {
            console.error("Error loading discussions:", err);
        }
    };

    fetchDiscussions();

    // Category Filter Handler
    const categoryNav = document.getElementById('category-nav');
    if (categoryNav) {
        categoryNav.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                categoryNav.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                fetchDiscussions(item.dataset.category);
            });
        });
    }

    // Discussion Creation OR Edit
    if (discussionForm) {
        discussionForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!currentUser) { alert('Please login first'); return; }

            const editId = editIdInput.value;
            const endpoint = editId ? '../backend/community/edit_discussion.php' : '../backend/community/create_discussion.php';

            const title = document.getElementById('discussion-title').value;
            const category = document.getElementById('discussion-category').value;
            const body = document.getElementById('discussion-desc').value;

            const payload = { title, category, body };
            if (editId) payload.discussion_id = editId;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                closeModal();
                fetchDiscussions();
                discussionForm.reset();
            } else {
                alert(data.message);
            }
        });
    }

    // Global action handlers
    window.openEditDiscussion = (d) => {
        modalTitle.textContent = "Edit Discussion";
        editIdInput.value = d.id;
        document.getElementById('discussion-title').value = d.title;
        document.getElementById('discussion-category').value = d.category;
        document.getElementById('discussion-desc').value = d.body;

        modalOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    window.deleteDiscussion = async (id) => {
        if (!confirm('Are you sure you want to delete this discussion?')) return;

        const res = await fetch('../backend/community/delete_discussion.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ discussion_id: id })
        });
        const data = await res.json();
        if (data.success) {
            fetchDiscussions();
        } else {
            alert(data.message);
        }
    };
});

// Global functions for inline actions
async function loadReplies(id, btn) {
    const section = document.getElementById(`replies-${id}`);
    const list = section.querySelector('.replies-list');
    section.classList.toggle('active');
    
    if (section.classList.contains('active') && list.children.length === 0) {
        list.innerHTML = 'Loading replies...';
        const res = await fetch(`../backend/community/get_replies.php?discussion_id=${id}`);
        const data = await res.json();
        if (data.success) {
            list.innerHTML = data.replies.length ? '' : 'No replies yet.';
            data.replies.forEach(r => {
                const div = document.createElement('div');
                div.className = 'reply-card';
                div.innerHTML = `
                    <div class="reply-user-info">
                        <img src="${r.avatar || '../Asset/Images/person1.jpg'}" class="user-avatar">
                        <span class="username">${r.author}</span>
                        <span class="discussion-date">${new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="reply-text">${r.reply_text}</p>
                `;
                list.appendChild(div);
            });
        }
    }
}

async function postReply(id, btn) {
    const user = JSON.parse(sessionStorage.getItem('ai_user') || 'null');
    if (!user) { alert('Please login first'); return; }

    const textarea = btn.previousElementSibling;
    const text = textarea.value.trim();
    if (!text) return;

    btn.disabled = true;
    const res = await fetch('../backend/community/add_reply.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ discussion_id: id, reply_text: text })
    });
    const data = await res.json();
    if (data.success) {
        textarea.value = '';
        const list = document.getElementById(`replies-${id}`).querySelector('.replies-list');
        const div = document.createElement('div');
        div.className = 'reply-card';
        div.innerHTML = `
            <div class="reply-user-info">
                <img src="${user.avatar || '../Asset/Images/person1.jpg'}" class="user-avatar">
                <span class="username">${user.name}</span>
                <span class="discussion-date">Just now</span>
            </div>
            <p class="reply-text">${text}</p>
        `;
        list.appendChild(div);
    }
    btn.disabled = false;
}
