document.addEventListener("DOMContentLoaded", () => {
    const carsContainer = document.getElementById('cars-container');
    const noCars = document.getElementById('no-cars');
    const filterCheckboxes = document.querySelectorAll('.filter-item input');

    const fetchCars = async () => {
        try {
            // In a real app, you'd send filters here. For now, just get all.
            const res = await fetch('../backend/cars/get_cars.php');
            const data = await res.json();
            carsContainer.innerHTML = '';
            
            if (!data.success || !data.cars || data.cars.length === 0) {
                noCars.style.display = 'block';
                return;
            }

            noCars.style.display = 'none';
            data.cars.forEach(car => {
                const card = document.createElement('article');
                card.className = 'car-card';
                card.innerHTML = `
                    ${car.is_featured ? '<span class="featured-badge">Featured</span>' : ''}
                    <div class="car-img-wrapper">
                        <img src="../${car.image_url}" alt="${car.brand} ${car.model}">
                    </div>
                    <div class="car-info">
                        <div class="car-title-row">
                            <h3>${car.brand} ${car.model}</h3>
                            <div class="rating-badge">
                                <img src="../Asset/Icons/star.png" alt="Star"> ${car.rating || 'N/A'}
                            </div>
                        </div>
                        <p class="model-year">${car.year} Model</p>
                        
                        <div class="reviews" style="margin-bottom: 1rem; color: #87a1af; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                            <img src="../Asset/Icons/review-chat.svg" style="width: 16px;"> ${car.review_count || 0} reviews
                        </div>

                        <div class="car-stats">
                            <div class="stat-item">
                                <img src="../Asset/Icons/fuel.svg" alt="Fuel"> ${car.fuel_type}
                            </div>
                            <div class="stat-item">
                                <img src="../Asset/Icons/people.svg" alt="Seats"> ${car.seats} Seats
                            </div>
                        </div>

                        <div class="car-footer">
                            <div class="price-box">
                                <p>Starting from</p>
                                <p class="price">₹${car.price}L</p>
                            </div>
                            <a href="car-details.html?id=${car.id}" class="view-btn" style="text-decoration:none; display:inline-block; line-height: normal; text-align: center;">View Details</a>
                        </div>
                    </div>
                `;
                carsContainer.appendChild(card);
            });
        } catch (err) {
            console.error("Error fetching cars:", err);
            carsContainer.innerHTML = '<p style="color:red; text-align:center;">Failed to load cars. Please try again later.</p>';
        }
    };

    fetchCars();

    // Re-fetch on filter change (simulated)
    filterCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            carsContainer.innerHTML = '<div class="loading-state"><p>Filtering...</p></div>';
            setTimeout(fetchCars, 300);
        });
    });
});
