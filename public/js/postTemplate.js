function postTemplate(post) {
  if (!post.published_at && post.user.id != userId) {
    return document.createElement('div');
  }

  const postElement = document.createElement('div');
  postElement.classList.add('card', 'rounded-0', 'post-card');
  postElement.id = `post-${post.id}`;
  postElement.innerHTML = `
    <div class="card-body">
      <div class="d-flex">
        <a href="/${post.user.name}" class="me-2 text-decoration-none">
          <img src="${post.user.avatar || '/images/default-avatar.png'}"
               alt="${post.user.name}"
               class="rounded-circle border border-2 border-primary"
               width="40" height="40" loading="lazy">
        </a>
        <div class="w-100 position-relative">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <div>
              <a href="/${post.user.name}" class="fw-bold text-decoration-none text-primary d-block truncate-text" style="line-height:1;">
                ${post.user.name}
              </a>
              <a href="/${post.user.name}" class="text-muted text-decoration-none d-block truncate-text" style="line-height:1;">
                @${post.user.email.split('@')[0]}
              </a>
            </div>
            <div class="d-flex align-items-center ms-auto gap-2">
              <span class="text-muted small">${formatRelativeTime(post.created_at)} <i class="bi bi-dot"></i> </span>
              ${post.user.id == userId ? `
              <span class="post-status">
                ${post.published_at ? '' : post.scheduled_at ? 
                  '<span class="badge bg-info">Scheduled</span>' : 
                  post.is_draft ? '<span class="badge bg-secondary">Draft</span>' : ''}
              </span>` : ''}
              <div class="dropdown">
                <button class="btn btn-sm p-0 bg-transparent border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-three-dots"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow">
                  ${post.user.id == userId ? `
                    <li>
                      <button id="edit-post-btn-${post.id}" class="dropdown-item edit-post-btn"
                              data-bs-toggle="modal" data-bs-target="#editPostModal"
                              data-id="${post.id}"
                              data-content="${escapeHtml(post.content)}"
                              data-published_at="${post.published_at || ''}"
                              data-media_url="${post.media_url || ''}"
                              data-is_draft="${!post.published_at}">
                        <i class="bi bi-pencil me-1"></i> Edit
                      </button>
                    </li>
                    <li>
                      <button type="button" data-post-id="${post.id}" class="dropdown-item delete-post-btn">
                        <i class="bi bi-trash me-1"></i> Delete
                      </button>
                    </li>
                  ` : ''}
                </ul>
              </div>
            </div>
          </div>
          <a href="/${post.user.name}/status/${post.id}" class="text-decoration-none text-dark">
            <p class="card-text post-content mb-2 text-break" style="line-height: 1.3; word-break: break-word;">
              ${formatPostContent(post.content)}
            </p>
          </a>
          ${post.media_url ? `
            <img src="${post.media_url}" alt="Post Image" class="img-fluid rounded-3 post-image mb-2">` : ''}
        </div>
      </div>
    </div>

    <div class="card-footer bg-transparent py-1">
      <div class="d-flex align-items-center justify-content-between reaction-buttons my-1 px-2">
        <button class="btn p-0 btn-sm bg-transparent border-0 ${post.userReaction === 'like' ? 'text-primary' : 'text-dark'} like-btn"
                data-post-id="${post.id}">
          <i class="bi bi-hand-thumbs-up"></i> <span class="like-count">${post.likes || 0}</span>
        </button>
        <button class="btn p-0 btn-sm bg-transparent border-0 ${post.userReaction === 'dislike' ? 'text-primary' : 'text-dark'} dislike-btn"
                data-post-id="${post.id}">
          <i class="bi bi-hand-thumbs-down"></i> <span class="dislike-count">${post.dislikes || 0}</span>
        </button>
        <button class="btn p-0 btn-sm bg-transparent border-0 ${post.hasReposted ? 'text-primary' : 'text-dark'} repost-btn"
                data-post-id="${post.id}">
          <i class="bi bi-arrow-repeat"></i> <span class="repost-count">${post.reposts || 0}</span>
        </button>
      </div>
    </div>
  `;
  return postElement;
}

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