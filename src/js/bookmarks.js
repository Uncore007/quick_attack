import { qs } from './utils.mjs';
import bookmarksData from '../data/bookmarks.json';

export default class BookmarksModule {
  constructor() {
    this.bookmarksList = qs('.bookmarks ul');
  }

  async init() {
    try {
      this.renderBookmarks(bookmarksData.bookmarks);
      this.addEventListeners();
    } catch (error) {
      console.error('Error initializing bookmarks:', error);
      this.renderError();
    }
  }

  renderBookmarks(bookmarks) {
    if (!this.bookmarksList) return;
    
    this.bookmarksList.innerHTML = bookmarks.map(bookmark => `
      <li data-id="${bookmark.id}">
        <i class="${bookmark.icon}"></i>
        <a href="${bookmark.url}" target="_blank">${bookmark.title}</a>
      </li>
    `).join('');
  }

  addEventListeners() {
    const bookmarkItems = document.querySelectorAll('.bookmarks li');
    bookmarkItems.forEach(item => {
      item.addEventListener('click', (event) => {
        // Prevent default only if the click wasn't on the anchor tag
        if (event.target.tagName !== 'A') {
          event.preventDefault();
          const link = item.querySelector('a');
          if (link) {
            window.open(link.href, '_blank');
          }
        }
      });
    });
  }

  renderError() {
    if (!this.bookmarksList) return;
    
    this.bookmarksList.innerHTML = `
      <li><i class="fas fa-exclamation-circle"></i> Unable to load bookmarks</li>
    `;
  }
}