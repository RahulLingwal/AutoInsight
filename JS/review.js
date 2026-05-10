document.addEventListener("DOMContentLoaded", () => {
    const stars = document.querySelectorAll('.star-rating input');
    const ratingDisplay = document.getElementById('current-rating');

    stars.forEach(star => {
        star.addEventListener('change', (e) => {
            ratingDisplay.textContent = e.target.value;
        });
    });
});
