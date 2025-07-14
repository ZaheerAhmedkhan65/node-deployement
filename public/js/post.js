document.addEventListener("DOMContentLoaded", () => {
    const post = JSON.parse(document.getElementById("post-data").textContent);
    const userId = "<%= user.userId %>";
    const userData = JSON.parse(document.getElementById("user-data").textContent);
    
    let postsContainer = document.querySelector(".posts-container");
    
    // Show loading state
    postsContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading post...</p>
        </div>
    `;

    setTimeout(() => {
        // Clear loading state
        postsContainer.innerHTML = '';
        // Append the DOM element directly
        const postElement = postTemplate(post);
        if (postElement.innerHTML !== '') { // Check if not empty div
            postsContainer.appendChild(postElement);
            setupReactionButtons();
        }
    }, 500);
});