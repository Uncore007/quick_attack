import { qs } from './utils.mjs';

// OpenWeather API configuration
const WEATHER_API_KEY = 'd552372fbe653020f3fd587a95e08389'; 
const DEFAULT_LOCATION = { lat: 49.6956, lon: -112.8451 };

// Fetch current weather data (free API)
async function getCurrentWeather(coords = DEFAULT_LOCATION) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${WEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather data fetch failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
}

// Fetch forecast data (free API)
async function getForecastWeather(coords = DEFAULT_LOCATION) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${WEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Forecast data fetch failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching forecast weather:', error);
    return null;
  }
}

// Render weather data to the UI
function renderWeather(currentData, forecastData) {
  if (!currentData) return;
  
  // Current weather rendering
  const iconCode = currentData.weather[0].icon;
  const weatherIcon = qs('.weather-icon');
  weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${currentData.weather[0].description}">`;
  
  // Update temperature
  const temperature = qs('.temperature');
  temperature.textContent = `${Math.round(currentData.main.temp)}°C`;
  
  // Update conditions
  const conditions = qs('.weather ul');
  conditions.innerHTML = `
    <li><i class="fas fa-cloud"></i> ${currentData.weather[0].description}</li>
    <li><i class="fas fa-wind"></i> Wind: ${Math.round(currentData.wind.speed)} m/s</li>
    <li><i class="fas fa-tint"></i> Humidity: ${currentData.main.humidity}%</li>
  `;
  
  // Handle forecast if available
  if (forecastData && forecastData.list) {
    // Add forecast section
    const weatherSection = qs('.weather');
    
    // Remove existing forecast if it exists
    const existingForecast = weatherSection.querySelector('.forecast');
    if (existingForecast) {
      weatherSection.removeChild(existingForecast);
    }
    
    const forecastEl = document.createElement('div');
    forecastEl.className = 'forecast';
    forecastEl.innerHTML = '<h3>3-Day Forecast</h3><div class="forecast-items"></div>';
    weatherSection.appendChild(forecastEl);
    
    const forecastItems = qs('.forecast-items');
    
    // Get forecast for next three days at noon
    const dailyForecasts = extractDailyForecasts(forecastData.list, 3);
    
    dailyForecasts.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const forecastItem = document.createElement('div');
      forecastItem.className = 'forecast-item';
      forecastItem.innerHTML = `
        <div class="day">${dayName}</div>
        <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
        <div class="temp">${Math.round(forecast.main.temp)}°C</div>
      `;
      forecastItems.appendChild(forecastItem);
    });
  }
}

// Extract one forecast per day (around noon) from the 3-hour forecast data
function extractDailyForecasts(forecastList, days = 3) {
  const dailyForecasts = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Create a map to store one forecast per day (preferably around noon)
  const forecastsByDay = {};
  
  forecastList.forEach(forecast => {
    const forecastDate = new Date(forecast.dt * 1000);
    const forecastDay = forecastDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const forecastHour = forecastDate.getHours();
    
    // Skip today's forecasts
    if (forecastDate.getDate() === today.getDate() && 
        forecastDate.getMonth() === today.getMonth() && 
        forecastDate.getFullYear() === today.getFullYear()) {
      return;
    }
    
    // If we don't have this day yet, add it
    if (!forecastsByDay[forecastDay]) {
      forecastsByDay[forecastDay] = forecast;
    } 
    // If we have this day but the current forecast is closer to noon, replace it
    else if (Math.abs(forecastHour - 12) < Math.abs(new Date(forecastsByDay[forecastDay].dt * 1000).getHours() - 12)) {
      forecastsByDay[forecastDay] = forecast;
    }
  });
  
  // Convert to array and take first 'days' forecasts
  return Object.values(forecastsByDay).slice(0, days);
}

// Get user location if available, otherwise use default
function getUserLocation() {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        () => resolve(DEFAULT_LOCATION)
      );
    } else {
      resolve(DEFAULT_LOCATION);
    }
  });
}

// Initialize weather module
async function initWeather() {
  try {
    const location = await getUserLocation();
    const currentWeather = await getCurrentWeather(location);
    const forecastWeather = await getForecastWeather(location);
    renderWeather(currentWeather, forecastWeather);
  } catch (error) {
    console.error('Weather initialization error:', error);
    // Show error message in the weather section
    const conditions = qs('.weather ul');
    if (conditions) {
      conditions.innerHTML = `<li><i class="fas fa-exclamation-circle"></i> Unable to load weather data</li>`;
    }
  }
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initWeather();
});