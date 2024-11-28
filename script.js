const API_CONFIG = {
    key: '04b78ff2db37b1392ae7d0ca79fdc470',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    endpoints: {
        weather: '/weather',
        forecast: '/forecast'
    }
};

const buildApiUrl = (endpoint, params) => {
    const url = new URL(`${API_CONFIG.baseUrl}${endpoint}`);
    url.search = new URLSearchParams({
        ...params,
        appid: API_CONFIG.key,
        lang: 'fr'
    }).toString();
    return url;
};

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const locationName = document.querySelector('.location h1');
const dateElement = document.querySelector('.date');
const temperatureElement = document.querySelector('.temperature');
const descriptionElement = document.querySelector('.description');
const weatherIcon = document.querySelector('.weather-icon i');
const details = document.querySelectorAll('.detail-info p');
const forecastContainer = document.querySelector('.forecast-container');

const kelvinToCelsius = (kelvin) => {
    return Math.round(kelvin - 273.15);
};

const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
};

const updateWeatherIcon = (weatherCode) => {
    const iconMap = {
        '01': 'fa-sun',
        '02': 'fa-cloud-sun',
        '03': 'fa-cloud',
        '04': 'fa-cloud',
        '09': 'fa-cloud-rain',
        '10': 'fa-cloud-showers-heavy',
        '11': 'fa-bolt',
        '13': 'fa-snowflake',
        '50': 'fa-smog'
    };

    const iconPrefix = weatherCode.slice(0, 2);
    const iconClass = iconMap[iconPrefix] || 'fa-sun';
    weatherIcon.className = `fas ${iconClass}`;
};

async function getCurrentWeather(city) {
    try {
        const weatherUrl = buildApiUrl(API_CONFIG.endpoints.weather, {
            q: city,
            units: 'metric' 
        });

        const response = await fetch(weatherUrl);
        
        if (!response.ok) {
            throw new Error(`Erreur: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        updateCurrentWeather(data);
        
        getForecast(city);

    } catch (error) {
        handleError(error);
    }
}

async function getForecast(city) {
    try {
        const forecastUrl = buildApiUrl(API_CONFIG.endpoints.forecast, {
            q: city,
            units: 'metric'
        });

        const response = await fetch(forecastUrl);
        
        if (!response.ok) {
            throw new Error(`Erreur: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        updateForecast(data);

    } catch (error) {
        handleError(error);
    }
}

function updateCurrentWeather(data) {
    locationName.textContent = `${data.name}, ${data.sys.country}`;
    dateElement.textContent = formatDate(new Date());
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionElement.textContent = data.weather[0].description;
    updateWeatherIcon(data.weather[0].icon);

    details[0].textContent = `${Math.round(data.main.feels_like)}°C`;
    details[1].textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    details[2].textContent = `${data.main.humidity}%`;
}

function updateForecast(data) {
    const dailyForecasts = data.list
        .filter(forecast => forecast.dt_txt.includes('12:00:00'))
        .slice(0, 5);

    forecastContainer.innerHTML = dailyForecasts.map(forecast => `
        <div class="forecast-day">
            <p>${new Date(forecast.dt_txt).toLocaleDateString('fr-FR', {weekday: 'short'})}</p>
            <i class="fas ${getWeatherIconClass(forecast.weather[0].icon)}"></i>
            <span>${Math.round(forecast.main.temp)}°C</span>
        </div>
    `).join('');
}

function handleError(error) {
    console.error('Erreur:', error);
    alert(`Une erreur est survenue: ${error.message}`);
}

function getWeatherIconClass(iconCode) {
    const iconMap = {
        '01': 'fa-sun',
        '02': 'fa-cloud-sun',
        '03': 'fa-cloud',
        '04': 'fa-cloud',
        '09': 'fa-cloud-rain',
        '10': 'fa-cloud-showers-heavy',
        '11': 'fa-bolt',
        '13': 'fa-snowflake',
        '50': 'fa-smog'
    };

    const iconPrefix = iconCode.slice(0, 2);
    return iconMap[iconPrefix] || 'fa-sun';
}

searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) getCurrentWeather(city);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) getCurrentWeather(city);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    getCurrentWeather('Dakar');
}); 