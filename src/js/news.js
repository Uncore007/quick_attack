import { getLocalStorage, setLocalStorage } from './utils.mjs';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

function isCacheValid(cacheKey) {
  const cachedData = getLocalStorage(cacheKey);
  if (!cachedData) return false;
  
  const now = new Date().getTime();
  return (now - cachedData.timestamp) < NEWS_CACHE_DURATION;
}

async function getNews() {
  const cacheKey = 'news_ca_english';
  
  if (isCacheValid(cacheKey)) {
    return getLocalStorage(cacheKey).data;
  }
  
  try {
    const response = await fetch(
      `https://api.thenewsapi.com/v1/news/top?api_token=${NEWS_API_KEY}&locale=ca&language=en&search=Canada&limit=5`
    );
    
    if (!response.ok) {
      throw new Error(`News data fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    setLocalStorage(cacheKey, {
      timestamp: new Date().getTime(),
      data: data
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}

function renderNews(newsData) {
  if (!newsData || !newsData.data) return;
  
  const newsContainer = document.querySelector('.news');
  if (!newsContainer) return;
  
  // Clear existing news items
  newsContainer.innerHTML = '<h2><i class="fas fa-newspaper"></i> News</h2>';
  
  const articles = newsData.data.slice(0, 5); // Get up to 3 articles
  
  articles.forEach(article => {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    
    // Format the published date
    const publishedDate = new Date(article.published_at);
    const formattedDate = publishedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    newsItem.innerHTML = `
      <h3>${article.title}</h3>
      <p class="news-date">${formattedDate}</p>
      <p class="news-excerpt">${article.description?.substring(0, 100) || ''}...</p>
    `;
    
    // Add click event to open the article in a new tab
    newsItem.addEventListener('click', () => {
      window.open(article.url, '_blank');
    });
    
    newsContainer.appendChild(newsItem);
  });
}

async function initNews() {
  try {
    const news = await getNews();
    renderNews(news);
  } catch (error) {
    console.error('News initialization error:', error);
    const newsContainer = document.querySelector('.news');
    if (newsContainer) {
      newsContainer.innerHTML = '<h2><i class="fas fa-newspaper"></i> News</h2>';
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'news-item error';
      errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> Unable to load news data`;
      newsContainer.appendChild(errorMessage);
    }
  }
}

export { initNews };