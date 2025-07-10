// Add this helper function (you can put it in a utilities file)
const formatRelativeTime = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
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
    
    // For dates older than 24 hours, show the day and month
    return postDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short'
    });
}


const formateDate = (dateString) => {
    const postDate = new Date(dateString);
    return postDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

module.exports = { formatRelativeTime, formateDate };