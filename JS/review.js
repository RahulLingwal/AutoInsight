document.addEventListener("DOMContentLoaded", () => {
    const stars = document.querySelectorAll('.star-rating input');
    const ratingDisplay = document.getElementById('current-rating');
    const reviewForm = document.querySelector('.review-form');
    const reviewTextarea = document.getElementById('review-description');
    const charCountDisplay = reviewTextarea.nextElementSibling;

    // ── Edit/Auto-fill Mode Logic ────────────────────────────
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const autoCarId = urlParams.get('car_id');
    const autoCarName = urlParams.get('car_name');

    if (autoCarName) {
        const parts = autoCarName.split(' ');
        if (parts.length >= 2) {
            document.getElementById('car-brand-input').value = parts[0];
            document.getElementById('car-model-input').value = parts.slice(1).join(' ');
        } else {
            document.getElementById('car-brand-input').value = autoCarName;
        }
    }

    if (editId) {
        document.querySelector('.review-page-header h2').textContent = 'Edit Your Review';
        document.querySelector('.submit-btn').textContent = 'Update Review';
        
        // Load existing data
        fetch(`../backend/reviews/get_review_details.php?id=${editId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const r = data.review;
                    // Attempt to split if it was stored as single string previously
                    const parts = (r.car_name || "").split(' ');
                    if (parts.length >= 2) {
                        document.getElementById('car-brand-input').value = parts[0];
                        document.getElementById('car-model-input').value = parts.slice(1).join(' ');
                    } else {
                        document.getElementById('car-brand-input').value = r.car_name;
                    }

                    document.getElementById('review-title').value = r.review_title || r.title;
                    document.getElementById('review-description').value = r.review_description || r.body;
                    
                    // Set rating
                    if (r.rating) {
                        const star = document.getElementById(`star${r.rating}`);
                        if (star) {
                            star.checked = true;
                            ratingDisplay.textContent = r.rating;
                        }
                    }
                    
                    // Trigger character count
                    reviewTextarea.dispatchEvent(new Event('input'));
                }
            });
    }

    // Star rating change handler
    stars.forEach(star => {
        star.addEventListener('change', (e) => {
            ratingDisplay.textContent = e.target.value;
        });
    });

    // Character count handler
    reviewTextarea.addEventListener('input', () => {
        const count = reviewTextarea.value.length;
        charCountDisplay.textContent = `Minimum 100 characters (${count}/100)`;
        if (count >= 100) {
            charCountDisplay.style.color = '#00c853';
        } else {
            charCountDisplay.style.color = '';
        }
    });

    // Form submission
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Review form submission started...");
        
        const user = JSON.parse(sessionStorage.getItem('ai_user') || 'null');
        if (!user) {
            alert('Please log in to submit a review.');
            window.location.href = 'login.html';
            return;
        }

        const submitBtn = reviewForm.querySelector('.submit-btn');
        const formData = new FormData(reviewForm);
        
        // Debug: Log all form data
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        const data = {
            edit_id: editId,
            car_id: autoCarId,
            car_brand: formData.get('car_brand'),
            car_model: formData.get('car_model'),
            car_name: formData.get('car_brand') + ' ' + formData.get('car_model'),
            rating: formData.get('rating'),
            title: formData.get('review_title'),
            body: formData.get('review_description'),
            ownership_duration: document.getElementById('ownership-duration').value,
            maintenance_cost: document.getElementById('maintenance-cost').value,
            recommend: formData.get('choice') // 'yes' or 'no'
        };

        if (!data.rating) {
            alert('Please select a star rating.');
            return;
        }

        if (data.body.length < 100) {
            alert('Your review must be at least 100 characters long.');
            return;
        }

        console.log("Sending data to backend:", data);

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const res = await fetch('../backend/reviews/submit_review.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            
            const text = await res.text();
            console.log("Raw server response:", text);
            
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse JSON:", e);
                alert('Server returned an invalid response. Check console for details.');
                return;
            }

            if (result.success) {
                alert('Review submitted successfully! Thank you for your feedback.');
                window.location.href = 'cars.html';
            } else {
                alert(result.message || 'Failed to submit review.');
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert('Server error. Make sure XAMPP is running.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Review';
        }
    });
});
