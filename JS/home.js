document.addEventListener("DOMContentLoaded", () => {
    const featuredContainer = document.getElementById('featured-cars-container');
    const topRatedContainer = document.getElementById('top-rated-cars-container');
    const reviewsContainer = document.getElementById('latest-reviews-container');

    const renderCarCard = (car) => {
        return `
            <div class="car-card shadow">
                <div class="car-img-container">
                    <img src="${car.image_url}" alt="${car.brand} ${car.model}" />
                </div>
                <div class="car-details">
                    <div class="car-description">
                        <div>
                            <div class="car-name">
                                <p>${car.brand} ${car.model}</p>
                                <p>${car.year} Model</p>
                            </div>
                            <div class="ratings">
                                <img class="icons" src="Asset/Icons/star.png" alt="Star Icon" />
                                <p>${car.avg_rating || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="reviews">
                            <img class="icons" src="Asset/Icons/review-chat.svg" alt="Review Icon" />
                            <p>${car.review_count} reviews</p>
                        </div>
                        <div class="fuel-and-capacity">
                            <div class="fuel">
                                <img class="icons" src="Asset/Icons/fuel.svg" alt="Fuel Icon" />
                                <p>${car.fuel_type}</p>
                            </div>
                            <div class="seat-capacity">
                                <img class="icons" src="Asset/Icons/people.svg" alt="People Icon" />
                                <p>${car.seats} seats</p>
                            </div>
                        </div>
                    </div>
                    <hr class="index-hr" />
                    <div class="car-price">
                        <div class="cost">
                            <p>Starting From</p>
                            <p>₹${car.price_lakh}L</p>
                        </div>
                        <button class="view-details" onclick="window.location.href='HTML/car-details.html?id=${car.id}'">View Details</button>
                    </div>
                </div>
            </div>
        `;
    };

    const renderReviewCard = (review) => {
        const stars = Array(5).fill('Asset/Icons/star.svg').map((src, i) => 
            `<img src="${src}" alt="star" style="${i < review.rating ? '' : 'filter: grayscale(1); opacity: 0.3;'}">`
        ).join('');

        const date = new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        return `
            <div class="review-card shadow">
                <div class="card-head-flex">
                    <div class="profile">
                        <img src="${review.avatar || 'Asset/Images/person1.jpg'}" alt="person">
                    </div>
                    <div class="review-head-container">
                        <div class="head-content-flex">
                            <h4>${review.author}</h4>
                            <div class="rating-flex">${stars}</div>
                        </div>
                        <button>${review.brand} ${review.model}</button>
                    </div>
                </div>
                <h3>${review.title}</h3>
                <p>${review.body.substring(0, 150)}${review.body.length > 150 ? '...' : ''}</p>
                <div class="review-time-flex">
                    <div class="date-flex">
                        <img src="Asset/Icons/date.svg" alt="date">
                        <span>${date}</span>
                    </div>
                    <span>•</span>
                    <span>Owned for 6 months</span>
                </div>
            </div>
        `;
    };

    // Load Featured Cars
    fetch('backend/cars/get_cars.php?featured=1')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.cars) {
                featuredContainer.innerHTML = data.cars.slice(0, 4).map(renderCarCard).join('');
            }
        });

    // Load Top Rated Cars
    fetch('backend/cars/get_cars.php?sort=rating')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.cars) {
                topRatedContainer.innerHTML = data.cars.slice(0, 4).map(renderCarCard).join('');
            }
        });

    // Load Latest Reviews
    fetch('backend/reviews/get_reviews.php')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.reviews) {
                reviewsContainer.innerHTML = data.reviews.slice(0, 3).map(renderReviewCard).join('');
            }
        });
});
