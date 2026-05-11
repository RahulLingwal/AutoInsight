document.addEventListener("DOMContentLoaded", () => {
    const carsContainer = document.getElementById('cars-container');
    const noCars = document.getElementById('no-cars');
    const filterCheckboxes = document.querySelectorAll('.filter-item input');

    const fetchCars = async () => {
        try {
            // Collect Filters
            const filters = {};
            filterCheckboxes.forEach(input => {
                if (input.checked) {
                    const type = input.dataset.type;
                    
                    if (type === 'price') {
                        const min = input.dataset.min;
                        const max = input.dataset.max;
                        if (min !== '0' || max !== '999') {
                            filters['price_min'] = [min];
                            filters['price_max'] = [max];
                        }
                        return;
                    }

                    const val = input.value;
                    if (!filters[type]) filters[type] = [];
                    filters[type].push(val);
                }
            });

            // Construct Query String
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                // Join multiple selections with commas for the backend to handle with IN()
                params.append(key, filters[key].join(','));
            });

            const res = await fetch(`../backend/cars/get_cars.php?${params.toString()}`);
            const data = await res.json();
            carsContainer.innerHTML = '';
            
            if (!data.success || !data.cars || data.cars.length === 0) {
                noCars.style.display = 'block';
                document.getElementById('current-count').textContent = '0';
                document.getElementById('total-count').textContent = '0';
                return;
            }

            noCars.style.display = 'none';
            document.getElementById('current-count').textContent = data.cars.length;
            document.getElementById('total-count').textContent = data.cars.length;
            
            data.cars.forEach(car => {
                const isFeatured = car.is_featured == 1;
                const iconFilter = 'invert(48%) sepia(96%) saturate(1469%) hue-rotate(195deg) brightness(101%) contrast(101%)';
                
                const card = document.createElement('article');
                card.className = 'car-card-wrapper';
                card.style.cursor = 'pointer';
                card.onclick = () => window.location.href = `car-details.html?id=${car.id}`;
                
                card.innerHTML = `
                    <div class="car-card" style="background: rgba(22, 23, 30, 0.95); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; overflow: hidden; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        ${isFeatured ? '<div style="position: absolute; top: 15px; right: 15px; background: linear-gradient(135deg, #ff1f1f, #d40000); color: white; padding: 5px 14px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; z-index: 10; box-shadow: 0 4px 15px rgba(255, 31, 31, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">Featured</div>' : ''}
                        
                        <div style="height: 200px; width: 100%; overflow: hidden; position: relative;">
                            <img src="../${car.image_path || ''}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
                            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(to top, rgba(22, 23, 30, 1), transparent);"></div>
                        </div>

                        <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; margin-top: -20px; position: relative; z-index: 2;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <h4 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 2px; color: white; letter-spacing: -0.5px;">${car.brand} ${car.model}</h4>
                                    <p style="font-size: 0.85rem; color: rgba(255,255,255,0.4); font-weight: 600;">${car.year} Model</p>
                                </div>
                                <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.2); padding: 5px 10px; border-radius: 12px; display: flex; align-items: center; gap: 6px;">
                                    <img src="../Asset/Icons/star.png" style="width: 12px;">
                                    <span style="color: #ffc107; font-weight: 800; font-size: 0.85rem;">${car.avg_rating ? parseFloat(car.avg_rating).toFixed(1) : '4.5'}</span>
                                </div>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 10px; margin: 0.2rem 0;">
                                <div style="display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.5); font-size: 0.8rem; font-weight: 600;">
                                    <img src="../Asset/Icons/review-chat.svg" style="width: 15px; filter: ${iconFilter};">
                                    <span>${car.review_count || 0} reviews</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 20px;">
                                    <div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.5); font-size: 0.8rem; font-weight: 600;">
                                        <img src="../Asset/Icons/fuel.svg" style="width: 15px; filter: ${iconFilter};">
                                        <span>${car.fuel_type}</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.5); font-size: 0.8rem; font-weight: 600;">
                                        <img src="../Asset/Icons/people.svg" style="width: 15px; filter: ${iconFilter};">
                                        <span>${car.seats} Seats</span>
                                    </div>
                                </div>
                            </div>

                            <div style="height: 1px; background: rgba(255,255,255,0.06);"></div>

                            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                <div>
                                    <p style="font-size: 0.7rem; color: rgba(255,255,255,0.3); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Starting from</p>
                                    <h3 style="font-size: 1.6rem; font-weight: 900; color: #1a87ff; letter-spacing: -1px;">₹${car.price_lakh}L</h3>
                                </div>
                                <button style="background: #1a87ff; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 15px rgba(26, 135, 255, 0.3);">View Details</button>
                            </div>
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
