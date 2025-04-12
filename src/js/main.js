import { qs, getLocalStorage, setLocalStorage } from './utils.mjs';
import BookmarksModule from './bookmarks.js';
import { initWeather } from './weather.js';
import { initNews } from './news.js';
import { initTodo } from './todo.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize weather
  initWeather();
  
  // Initialize bookmarks
  const bookmarksModule = new BookmarksModule();
  bookmarksModule.init();
  
  // Initialize news
  initNews();
  
  // Initialize todo list
  initTodo();
  
  // Add login button functionality
  const loginButton = qs('.login');
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      // Simple login modal
      const modal = document.createElement('div');
      modal.className = 'login-modal';
      modal.innerHTML = `
        <div class="login-content">
          <span class="close-modal">&times;</span>
          <h2>Sign In</h2>
          <form id="login-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" placeholder="Username" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" placeholder="Password" required>
            </div>
            <button type="submit">Sign In</button>
          </form>
          <p class="demo-note">Demo only: Any username/password will work</p>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add animation class after a short delay
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
      
      // Close modal functionality
      const closeBtn = modal.querySelector('.close-modal');
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
      
      // Handle form submission (demo only)
      const form = modal.querySelector('#login-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = qs('#username').value;
        
        // Close modal
        modal.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
        
        // Update login button text
        loginButton.innerHTML = `<i class="fas fa-user"></i> ${username}`;
        
        // Show welcome notification
        showNotification(`Welcome, ${username}!`);
      });
    });
  }
});

// Add notification system
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-info-circle"></i>
      <p>${message}</p>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Add show class after a brief delay for animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}