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
        });
    });

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
        const cars = await res.json();
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
        carForm.image_path.value = car.image_path || "";
        carForm.image2.value = car.image2 || "";
        carForm.image3.value = car.image3 || "";
        carForm.image4.value = car.image4 || "";

        carModal.classList.add('active');
    };

    window.deleteCar = async (id) => {
        if (!confirm('Are you sure you want to delete this car?')) return;
        const res = await fetch('../backend/cars/manage_car.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ action: 'delete', id })
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
        const payload = Object.fromEntries(formData.entries());
        payload.action = 'save';
        payload.is_featured = carForm.is_featured.checked ? 1 : 0;

        const res = await fetch('../backend/cars/manage_car.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            carModal.classList.remove('active');
            fetchCars();
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

    // Logout
    document.getElementById('admin-logout')?.addEventListener('click', () => {
        sessionStorage.removeItem('ai_user');
        window.location.href = 'login.html';
    });

    // Initial load
    loadDashboard();
});
