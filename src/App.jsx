import "./app.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function App() {
  const [vh, setVh] = useState(window.innerHeight);
  const inputRef = useRef(null);
  const [data, setData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [defaultLocation, setDefaultLocation] = useState("");

  function apiRequest(location) {
    axios
      .get(
        `https://api.weatherapi.com/v1/current.json?key=1a5ffb27deb94ccda7c155123242404&${
          location ? `q=${location}` : ""
        }&aqi=no&lang=en`
      )
      .then((response) => {
        setData(response.data);
        setIsFetching(false);
      })
      .catch(() => {});
  }

  function getLocation() {
    axios
      .get(
        `https://api.geoapify.com/v1/ipinfo?&apiKey=ecd778ddc51d422fbd2098e224f45f30`
      )
      .then((data) => {
        setDefaultLocation(
          data.data.city.name +
            " " +
            data.data.state.name +
            " " +
            data.data.country.name_native
        );
      })

      .catch(() => {});
  }

  useEffect(() => {
    getLocation();
    const updateVh = () => {
      setVh(window.innerHeight);
    };
    window.addEventListener("resize", updateVh);
    return () => window.removeEventListener("resize", updateVh);
  }, []);

  useEffect(() => {
    apiRequest(
      defaultLocation
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    );
  }, [defaultLocation]);

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      apiRequest(
        inputRef.current.value
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
      );
    }
  }

  return (
    <div className="App" style={{ height: vh }}>
      <div className="container">
        <header className={"header-input"}>
          <div>
            <input
              className={"location-input"}
              placeholder={"Search city name."}
              onKeyPress={(e) => {
                handleKeyPress(e);
              }}
              ref={inputRef}
            />
            <p className={"observations"}>Press Enter to Search.</p>
          </div>
          {isFetching ? (
            ""
          ) : (
            <div>
              <h1 className={"location"}>{data.location.name},</h1>
              <p className={"region"}>
                {data.location.region}, {data.location.country}.
              </p>
            </div>
          )}
        </header>
        {isFetching ? (
          <p className={"loading"}>Loading...</p>
        ) : (
          <main className={"main-data"}>
            <div className={"temperature"}>
              <p className={"temp"}>{data.current.temp_c}° C</p>
              <p className={"last-update"}>
                Wind Speed: {data.current.wind_kph} Kph
              </p>
              <p className={"last-update"}>
                Humidity: {data.current.humidity}%
              </p>
            </div>
            <div className={"weather"}>
              <img
                className={"img"}
                src={`https://cdn.weatherapi.com/weather/128x128/${
                  data.current.condition.icon.split("/")[5]
                }/${data.current.condition.icon.split("/")[6]}`}
                alt={"Weather pic"}
                width={150}
                height={150}
              />
              <p className={"weather-label"}>{data.current.condition.text}</p>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
