document.addEventListener("DOMContentLoaded", () => {
    // Tab switching logic
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.dataset.tab;
            
            navItems.forEach(ni => ni.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            item.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Trigger specific loads
            if (tabId === 'dashboard') loadDashboard();
            if (tabId === 'cars') fetchCars();
            if (tabId === 'users') fetchUsers();
            if (tabId === 'settings') loadProfile();
        });
    });

    // ── Profile Logic ───────────────────────────────────────────
    const loadProfile = async () => {
        const res = await fetch('../backend/profile/get_profile.php');
        const data = await res.json();
        if (data.success) {
            const u = data.user;
            document.getElementById('admin-name-input').value = u.name;
            document.getElementById('admin-email-input').value = u.email;
            document.getElementById('admin-country-input').value = u.country || '';
            document.getElementById('admin-bio-input').value = u.bio || '';
        }
    };

    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('admin-name-input').value,
                country: document.getElementById('admin-country-input').value,
                bio: document.getElementById('admin-bio-input').value
            };

            const res = await fetch('../backend/profile/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert('Profile updated successfully!');
                const user = JSON.parse(sessionStorage.getItem('ai_user'));
                user.name = payload.name;
                sessionStorage.setItem('ai_user', JSON.stringify(user));
                location.reload();
            } else {
                alert(data.message);
            }
        });
    }

    // ── Dashboard Logic ───────────────────────────────────────────
    const loadDashboard = async () => {
        try {
            // Load Stats
            const statsRes = await fetch('../backend/admin/get_admin_stats.php');
            const statsData = await statsRes.json();
            if (statsData.success) {
                const s = statsData.stats;
                document.getElementById('stat-cars').textContent = s.cars;
                document.getElementById('stat-users').textContent = s.users;
                document.getElementById('stat-reviews').textContent = s.reviews;
                document.getElementById('stat-posts').textContent = s.posts;
            }

            // Load Activity
            const actRes = await fetch('../backend/admin/get_recent_activity.php');
            const actData = await actRes.json();
            if (actData.success) {
                const feed = document.getElementById('activity-feed');
                feed.innerHTML = actData.activity.map(a => `
                    <div class="activity-item">
                        <div class="activity-user-icon">${a.user.charAt(0)}</div>
                        <div class="activity-info">
                            <p><strong>${a.user}</strong> ${a.text}</p>
                        </div>
                        <div class="activity-time">${new Date(a.time).toLocaleString()}</div>
                    </div>
                `).join('');
            }
        } catch (err) {
            console.error("Error loading dashboard:", err);
        }
    };

    // ── Cars Logic ─────────────────────────────────────────────
    const carModal = document.getElementById('car-modal-overlay');
    const carForm = document.getElementById('car-form');
    const carsTableBody = document.getElementById('cars-table-body');

    const fetchCars = async () => {
        const res = await fetch('../backend/cars/get_cars.php');
        const data = await res.json();
        const cars = data.cars || [];
        
        carsTableBody.innerHTML = cars.map(car => `
            <tr>
                <td>
                    <div class="car-cell">
                        <img src="../${car.image_path}" onerror="this.src='../Asset/Images/porsche.jpg'">
                        <div>
                            <div class="brand-model">${car.brand} ${car.model}</div>
                            <div class="year">${car.year}</div>
                        </div>
                    </div>
                </td>
                <td>₹${car.price_lakh} Lakh</td>
                <td>
                    <div style="font-weight:600;">${car.fuel_type}</div>
                    <div style="font-size:0.8rem; color:#87a1af;">${car.body_type}</div>
                </td>
                <td>
                    <span class="badge ${car.is_featured ? 'featured' : 'normal'}">
                        ${car.is_featured ? 'Featured' : 'Standard'}
                    </span>
                </td>
                <td>
                    <div class="actions">
                        <button class="icon-btn edit" onclick="openEditCar(${JSON.stringify(car).replace(/"/g, '&quot;')})">✎</button>
                        <button class="icon-btn delete" onclick="deleteCar(${car.id})">🗑</button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    window.openEditCar = (car) => {
        document.getElementById('modal-title').textContent = 'Edit Vehicle';
        document.getElementById('car-id').value = car.id;
        carForm.brand.value = car.brand;
        carForm.model.value = car.model;
        carForm.year.value = car.year;
        carForm.price.value = car.price_lakh;
        carForm.fuel_type.value = car.fuel_type;
        carForm.body_type.value = car.body_type;
        carForm.seats.value = car.seats;
        carForm.engine.value = car.engine || "";
        carForm.transmission.value = car.transmission || "Manual";
        carForm.mileage.value = car.mileage || "";
        carForm.safety_rating.value = car.safety_rating || "";
        carForm.pros.value = car.pros || "";
        carForm.cons.value = car.cons || "";
        carForm.description.value = car.description || "";
        carForm.is_featured.checked = car.is_featured == 1;
        
        // Note: You cannot set the value of <input type="file"> for security.
        // The backend will keep old images if no new ones are uploaded.

        carModal.classList.add('active');
    };

    window.deleteCar = async (id) => {
        if (!confirm('Are you sure you want to delete this car?')) return;
        
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', id);

        const res = await fetch('../backend/cars/manage_car.php', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) fetchCars();
    };

    document.getElementById('open-add-car').addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Car';
        carForm.reset();
        document.getElementById('car-id').value = '';
        carModal.classList.add('active');
    });

    document.getElementById('close-car-modal').addEventListener('click', () => carModal.classList.remove('active'));
    document.getElementById('cancel-car-modal').addEventListener('click', () => carModal.classList.remove('active'));

    carForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(carForm);
        formData.append('action', 'save');
        formData.append('is_featured', carForm.is_featured.checked ? 1 : 0);

        const res = await fetch('../backend/cars/manage_car.php', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            carModal.classList.remove('active');
            fetchCars();
        } else {
            alert(data.message);
        }
    });

    // ── Users Logic ─────────────────────────────────────────────
    const fetchUsers = async () => {
        try {
            const res = await fetch('../backend/admin/get_users.php'); // Need to create this
            const data = await res.json();
            if (data.success) {
                const tbody = document.getElementById('users-table-body');
                tbody.innerHTML = data.users.map(u => `
                    <tr>
                        <td><strong>${u.name}</strong></td>
                        <td>${u.email}</td>
                        <td><span class="badge ${u.role === 'admin' ? 'featured' : 'normal'}">${u.role}</span></td>
                        <td>${new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                            <button class="icon-btn edit" onclick="toggleRole(${u.id}, '${u.role}')" title="Toggle Admin/User">🔄</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (e) {}
    };

    window.toggleRole = async (id, currentRole) => {
        if (!confirm(`Are you sure you want to change this user to ${currentRole === 'admin' ? 'User' : 'Admin'}?`)) return;
        
        try {
            const res = await fetch('../backend/admin/update_user_role.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, role: currentRole })
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
            } else {
                alert(data.message);
            }
        } catch (e) {
            alert('Failed to update user role.');
        }
    };

    // Logout

    // Initial load
    loadDashboard();
});
