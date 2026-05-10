document.addEventListener("DOMContentLoaded", () => {
    const modalOverlay = document.getElementById("post-modal-overlay");
    const openModalBtn = document.getElementById("open-modal-btn");
    const closeModalX = document.getElementById("close-modal-x");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const typeBtns = document.querySelectorAll(".type-btn");
    const postsFeed = document.querySelector(".posts-feed");
    const filterPills = document.querySelectorAll(".filter-pill");
    const postForm = document.querySelector(".modal-form");
    const modalTitle = document.querySelector(".modal-header-text h2");
    const editPostIdInput = document.getElementById("edit-post-id");

    const currentUser = JSON.parse(sessionStorage.getItem('ai_user') || 'null');

    // Open Modal for New Post
    if (openModalBtn) {
        openModalBtn.addEventListener("click", () => {
            modalTitle.textContent = "Create New Post";
            editPostIdInput.value = "";
            postForm.reset();
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

    // Fetch and Render Posts
    const fetchPosts = async (type = 'all') => {
        try {
            const res = await fetch(`../backend/tips/get_posts.php?type=${type}`);
            const data = await res.json();
            
            if (data.success) {
                postsFeed.innerHTML = '';
                if (data.posts.length === 0) {
                    postsFeed.innerHTML = '<div style="text-align:center; padding:3rem; opacity:0.5;">No posts found.</div>';
                    return;
                }

                data.posts.forEach(post => {
                    const isOwner = currentUser && (currentUser.id == post.user_id);
                    const card = document.createElement('article');
                    card.className = 'post-card';
                    card.innerHTML = `
                        <div class="post-voting">
                            <button class="vote-btn" onclick="votePost(${post.id}, 1, this)">▲</button>
                            <span class="vote-count">${post.votes}</span>
                            <button class="vote-btn" onclick="votePost(${post.id}, -1, this)">▼</button>
                        </div>
                        <div class="post-content">
                            <div class="post-user-info">
                                <img src="${post.avatar || '../Asset/Images/person1.jpg'}" alt="User" class="user-avatar">
                                <span class="username">${post.author}</span>
                                <div class="post-date">
                                    <img src="../Asset/Icons/date.svg" alt="Date" style="width: 14px;">
                                    ${new Date(post.created_at).toLocaleDateString()}
                                </div>
                                <span class="post-type-tag ${post.type}">${post.type}</span>
                                ${isOwner ? `
                                    <div class="owner-actions">
                                        <button class="edit-post-btn" onclick="openEditModal(${JSON.stringify(post).replace(/"/g, '&quot;')})">Edit</button>
                                        <button class="delete-post-btn" onclick="deletePost(${post.id})">Delete</button>
                                    </div>
                                ` : ''}
                            </div>
                            <h2 class="post-title">${post.title}</h2>
                            <p class="post-description">${post.description}</p>
                            <div class="post-tags">
                                ${post.tags_array.map(t => `<span class="tag"># ${t}</span>`).join('')}
                            </div>
                            <div class="post-actions">
                                <div class="action-item toggle-comments" onclick="loadComments(${post.id}, this)">
                                    <img src="../Asset/Icons/review-chat.svg" alt="Comments">
                                    ${post.comment_count} Comments
                                </div>
                            </div>
                        </div>
                        <div class="comments-section" id="comments-${post.id}">
                            <div class="comments-list"></div>
                            <div class="comment-input-area">
                                <textarea class="comment-textarea" placeholder="Write a comment..."></textarea>
                                <button class="post-comment-btn" onclick="postComment(${post.id}, this)">Post Comment</button>
                            </div>
                        </div>
                    `;
                    postsFeed.appendChild(card);
                });
            }
        } catch (err) {
            console.error("Error loading posts:", err);
        }
    };

    fetchPosts();

    // Filters
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const type = pill.textContent.toLowerCase().includes('tip') ? 'tip' : (pill.textContent.toLowerCase().includes('problem') ? 'problem' : 'all');
            fetchPosts(type);
        });
    });

    // Form submission (Create OR Edit)
    if (postForm) {
        postForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!currentUser) { alert('Please login first'); return; }

            const editId = editPostIdInput.value;
            const endpoint = editId ? '../backend/tips/edit_post.php' : '../backend/tips/create_post.php';
            
            const type = document.querySelector(".type-btn.active").dataset.type;
            const title = document.getElementById('post-title').value;
            const description = document.getElementById('post-desc').value;
            const tags = document.getElementById('post-tags').value;

            const payload = { type, title, description, tags };
            if (editId) payload.post_id = editId;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                closeModal();
                fetchPosts();
                postForm.reset();
            } else {
                alert(data.message);
            }
        });
    }

    // Global action handlers
    window.openEditModal = (post) => {
        modalTitle.textContent = "Edit Post";
        editPostIdInput.value = post.id;
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-desc').value = post.description;
        document.getElementById('post-tags').value = post.tags || "";
        
        // Set active type btn
        typeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === post.type);
        });

        modalOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    window.deletePost = async (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        const res = await fetch('../backend/tips/delete_post.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ post_id: id })
        });
        const data = await res.json();
        if (data.success) {
            fetchPosts();
        } else {
            alert(data.message);
        }
    };

    // Type toggles in modal
    typeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            typeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Make votePost globally accessible
    window.votePost = async (id, vote, btn) => {
        const user = JSON.parse(sessionStorage.getItem('ai_user') || 'null');
        if (!user) { alert('Please login first'); return; }

        try {
            const res = await fetch('../backend/tips/vote_post.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ post_id: id, vote: vote })
            });
            const data = await res.json();
            
            if (data.success) {
                // Find the count element
                const votingContainer = btn.closest('.post-voting');
                const countEl = votingContainer.querySelector('.vote-count');
                
                // Update text
                countEl.textContent = data.votes;
                
                // Visual feedback
                votingContainer.querySelectorAll('.vote-btn').forEach(b => b.style.color = '');
                if (data.action !== 'removed') {
                    btn.style.color = vote === 1 ? '#00c853' : '#ff1f1f';
                }
                
                // Temporary alert to confirm it's working without refresh
                console.log(`Vote updated to ${data.votes}`);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Voting error:", err);
            alert("Failed to vote. Please check your connection.");
        }
    };
});

async function loadComments(id, btn) {
    const section = document.getElementById(`comments-${id}`);
    const list = section.querySelector('.comments-list');
    section.classList.toggle('active');
    
    if (section.classList.contains('active') && list.children.length === 0) {
        list.innerHTML = 'Loading comments...';
        const res = await fetch(`../backend/tips/get_comments.php?post_id=${id}`);
        const data = await res.json();
        if (data.success) {
            list.innerHTML = data.comments.length ? '' : 'No comments yet.';
            data.comments.forEach(c => {
                const div = document.createElement('div');
                div.className = 'comment-card';
                div.innerHTML = `
                    <div class="comment-user-info">
                        <img src="${c.avatar || '../Asset/Images/person1.jpg'}" class="user-avatar">
                        <span class="username">${c.author}</span>
                        <span class="post-date">${new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="comment-text">${c.comment_text}</p>
                `;
                list.appendChild(div);
            });
        }
    }
}

async function postComment(id, btn) {
    const user = JSON.parse(sessionStorage.getItem('ai_user') || 'null');
    if (!user) { alert('Please login first'); return; }

    const textarea = btn.previousElementSibling;
    const text = textarea.value.trim();
    if (!text) return;

    btn.disabled = true;
    const res = await fetch('../backend/tips/add_comment.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ post_id: id, comment_text: text })
    });
    const data = await res.json();
    if (data.success) {
        textarea.value = '';
        const list = document.getElementById(`comments-${id}`).querySelector('.comments-list');
        const div = document.createElement('div');
        div.className = 'comment-card';
        div.innerHTML = `
            <div class="comment-user-info">
                <img src="${user.avatar || '../Asset/Images/person1.jpg'}" class="user-avatar">
                <span class="username">${user.name}</span>
                <span class="post-date">Just now</span>
            </div>
            <p class="comment-text">${text}</p>
        `;
        list.appendChild(div);
    }
    btn.disabled = false;
}
