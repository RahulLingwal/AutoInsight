document.addEventListener("DOMContentLoaded", () => {
    const featuredContainer = document.getElementById('featured-cars-container');
    const topRatedContainer = document.getElementById('top-rated-cars-container');
    const latestReviewsContainer = document.getElementById('latest-reviews-container');

    const loadHomeData = async () => {
        try {
            const res = await fetch('backend/get_homepage_data.php');
            const data = await res.json();

            if (data.success) {
                // 1. Update Stats with Animation
                const stats = data.stats;
                const animateValue = (id, target) => {
                    const obj = document.getElementById(id);
                    if (!obj) return;
                    let start = 0;
                    const duration = 1500;
                    const step = (timestamp) => {
                        if (!start) start = timestamp;
                        const progress = Math.min((timestamp - start) / duration, 1);
                        const current = Math.floor(progress * target);
                        obj.textContent = current + (target > 5 ? '+' : '');
                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        } else {
                            obj.textContent = target + (target > 5 ? '+' : '');
                        }
                    };
                    window.requestAnimationFrame(step);
                };

                animateValue('stat-cars', stats.cars);
                animateValue('stat-reviews', stats.reviews);
                animateValue('stat-users', stats.users);

                // 2. Populate Featured Cars
                featuredContainer.innerHTML = data.featured.map(car => createCarCard(car)).join('');

                // 3. Populate Top Rated Cars
                topRatedContainer.innerHTML = data.topRated.map(car => createCarCard(car)).join('');

                // 4. Populate Latest Reviews
                latestReviewsContainer.innerHTML = data.latestReviews.map(rev => `
                    <div class="review-card-item" style="background:#111218; padding:2rem; border-radius:24px; border:1px solid rgba(255,255,255,0.05); position:relative;">
                        <div style="display:flex; align-items:center; gap:15px; margin-bottom:1.5rem;">
                            <img src="${rev.user_avatar || 'Asset/Images/person1.jpg'}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">
                            <div>
                                <h4 style="margin:0;">${rev.user_name}</h4>
                                <p style="margin:0; font-size:0.8rem; color:rgba(255,255,255,0.5);">Verified Owner • ${rev.brand || ''} ${rev.model || rev.car_name}</p>
                            </div>
                        </div>
                        <div style="color:#ffc107; margin-bottom:1rem;">${'★'.repeat(rev.rating)}</div>
                        <h5 style="margin-bottom:0.8rem; font-size:1.1rem;">${rev.title}</h5>
                        <p style="color:rgba(255,255,255,0.7); line-height:1.6; font-size:0.95rem;">${rev.body.substring(0, 150)}...</p>
                        <a href="HTML/car-details.html?id=${rev.car_id}" style="color:#1a87ff; text-decoration:none; font-size:0.9rem; font-weight:700; display:inline-block; margin-top:1rem;">Read More →</a>
                    </div>
                `).join('');
            }
        } catch (err) {
            console.error("Home data error:", err);
        }
    };

    const createCarCard = (car) => {
        const isFeatured = car.is_featured == 1;
        // Blue filter for icons
        const iconFilter = 'invert(48%) sepia(96%) saturate(1469%) hue-rotate(195deg) brightness(101%) contrast(101%)';
        
        return `
            <div class="car-card" onclick="window.location.href='HTML/car-details.html?id=${car.id}'" style="background: rgba(22, 23, 30, 0.95); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; overflow: hidden; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                ${isFeatured ? '<div style="position: absolute; top: 15px; right: 15px; background: linear-gradient(135deg, #ff1f1f, #d40000); color: white; padding: 5px 14px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; z-index: 10; box-shadow: 0 4px 15px rgba(255, 31, 31, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">Featured</div>' : ''}
                
                <div style="height: 220px; width: 100%; overflow: hidden; position: relative;">
                    <img src="${car.image_path || 'Asset/Images/porsche.jpg'}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(to top, rgba(22, 23, 30, 1), transparent);"></div>
                </div>

                <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; margin-top: -20px; position: relative; z-index: 2;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h4 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 2px; color: white; letter-spacing: -0.5px;">${car.brand} ${car.model}</h4>
                            <p style="font-size: 0.85rem; color: rgba(255,255,255,0.4); font-weight: 600;">${car.year} Model</p>
                        </div>
                        <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.2); padding: 5px 10px; border-radius: 12px; display: flex; align-items: center; gap: 6px;">
                            <img src="Asset/Icons/star.png" style="width: 12px;">
                            <span style="color: #ffc107; font-weight: 800; font-size: 0.85rem;">${car.avg_rating ? parseFloat(car.avg_rating).toFixed(1) : '4.5'}</span>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 12px; margin: 0.5rem 0;">
                        <div style="display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.5); font-size: 0.8rem; font-weight: 600;">
                            <img src="Asset/Icons/review-chat.svg" style="width: 15px; filter: ${iconFilter};">
                            <span>${car.review_count || 0} reviews</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.5); font-size: 0.8rem; font-weight: 600;">
                                <img src="Asset/Icons/fuel.svg" style="width: 15px; filter: ${iconFilter};">
                                <span>${car.fuel_type}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.5); font-size: 0.8rem; font-weight: 600;">
                                <img src="Asset/Icons/people.svg" style="width: 15px; filter: ${iconFilter};">
                                <span>${car.seats} Seats</span>
                            </div>
                        </div>
                    </div>

                    <div style="height: 1px; background: rgba(255,255,255,0.06); margin: 0.2rem 0;"></div>

                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <p style="font-size: 0.7rem; color: rgba(255,255,255,0.3); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Starting from</p>
                            <h3 style="font-size: 1.7rem; font-weight: 900; color: #1a87ff; letter-spacing: -1px;">₹${car.price_lakh}L</h3>
                        </div>
                        <button style="background: #1a87ff; color: white; border: none; padding: 12px 22px; border-radius: 14px; font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 15px rgba(26, 135, 255, 0.3);" onmouseover="this.style.background='#0070e0'; this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(26, 135, 255, 0.4)'" onmouseout="this.style.background='#1a87ff'; this.style.transform='translateY(0)'; this.style.boxShadow='0 6px 15px rgba(26, 135, 255, 0.3)'">View Details</button>
                    </div>
                </div>
            </div>
        `;
    };

    loadHomeData();
});
