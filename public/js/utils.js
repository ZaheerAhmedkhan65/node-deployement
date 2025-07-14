const formatRelativeTime = (dateString) => {
    if (!dateString) return "Just now";
    
    try {
        const now = new Date();
        const postDate = new Date(dateString);
        
        // Handle invalid dates
        if (isNaN(postDate.getTime())) {
            return "Some time ago";
        }
        
        const seconds = Math.floor((now - postDate) / 1000);
        
        if (seconds < 60) {
            return `${seconds}s ago`;
        }
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return `${minutes}min ago`;
        }
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return `${hours}h ago`;
        }
        
        // For dates older than 24 hours
        return postDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short'
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return "Some time ago";
    }
}