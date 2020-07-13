import moment from "moment";
import _ from "lodash";

const cityInput = document.querySelector(".weather__search");
const location = document.querySelector(".weather__location-city");
const day = document.querySelector(".weather__date-day");
const time = document.querySelector(".weather__date-time");
const temperature = document.querySelector(".weather__temperature");
const weatherType = document.querySelector(".weather__type");
const weatherIcon = document.querySelector(".weather__icon");
const wind = document.querySelector(".weather__wind");
const pressure = document.querySelector(".weather__pressure");
const sunrise = document.querySelector(".weather__sunrise");
const sunset = document.querySelector(".weather__sunset");
let timeNow;

const weather = {
  timezone: -25200,
  city: "",
  country: "",
  day: "",
  time: "",
  temperature: "",
  description: "",
  icon: "",
  wind: "",
  pressure: "",
  sunrise: "",
  sunset: "",
  displayWeather() {
    clearInterval(timeNow);
    time.classList.remove("weather__date-time--hidden");
    location.textContent = `${this.city}, ${this.country}`;
    day.textContent = this.day;
    time.textContent = this.time;
    temperature.innerHTML = this.temperature;
    weatherType.textContent = this.description;
    weatherIcon.src = this.icon;
    wind.textContent = this.wind;
    pressure.textContent = this.pressure;
    sunrise.textContent = this.sunrise;
    sunset.textContent = this.sunset;
    timeNow = setInterval(() => {
      let currentTime = moment(Date.now() + this.timezone * 1000)
        .utcOffset(0)
        .format("HH:mm:ss");
      time.textContent = currentTime;
    }, 1000);
  },
  getWeather({ latitude, longitude, city }) {
    const API_KEY = "e84ea5c52ea447a2e7b086b1965a2b3b";
    let api;
    if (latitude && longitude) {
      api = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
    } else if (city) {
      api = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    }
    if ((latitude && longitude) || city.length > 1) {
      fetch(api)
        .then((res) => {
          if (!res.ok) throw new Error("Location not found.");
          else return res;
        })
        .then((res) => res.json())
        .then((res) => {
          this.timezone = res.timezone;
          this.city = res.name;
          this.country = res.sys.country;
          this.day = moment(Date.now() + this.timezone * 1000)
            .utcOffset(0)
            .format("MMMM Do YYYY");
          this.time = moment(Date.now() + this.timezone * 1000)
            .utcOffset(0)
            .format("HH:mm:ss");
          this.temperature = `${Math.round(res.main.temp)}°`;
          this.description = res.weather[0].main;
          this.icon = `http://openweathermap.org/img/w/${res.weather[0].icon}.png`;
          this.wind = `Wind: ${res.wind.speed}km/h`;
          this.pressure = `Pressure: ${res.main.pressure}hPa`;
          this.sunrise = `Sunrise: ${moment(
            new Date(res.sys.sunrise * 1000 + res.timezone * 1000)
          )
            .utcOffset(0)
            .format("HH:mm")}`;
          this.sunset = `Sunset: ${moment(
            new Date(res.sys.sunset * 1000 + res.timezone * 1000)
          )
            .utcOffset(0)
            .format("HH:mm")}`;
          this.displayWeather();
        })
        .catch((err) => {
          location.textContent = err.message;
          day.textContent = `Enable access to location or enter city name manually and try again. If the problem persists, contact support.`;
          time.classList.add("weather__date-time--hidden");
        });
    }
  },
};

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
  showError({ message: "Your browser doesn't support geolocation" });
}

function setPosition(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  weather.getWeather({ latitude, longitude });
}

function showError(error) {
  location.textContent = error.message;
  day.textContent =
    "Enter city name manually or enable access to device location.";
  time.classList.add("weather__date-time--hidden");
}

cityInput.addEventListener(
  "input",
  _.debounce(() => {
    weather.getWeather({ city: cityInput.value });
  }, 600)
);
