document.addEventListener("DOMContentLoaded", () => {
    const stars = document.querySelectorAll('.star-rating input');
    const ratingDisplay = document.getElementById('current-rating');
    const reviewForm = document.querySelector('.review-form');
    const reviewTextarea = document.getElementById('review-description');
    const charCountDisplay = reviewTextarea.nextElementSibling;

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
        
        const user = JSON.parse(sessionStorage.getItem('ai_user') || 'null');
        if (!user) {
            alert('Please log in to submit a review.');
            window.location.href = 'login.html';
            return;
        }

        const submitBtn = reviewForm.querySelector('.submit-btn');
        const formData = new FormData(reviewForm);
        const data = {
            car_id: formData.get('car_id'),
            rating: formData.get('rating'),
            title: formData.get('Review Title'),
            description: formData.get('Review Description'),
            ownership_duration: document.getElementById('ownership-duration').value
        };

        if (data.description.length < 100) {
            alert('Your review must be at least 100 characters long.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const res = await fetch('../backend/reviews/submit_review.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.success) {
                alert('Review submitted successfully! Thank you for your feedback.');
                window.location.href = 'cars.html';
            } else {
                alert(result.message || 'Failed to submit review.');
            }
        } catch (err) {
            alert('Server error. Make sure XAMPP is running.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Review';
        }
    });
});
