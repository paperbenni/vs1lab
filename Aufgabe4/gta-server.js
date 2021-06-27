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
    extended: true
}));
app.use(bodyParser.json());

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

function searchQuery(lat, lon, radius, search, page) {
    this.lat = lat;
    this.long = lon;
    this.radius = radius;
    this.search = search;
    this.page = page;
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
    // private
    var tags = [];
    function getTags(searchstring) {
        return tags.filter(tag => tag.name.includes(searchstring) || tag.hashtag.includes(searchstring));
    }

    // public
    return {
        addTag: function (tag) {
            console.log("added tag " + JSON.stringify(tag));
            tags.push(tag);
            return tags.indexOf(tag);
        },
        addIndexTag: function (index, tag) {
            tags[index] = tag;
        },
        removeTag: function (tag) {
            tags.splice(tags.indexOf(tag), 1);
        },
        removeTagByIndex: function (index) {
            tags.splice(index, 1);
        },
        getTags: getTags,
        getAllTags: function () {
            return tags;
        },
        searchTags: function (latitude, longitude, radius, searchterm, page) {
            let searchlist;
            if (searchterm == null || searchterm == ".*") {
                searchlist = tags;
            } else {
                searchlist = getTags(searchterm);
            }
            let matchlist = [];
            searchlist.forEach(function (tag) {
                if (Math.sqrt(Math.pow(tag.latitude - latitude, 2) + Math.pow(tag.longitude - longitude, 2)) < radius) {
                    matchlist.push(tag);
                }
            });
            if (!page) {
                return matchlist;
            } else {
                if (matchlist.length < 5) {
                    return matchlist;
                } else {
                    return matchlist.slice(page * 5, page * 5 + 6);
                }
            }
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

// search query constructor
// tested
app.get('/geotags', function (req, res) {
    if (req.query.search) {
        console.log("SEARCH" + req.query.search);
        if (typeof req.query.radius !== 'undefined' &&
            typeof req.query.latitude !== 'undefined' &&
            typeof req.query.longitude !== 'undefined') {
            res.json(Geotags.searchTags(req.query.latitude, req.query.longitude, req.query.radius, req.query.search, req.query.page));
        } else {
            res.json(Geotags.searchTags(10, 10, 100000, req.query.search, req.query.page));
        }
    } else {
        res.json(Geotags.searchTags(10, 10, 100000, "", req.query.page));
    }
});

//tested
app.get('/geotags/:id', function (req, res) {
    res.json(Geotags.getAllTags()[parseInt(req.params.id)]);
});

// tested
app.post('/geotags', function (req, res) {
    console.log("name" + req.body.name);
    let newindex = Geotags.addTag(req.body);
    res.setHeader("Location", newindex);
    // created
    res.status(201);
    res.json({ 'sucess': true });
});

// tested
app.put('/geotags/:id', function (req, res) {
    Geotags.addIndexTag(req.params.id, req.body);
    res.json({ 'sucess': true });
});

// tested
app.delete('/geotags/:id', function (req, res) {
    Geotags.removeTagByIndex(req.params.id);
    res.json({ 'sucess': true });
})

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
    let newtag = new Geotag(b.latitude, b.longitude, b.name, b.hashtag);
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
    if ('page' in b) {
        if ('term' in b) {
            taglist = Geotags.searchTags(b.latitude, b.longitude, searchradius, b.searchterm, parseInt(b.page));
        } else {
            taglist = Geotags.searchTags(b.latitude, b.longitude, searchradius, ".*", parseInt(b.page));
        }
    } else {
        if ('term' in b) {
            taglist = Geotags.searchTags(b.latitude, b.longitude, searchradius, b.searchterm);
        } else {
            taglist = Geotags.searchTags(b.latitude, b.longitude, searchradius, ".*");
        }
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
