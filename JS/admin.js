document.addEventListener("DOMContentLoaded", () => {
    const carsTableBody = document.getElementById('cars-table-body');
    const carModal = document.getElementById('car-modal');
    const carForm = document.getElementById('car-form');
    const openAddModalBtn = document.getElementById('open-add-modal');
    const closeModalBtn = document.getElementById('close-modal');

    // Stats elements
    const statCars = document.getElementById('stat-cars');
    const statReviews = document.getElementById('stat-reviews');
    const statUsers = document.getElementById('stat-users');

    // ── Load Admin Data ──────────────────────────────────────────
    const loadAdminData = async () => {
        try {
            const res = await fetch('../backend/cars/get_cars.php');
            const cars = await res.json();
            
            statCars.textContent = cars.length;
            renderCarsTable(cars);

            // Mock other stats for now
            statReviews.textContent = '1,234';
            statUsers.textContent = '850';
        } catch (err) {
            console.error("Failed to load admin data:", err);
        }
    };

    const renderCarsTable = (cars) => {
        carsTableBody.innerHTML = cars.map(car => `
            <tr>
                <td><img src="../${car.image_path}" class="car-thumb" onerror="this.src='../Asset/Images/porsche.jpg'"></td>
                <td>${car.brand}</td>
                <td>${car.model}</td>
                <td>${car.year}</td>
                <td>₹${car.price_lakh}L</td>
                <td>${car.fuel_type}</td>
                <td>
                    <div class="actions-btns">
                        <button class="edit-btn" onclick="editCar(${car.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteCar(${car.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    // ── Modal Handlers ───────────────────────────────────────────
    openAddModalBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Car';
        carForm.reset();
        document.getElementById('car-id').value = '';
        carModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        carModal.classList.remove('active');
    });

    // ── Form Submission ──────────────────────────────────────────
    carForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(carForm);
        const data = Object.fromEntries(formData.entries());

        // For this prototype, we'll alert success as we don't have the full CRUD backend yet
        // In real app, you'd fetch('../backend/admin/manage_cars.php', { method: 'POST', body: JSON.stringify(data) })
        alert('Car details saved! (Backend endpoint manage_cars.php would be called here)');
        carModal.classList.remove('active');
        loadAdminData();
    });

    window.editCar = (id) => {
        alert('Edit functionality for ID ' + id + ' would open the modal with existing data.');
    };

    window.deleteCar = (id) => {
        if (confirm('Are you sure you want to delete this car?')) {
            alert('Car with ID ' + id + ' deleted! (Demo)');
        }
    };

    loadAdminData();
});
