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

var searchradius = 100;

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

app.use('/public', express.static('public'))

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

function Geotag(latitude, longitude, tagname, hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = tagname;
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

var Geotags = (function () {
    var tags = [];
    function getTags(searchstring) {
                return tags.filter(tag => tag.name.includes(searchstring) || tag.hashtag.includes(searchstring));
    }

    return {
        addTag: function (tag) {
            console.log("added tag " + JSON.stringify(tag));
            tags.push(tag);
        },
        removeTag: function (tag) {
            tags.splice(tags.indexOf(tag), 1);
        },
        getTags: getTags,
        getAllTags: function () {
            return tags;
        },
        searchTags: function (latitude, longitude, radius, searchterm) {
            if (searchterm == null) {
                searchlist = tags;
            } else {
                searchlist = getTags(searchterm);
            }
            matchlist = [];
            searchlist.forEach(function (tag) {
                if (Math.sqrt(Math.pow(tag.latitude - latitude, 2) + Math.pow(tag.longitude - longitude, 2)) < radius) {
                    matchlist.push(tag);
                }
            });
            return matchlist;
        }
    }
}());


/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function (req, res) {
    res.render('gta', {
        taglist: [],
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

app.post('/tagging', function (req, res) {
    var b = req.body;
    newtag = new Geotag(b.latitude, b.longitude, b.name, b.hashtag);
    Geotags.addTag(newtag);
    res.render('gta', {
        // taglist: Geotags.getAllTags()
        taglist: Geotags.searchTags(b.latitude, b.longitude, searchradius), 
        latitude: b.latitude,
        longitude: b.longitude
    })
});

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


app.post('/discovery', function (req, res) {
    var b = req.body;
    var taglist = []
    if ('term' in b) {
        taglist = Geotags.searchTags(b.latitude, b.longitude, searchradius, b.term);
    } else {
        taglist = Geotags.searchTags(b.latitude, b.longitude, searchradius);
    }
    res.render('gta', {
        taglist: taglist,
        latitude: b.latitude,
        longitude: b.longitude
    });
});


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
