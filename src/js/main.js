import { qs } from './utils.mjs';

const DEFAULT_LOCATION = { lat: 49.6956, lon: -112.8451 };
const WEATHER_API_KEY = import.meta.env.VITE_TOMORROW_API_KEY;

async function getCurrentWeather(coords = DEFAULT_LOCATION) {
  try {
    const response = await fetch(
      `https://api.tomorrow.io/v4/weather/realtime?location=${coords.lat},${coords.lon}&units=metric&apikey=${WEATHER_API_KEY}`
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

async function getForecastWeather(coords = DEFAULT_LOCATION) {
  try {
    const response = await fetch(
      `https://api.tomorrow.io/v4/timelines?location=${coords.lat},${coords.lon}&fields=temperature,weatherCode,humidity,windSpeed&timesteps=1d&units=metric&apikey=${WEATHER_API_KEY}`
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

function renderWeather(currentData, forecastData) {
  if (!currentData || !currentData.data) return;
  
  const weatherCode = currentData.data.values.weatherCode;
  const weatherIcon = qs('.weather-icon');
  
  const iconMap = {
    0: "01d", // Clear
    1000: "01d", // Clear, Sunny
    1100: "02d", // Mostly Clear
    1101: "03d", // Partly Cloudy
    1102: "04d", // Mostly Cloudy
    1001: "04d", // Cloudy
    2000: "09d", // Fog
    4000: "09d", // Drizzle
    4001: "10d", // Rain
    4200: "11d", // Light Rain, Rain Shower
    4201: "11d", // Heavy Rain
    5000: "13d", // Snow
    5001: "13d", // Flurries
    5100: "13d", // Light Snow
    5101: "13d", // Heavy Snow
    6000: "09d", // Freezing Drizzle
    6001: "13d", // Freezing Rain
    6200: "13d", // Light Freezing Rain
    6201: "13d", // Heavy Freezing Rain
    7000: "13d", // Ice Pellets
    7101: "13d", // Heavy Ice Pellets
    7102: "13d", // Light Ice Pellets
    8000: "11d", // Thunderstorm
  };
  
  const iconCode = iconMap[weatherCode] || "01d";
  
  weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${currentData.data.values.weatherCode}">`;
  
  const temperature = qs('.temperature');
  temperature.textContent = `${Math.round(currentData.data.values.temperature)}°C`;
  
  const conditions = qs('.weather ul');
  conditions.innerHTML = `
    <li><i class="fas fa-cloud"></i> ${getWeatherDescription(weatherCode)}</li>
    <li><i class="fas fa-wind"></i> Wind: ${Math.round(currentData.data.values.windSpeed)} m/s</li>
    <li><i class="fas fa-tint"></i> Humidity: ${currentData.data.values.humidity}%</li>
  `;
  
  // Handle forecast if available
  if (forecastData && forecastData.data && forecastData.data.timelines) {
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
    
    const dailyForecasts = forecastData.data.timelines[0].intervals.slice(1, 4);
    
    dailyForecasts.forEach(forecast => {
      const date = new Date(forecast.startTime);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const weatherCode = forecast.values.weatherCode;
      const iconCode = iconMap[weatherCode] || "01d";
      
      const forecastItem = document.createElement('div');
      forecastItem.className = 'forecast-item';
      forecastItem.innerHTML = `
        <div class="day">${dayName}</div>
        <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${getWeatherDescription(weatherCode)}">
        <div class="temp">${Math.round(forecast.values.temperature)}°C</div>
      `;
      forecastItems.appendChild(forecastItem);
    });
  }
}

function getWeatherDescription(code) {
  const descriptions = {
    0: "Unknown",
    1000: "Clear, Sunny",
    1100: "Mostly Clear",
    1101: "Partly Cloudy",
    1102: "Mostly Cloudy",
    1001: "Cloudy",
    2000: "Fog",
    4000: "Drizzle",
    4001: "Rain",
    4200: "Light Rain",
    4201: "Heavy Rain",
    5000: "Snow",
    5001: "Flurries",
    5100: "Light Snow",
    5101: "Heavy Snow",
    6000: "Freezing Drizzle",
    6001: "Freezing Rain",
    6200: "Light Freezing Rain",
    6201: "Heavy Freezing Rain",
    7000: "Ice Pellets",
    7101: "Heavy Ice Pellets",
    7102: "Light Ice Pellets",
    8000: "Thunderstorm"
  };
  
  return descriptions[code] || "Unknown";
}

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

async function initWeather() {
  try {
    const location = await getUserLocation();
    const currentWeather = await getCurrentWeather(location);
    const forecastWeather = await getForecastWeather(location);
    renderWeather(currentWeather, forecastWeather);
  } catch (error) {
    console.error('Weather initialization error:', error);
    const conditions = qs('.weather ul');
    if (conditions) {
      conditions.innerHTML = `<li><i class="fas fa-exclamation-circle"></i> Unable to load weather data</li>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initWeather();
});