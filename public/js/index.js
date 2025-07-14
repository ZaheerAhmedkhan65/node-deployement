document.addEventListener('DOMContentLoaded', async () => {
    const postsContainer = document.querySelector('.posts-container');
    const timeFilters = document.querySelectorAll('.time-filter');
    
    // Cache for already loaded posts
    const postsCache = new Map();

    // Function to load posts
    const loadTrendingPosts = async (period = '7 DAY') => {
        try {
            // Show cached content immediately if available
            if (postsCache.has(period)) {
                postsContainer.innerHTML = postsCache.get(period);
                setupReactionButtons();
                return;
            }
            
            // Show loading state
            postsContainer.innerHTML = `
                <div class="text-center my-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
            
            // Fetch data with cache-busting
            const response = await fetch(`/posts/trending?period=${encodeURIComponent(period)}&_=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const posts = await response.json();
            
            if (!posts || !Array.isArray(posts)) {
                throw new Error('Invalid posts data received');
            }
            
            postsContainer.innerHTML = '';
            // Render posts
            posts.forEach((post) => {
                postsContainer.appendChild(postTemplate(post));
            })
            
            // Cache the rendered HTML
            postsCache.set(period, postsContainer.innerHTML);
            
            // Initialize event listeners
            setupReactionButtons();

        } catch (error) {
            console.error('Error loading trending posts:', error);
            postsContainer.innerHTML = `
                <div class="alert alert-danger">
                    Failed to load trending posts. ${error.message}
                </div>
            `;
        }
    };

    // Time filter event listeners with debounce
    let debounceTimer;
    timeFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            clearTimeout(debounceTimer);
            timeFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            // Debounce to prevent rapid clicks
            debounceTimer = setTimeout(() => {
                loadTrendingPosts(this.dataset.period);
            }, 200);
        });
    });
    // Initial load
    loadTrendingPosts();
});
