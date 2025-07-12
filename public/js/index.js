document.addEventListener('DOMContentLoaded', async () => {
    const postsContainer = document.querySelector('.posts-container');
    const timeFilters = document.querySelectorAll('.time-filter');
    
    // Cache for already loaded posts
    const postsCache = new Map();
    
    // Pre-compiled template
    const postTemplate = (post) => {
      // Skip rendering draft posts if the visitor is not the owner
      if (!post.published_at && post.user.id != userId) {
          return document.createElement('div'); // Return empty div that won't be displayed
      }
    const postElement = document.createElement('div');
    postElement.classList.add('card', 'rounded-0', 'post-card');
    postElement.id = `post-${post.id}`;
    postElement.innerHTML = `
            <div class="card-body">
                    <div class="d-flex align-items-statrt mb-2">
                        <a href="/users/${post.user.id}/profile" class="text-decoration-none">
                        <img src="${post.user.avatar || '/images/default-avatar.png'}" 
                             alt="${post.user.name}" 
                             class="rounded-circle me-2 border border-2 border-primary"
                             width="40" 
                             height="40"
                             loading="lazy">
                        </a>
                        <div class="d-flex flex-column w-100">
                          <div class="d-flex justify-content-between mb-2" >
                            <div class="d-flex align-items-start">
                              <div class="d-flex flex-column">
                                <a href="/users/${post.user.id}/profile" class="text-decoration-none">
                                  <p class="m-0 mb-auto fw-bold post-author-name" style="line-height: 1;">${post.user.name}</p>
                                </a>
                                <a href="/users/${post.user.id}/profile" class="text-decoration-none">
                                  <p class="m-0 mb-auto post-author-name text-muted" style="line-height: 1;">@${post.user.email.split('@')[0]}</p>
                                </a>
                              </div>
                              <p class="m-0 text-muted" style="line-height: 1; font-size: 1rem;"><i class="bi bi-dot"></i> ${post.created_at}</p>
                              ${post.user.id  == userId ? `
                            </div>
                            <div class="d-flex align-items-center gap-2">
                              <span class="post-status">
                                ${post.published_at ? '' : '<span class="badge bg-secondary">Draft</span>'}
                              </span>
                              ` : ''}
                              <div class="dropdown">
                                <button class="border-0 bg-transparent p-0 " type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                  <i class="bi bi-three-dots"></i>
                                </button>
                                <ul class="dropdown-menu p-0">
                                  ${post.user.id == userId ? `
                                  <li class="dropdown-item p-0">
                                  <button id="edit-post-btn-${post.id}" class="dropdown-item edit-post-btn" 
                                    data-bs-toggle="modal" data-bs-target="#editPostModal" 
                                    data-id="${post.id}"
                                    data-title="${post.title}" 
                                    data-content="${post.content}"
                                    data-published_at="${post.published_at}">
                                    <i class="bi bi-pencil"></i>
                                    Edit
                                  </button>
                                  </li>
                                  <li class="dropdown-item p-0">
                                    <button type="button" data-post-id="${post.id}" class="dropdown-item delete-post-btn">
                                      <i class="bi bi-trash"></i>
                                      Delete
                                    </button>
                                  </li>
                                  ` : ''}
                                </ul>
                              </div>
                            </div>
                          </div>
                            <p class="card-title fw-semibold post-title m-0 mb-1" style="line-height: 1; font-size: 1.2rem;">${post.title}</p>
                            <p class="card-text post-content" style="line-height: 1; font-size: 1rem;">${formatPostContent(post.content)}</p>
                        </div>
                    </div>
                </div>

                <div class="card-footer bg-transparent py-0">
                  <div class="d-flex align-items-center justify-content-between reaction-buttons">
                        <button class="btn p-0 btn-sm bg-transparent border-0 outline-0 ${post.userReaction === 'like' ? 'text-primary' : 'text-dark'} like-btn" 
                                data-post-id="${post.id}">
                            <i class="bi bi-hand-thumbs-up"></i> <span class="like-count">${post.likes || 0}</span>
                        </button>
                        <button class="btn p-0 btn-sm bg-transparent border-0 outline-0 ${post.userReaction === 'dislike' ? 'text-primary' : 'text-dark'} dislike-btn" 
                                data-post-id="${post.id}">
                            <i class="bi bi-hand-thumbs-down"></i> <span class="dislike-count">${post.dislikes || 0}</span>
                        </button>
                        <button class="btn p-0 btn-sm bg-transparent border-0 outline-0 ${post.hasReposted ? 'text-primary' : 'text-dark'} repost-btn" 
                                data-post-id="${post.id}">
                            <i class="bi bi-arrow-repeat"></i> <span class="repost-count">${post.reposts || 0}</span>
                        </button>
                    </div>
                </div>
                    
            </div>
    `;
    return postElement;
  }

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
                const postElement = postTemplate(post);
                postsContainer.appendChild(postElement);
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


function formatPostContent(content) {
  if (!content) return '';

  // Convert fenced code blocks (e.g., ```js\ncode\n```)
  content = content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Convert inline code (`code`)
  content = content.replace(/`([^`\n]+)`/g, (match, code) => {
    return `<code>${escapeHtml(code)}</code>`;
  });

  // Convert URLs into clickable links
  content = content.replace(/(https?:\/\/[^\s]+)/g, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });

  // Convert line breaks to <br> for HTML rendering
  content = content.replace(/\n/g, '<br>');

  return content;
}

// Helper to escape HTML characters
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
