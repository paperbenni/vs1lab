/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN
app.use(express.static('public'));
/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

// TODO: CODE ERGÄNZEN
function GeoTag(latitude, longitude, name, hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
}
/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

// TODO: CODE ERGÄNZEN
var GeoTags = (function() {
    /*Privt*/
    var Memory = [];
    /*Öffentlich*/
    return {
        search: function(position, searchText) {
            SearchTags = [];
            if (searchText == null) {
                SearchTags = Memory;

            } else {
                for (let index = 0; index < Memory.length; index++) {
                    const element = Memory[index];
                    if (element.name.includes(searchText)) {
                        SearchTags.push(element)
                    }
                }
            }

            for (let index = 0; index < SearchTags.length; index++) {
                const element = SearchTags[index];
                var a = element.latitude - position.latitude;
                var b = element.longitude - position.latitude;

                var distance = Math.sqrt(a * a + b * b);
                if (distance > 10) {
                    Memory.splice(Memory.indexOf(element), 1)
                }

            }
            return SearchTags;
        },

        add: function(GeoTag) {

            Memory.push(GeoTag);

        },
        delete: function(GeoTag) {
            Memory.splice(Memory.indexOf(GeoTag), 1)

        }
    }

})();

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: []
    });

});
app.post('/discovery', function(req, res) {
    var b = req.body;
    res.render('gta', {
        taglist: GeoTags.search({ latitude: b.latitude, longitude: b.longitude }, b.name),
        latitude: b.latitude,
        longitude: b.longitude
    });

});
app.post('/tagging', function(req, res) {

    var b = req.body;
    var tag = new GeoTag(b.latitude, b.longitude, b.name, b.hashtag);
    GeoTags.add(tag)
    res.render('gta', {
        taglist: GeoTags.search({ latitude: b.latitude, longitude: b.longitude }),
        latitude: b.latitude,
        longitude: b.longitude
    });

});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

// TODO: CODE ERGÄNZEN START

/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

// TODO: CODE ERGÄNZEN

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);