/// <reference path="D:\\WorkSpace\\WebDevelopment\\TScript\\SelectAndShare\\node_modules\\bingmaps\\types\\MicrosoftMaps\\Microsoft.Maps.All.d.ts"/>
import axios from "axios";

const form = document.querySelector("form")!;
const addressInput = document.getElementById("address")! as HTMLInputElement;

type GoogleGeocodingResponse = { lat: number; lon: number }[];

function searchAddressHandler(event: Event) {
  event.preventDefault();
  const enteredAddress = addressInput.value;
  console.log(enteredAddress);
  axios
    .get<GoogleGeocodingResponse>(
      `https://geocode.maps.co/search?q=${encodeURI(enteredAddress)}`
    )
    .then((res) => {
      if (res.data.length === 0) {
        throw new Error("Could not fetch location!");
      }

      const coordinates = { lat: res.data[0].lat, lon: res.data[0].lon };

      Microsoft.Maps.loadModule("Microsoft.Maps.Search", function () {
        var map = new Microsoft.Maps.Map(document.getElementById("map")!, {});
        var searchManager = new Microsoft.Maps.Search.SearchManager(map);
        var reverseGeocodeRequestOptions = {
          location: new Microsoft.Maps.Location(
            coordinates.lat,
            coordinates.lon
          ),
          callback: function (answer: any, _userData: any) {
            map.setView({ bounds: answer.bestView });
            map.entities.push(
              new Microsoft.Maps.Pushpin(reverseGeocodeRequestOptions.location)
            );
          },
        };
        searchManager.reverseGeocode(reverseGeocodeRequestOptions);
      });
    })
    .catch((err) => {
      alert(err.message);
      console.log(err);
    });
}

form.addEventListener("submit", searchAddressHandler);
