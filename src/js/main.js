import { qs, getLocalStorage, setLocalStorage } from './utils.mjs';
import BookmarksModule from './bookmarks.js';
import { initWeather } from './weather.js';
import { initNews } from './news.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize weather
  initWeather();
  
  // Initialize bookmarks
  const bookmarksModule = new BookmarksModule();
  bookmarksModule.init();
  
  // Initialize news
  initNews();
});