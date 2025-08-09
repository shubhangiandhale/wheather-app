let isCelsius = true;
let currentTemperature = 0;
let map;

// Initialize Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 20.5937, lng: 78.9629 }, // Default center: India
        zoom: 5
    });
}

// Fetch weather data based on city name
async function fetchWeather(city) {
    const apiKey = '5eaf6606371586210f237da3b2f45a13'; // Replace with your key
    const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${city}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) throw new Error(data.error.info);
        updateWeatherUI(data);
        updateMap(city);
    } catch (error) {
        showErrorMessage(error.message);
    }
}

// Fetch weather data by geolocation
async function fetchWeatherByCoordinates(lat, lon) {
    const apiKey = '5eaf6606371586210f237da3b2f45a13';
    const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${lat},${lon}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) throw new Error(data.error.info);
        updateWeatherUI(data);
        updateMapByCoords(lat, lon);
    } catch (error) {
        showErrorMessage(error.message);
    }
}

// Update weather UI
function updateWeatherUI(data) {
    document.getElementById('city-name').textContent = data.location.name;
    currentTemperature = data.current.temperature;
    updateTemperatureDisplay();
    document.getElementById('humidity').textContent = `Humidity: ${data.current.humidity}%`;
    document.getElementById('condition').textContent = data.current.weather_descriptions[0];
    document.getElementById('weather-icon').src = data.current.weather_icons[0];
    document.getElementById('weather-result').classList.remove('hidden');
    document.getElementById('error-message').classList.add('hidden');
}

// Update temperature display (°C ↔ °F toggle)
function updateTemperatureDisplay() {
    const tempElement = document.getElementById('temperature');
    const toggleButton = document.getElementById('toggle-unit');
    if (isCelsius) {
        tempElement.textContent = `Temperature: ${currentTemperature}°C`;
        toggleButton.textContent = 'Switch to °F';
    } else {
        const fahrenheit = (currentTemperature * 9/5) + 32;
        tempElement.textContent = `Temperature: ${fahrenheit.toFixed(1)}°F`;
        toggleButton.textContent = 'Switch to °C';
    }
}

// Show error message
function showErrorMessage(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-message').classList.remove('hidden');
    document.getElementById('weather-result').classList.add('hidden');
}

// Update Google Maps view for searched city
function updateMap(city) {
    const mapApiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your key
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${mapApiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                const location = data.results[0].geometry.location;
                map.setCenter(location);
                new google.maps.Marker({ position: location, map: map });
            }
        })
        .catch(error => console.error('Map Error:', error));
}

// Update Google Maps view for geolocation
function updateMapByCoords(lat, lon) {
    const location = { lat, lng: lon };
    map.setCenter(location);
    new google.maps.Marker({ position: location, map: map });
}

// Event Listeners
document.getElementById('weather-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const city = document.getElementById('city').value;
    fetchWeather(city);
});

document.getElementById('get-location').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoordinates(lat, lon);
        }, () => showErrorMessage('Location access denied.'));
    } else {
        showErrorMessage('Geolocation is not supported by this browser.');
    }
});

document.getElementById('toggle-unit').addEventListener('click', function() {
    isCelsius = !isCelsius;
    updateTemperatureDisplay();
});
