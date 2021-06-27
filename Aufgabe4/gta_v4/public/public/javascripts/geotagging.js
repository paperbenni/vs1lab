/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
 console.log("The script is going to start...");
 var ajax = new XMLHttpRequest();

 // Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...
 
 // Hier wird die verwendete API für Geolocations gewählt
 // Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
 GEOLOCATIONAPI = {
   getCurrentPosition: function (onsuccess) {
     onsuccess({
       coords: {
         latitude: 49.01379,
         longitude: 8.390071,
         altitude: null,
         accuracy: 39,
         altitudeAccuracy: null,
         heading: null,
         speed: null,
       },
       timestamp: 1540282332239,
     });
   },
 };

// function Geotag(latitude,longitude,tagname,hashtag)
// {
//   this.latitude = latitude;
//   this.longitude = longitude;
//   this.name = tagname;
//   this.hashtag=hashtag;
// }

//  function submitnewtag(onclick) {
//   alert("Event " + onclick.type
//   + " fired on element " + this.tagName);
//   }
//   headline2.addEventListener("click", eventHandler, true);
 
 // Die echte API ist diese.
 // Falls es damit Probleme gibt, kommentieren Sie die Zeile aus. 
 GEOLOCATIONAPI = navigator.geolocation;
 
 /**
  * GeoTagApp Locator Modul
  */
 var gtaLocator = (function GtaLocator(geoLocationApi) {
   // Private Member
 
   /**
    * Funktion spricht Geolocation API an.
    * Bei Erfolg Callback 'onsuccess' mit Position.
    * Bei Fehler Callback 'onerror' mit Meldung.
    * Callback Funktionen als Parameter übergeben.
    */
   var tryLocate = function (onsuccess, onerror) {
     if (geoLocationApi) {
       geoLocationApi.getCurrentPosition(onsuccess, function (error) {
         var msg;
         switch (error.code) {
           case error.PERMISSION_DENIED:
             msg = "User denied the request for Geolocation.";
             break;
           case error.POSITION_UNAVAILABLE:
             msg = "Location information is unavailable.";
             break;
           case error.TIMEOUT:
             msg = "The request to get user location timed out.";
             break;
           case error.UNKNOWN_ERROR:
             msg = "An unknown error occurred.";
             break;
         }
         onerror(msg);
       });
     } else {
       onerror("Geolocation is not supported by this browser.");
     }
   };
 
   // Auslesen Breitengrad aus der Position
   var getLatitude = function (position) {
     return position.coords.latitude;
   };
 
   // Auslesen Längengrad aus Position
   var getLongitude = function (position) {
     return position.coords.longitude;
   };
 
   // Hier API Key eintragen
   var apiKey = "O9L22vQeXwe8jp7e4xqPuyL5Qm4XCGYh";
 
   /**
    * Funktion erzeugt eine URL, die auf die Karte verweist.
    * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
    * sein.
    *
    * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
    * tags : Array mit Geotag Objekten, das auch leer bleiben kann
    * zoom: Zoomfaktor der Karte
    */
   var getLocationMapSrc = function (lat, lon, tags, zoom) {
     zoom = typeof zoom !== "undefined" ? zoom : 10;
 
     if (apiKey === "YOUR_API_KEY_HERE") {
       console.log("No API key provided.");
       return "images/mapview.jpg";
     }
 
     var tagList = "&pois=You," + lat + "," + lon;
     if (tags !== undefined)
       tags.forEach(function (tag) {
         tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
       });
 
     var urlString =
       "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
       apiKey +
       "&size=600,400&zoom=" +
       zoom +
       "&center=" +
       lat +
       "," +
       lon +
       "&" +
       tagList;
 
     console.log("Generated Maps Url: " + urlString);
     return urlString;
   };
 
   return {
     // Start öffentlicher Teil des Moduls ...
 
     // Public Member
 
     readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",
 
     updateLocation: function () {
       function updateMap(lat, lon) {
         var resultimg = document.getElementById("result-img");
         var maplist = [];
         if (resultimg.dataset.tags !== undefined) {
           maplist = JSON.parse(resultimg.dataset.tags);
           console.log("hello world" + JSON.stringify(maplist));
         } else {
           maplist = [];
         }
         mapurl = getLocationMapSrc(lat, lon, maplist, 14);
         console.log("map url " + mapurl);
         resultimg.src = mapurl;
       }
       if (!([].slice.call(document.getElementsByClassName("coordinput")).some((element) => element.value))) {
         tryLocate(function (position) {
           console.log("updating location");
           document.getElementById("latitude").value = position.coords.latitude;
           document.getElementById("longitude").value = position.coords.longitude;
           document.getElementById("latitude_h").value = position.coords.latitude;
           document.getElementById("longitude_h").value = position.coords.longitude;
           updateMap(position.coords.latitude, position.coords.longitude);
         },
           function (error) {
             alert("failed to get location\n" + error);
           });
 
       } else {
         updateMap(document.getElementById("latitude").value, document.getElementById("longitude").value);
       }
     },
   }; // ... Ende öffentlicher Teil
 })(GEOLOCATIONAPI);
 
 /**
  * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
  * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
  * des Skripts.
  */
 $(function () {
   gtaLocator.updateLocation();
 });