/*global window: true*/
var WMATA = {
    ll: [],
    currentLines: [],

    getPosition: function () {
        'use strict';
        function showPosition(position) {
            WMATA.ll = [position.coords.latitude, position.coords.longitude];
            //console.log("attempt");
            if (WMATA.stops === undefined) {
                WMATA.getStops();
            } else {
                WMATA.getStopPrediction();
            }
        }
        if (window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(showPosition, function () {
                alert("This device requires geolocation. Please enable and refresh.");
            });
        } else {
            window.alert("This device does not allow geolocation, which is required for this application.");
        }
    },

    getStops: function () {
        WMATA.pureAjax('http://api.wmata.com/Bus.svc/json/JStops?lat=' + WMATA.ll[0] + '&lon=' + WMATA.ll[1] + '&radius=500&api_key=' + WMATA.key + '&callback=WMATA.gotStops');
    },

    gotStops: function (stops) {
        var stop = window.document.getElementById('stop');
        WMATA.stops = stops;
        //console.log(stops);

        WMATA.closestStop = WMATA.stops.Stops[WMATA.stopHaversine(WMATA.ll[0], WMATA.ll[1])];
        window.document.title = 'WMATA ' + WMATA.closestStop.Name + ' Stop';
        stop.innerText = WMATA.closestStop.Name;
        stop.textContent = WMATA.closestStop.Name;

        WMATA.getStopPrediction();
    },

    getStopPrediction: function () {
        //http://api.wmata.com/NextBusService.svc/json/JPredictions?StopID=1001888&api_key=YOUR_API_KEY
        WMATA.pureAjax('http://api.wmata.com/NextBusService.svc/json/JPredictions?StopID=' + WMATA.closestStop.StopID + '&api_key=' + WMATA.key + '&callback=WMATA.gotStopPrediction');
    },

    gotStopPrediction: function (stopPredictions) {
        //console.log(stopPredictions);
        WMATA.stopPredictions = stopPredictions;
        WMATA.displayResults();
        WMATA.getBusPositions();
    },

    getBusPositions: function () {
        http://api.wmata.com/Bus.svc/json/JBusPositions?routeId=10A&includingVariations=true&lat=38.878586&lon=-76.989626&radius=50000&api_key=YOUR_API_KEY
        WMATA.pureAjax('http://api.wmata.com/Bus.svc/json/JBusPositions?routeId=' + WMATA.stops.Stops[0].Routes[0] + '&includingVariations=true&api_key=' + WMATA.key + '&callback=WMATA.gotBusPositions');
    },

    gotBusPositions: function (busPositions) {
        //console.log(busPositions);
        WMATA.busPositions = busPositions;
        WMATA.displayBusPositions();
    },

    stopHaversine: function (lat, lon) {
        'use strict';
        var closest = [-1, 20000],
            lat1,
            lon1,
            lat2,
            lon2,
            R = 6371, //km
            dLat,
            dLon,
            a,
            c,
            d,
            i;
        for (i = 0; i < WMATA.stops.Stops.length; i += 1) {
            //haversine implementation
            lat1 = lat;
            lat2 = WMATA.stops.Stops[i].Lat;
            lon1 = lon;
            lon2 = WMATA.stops.Stops[i].Lon;

            dLat = (lat2 - lat1) * Math.PI / 180;
            dLon = (lon2 - lon1) * Math.PI / 180;
            lat1 = lat1 * Math.PI / 180;
            lat2 = lat2 * Math.PI / 180;

            a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
            c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            d = R * c;

            if (d < closest[1]) {
                closest = [i, d];
            }
        }

        return closest[0];
    },

    computeTime: function (time) {
        var now = new Date(),
            hour = now.getHours(),
            min = now.getMinutes(),
            rep = time.split(':'),
            repHour = parseInt(rep[0], 10),
            repMin = parseInt(rep[1], 10),
            since = '',
            minComma = '';
        if (min > repMin) {
            since += min - repMin + ' minute' + (parseInt(min - repMin, 10) === 1 ? '' : 's');
        }
        if (hour > repHour) {
            if (since !== '') {
                minComma = ', '
            }
            since += minComma + hour - repHour + ' hour' + (parseInt(hour - repHour, 10) === 1 ? '' : 's');
        }
        since === '' ? since = 'just now' : since = since + ' ago';

        return since;
    },

    displayResults: function () {
        'use strict';
        var schedule = window.document.getElementById('schedule'),
            results = ['RouteID', 'DirectionText', 'Minutes'],
            table1 = window.document.createElement('table'),
            thead1 = window.document.createElement('thead'),
            tbody1 = window.document.createElement('tbody'),
            headHTML = '<tr><th class="th1">RTE</th>' +
                '<th class="th2">DIRECTION</th>' +
                '<th class="th3">MIN</th></tr>',
            row,
            cell,
            i,
            j;
        if (window.document.getElementById('table1') !== null) {
            schedule.removeChild(window.document.getElementById('table1'));
        }

        thead1.id = 'thead1';
        thead1.innerHTML = headHTML;
        table1.id = "table1";
        table1.appendChild(thead1);

        for (i = 0; i < WMATA.stopPredictions.Predictions.length; i += 1) {
            row = window.document.createElement('tr');
            row.className = 'row';
            for (j = 0; j < results.length; j += 1) {
                cell = window.document.createElement('td');
                j === 0 ? cell.appendChild(window.document.createTextNode(WMATA.stopPredictions.Predictions[i].RouteID)) : cell.appendChild(window.document.createTextNode(WMATA.stopPredictions.Predictions[i][results[j]]));
                cell.className = 'cell' + (j + 1);
                row.appendChild(cell);
            }
            tbody1.appendChild(row);
        }
        table1.appendChild(tbody1);
        schedule.appendChild(table1);

        window.setTimeout(function () {WMATA.getPosition();}, 30000);

        if (WMATA.rainbow === undefined) {
            /mobile/i.test(navigator.userAgent) && setTimeout(function () {
                window.scrollTo(0, 1);
            }, 200);
            WMATA.rainbow = 'unicorn';
        }
    },

    displayBusPositions: function () {
        var position = window.document.getElementById('position'),
            match,
            closest,
            i,
            delay,
            delayNotice,
            delaySing,
            delayInt;

        for (i = 0; i < WMATA.busPositions.BusPositions.length; i += 1) {
            if (WMATA.busPositions.BusPositions[i].VehicleID === WMATA.stopPredictions.Predictions[0].VehicleID) {
                match = WMATA.busPositions.BusPositions[i];
            }
        }

        if (match !== undefined) {
            delayInt = parseInt(Math.abs(match.Deviation).toFixed(0), 10);
            delay = delayInt === 0 ? 'It is currently on time.' : 'It is running about ';
            delaySing = delayInt === 1 ? ' minute ' : ' minutes ';
            delayNotice = (parseFloat(match.Deviation) > 0 ? delaySing + 'ahead of ' : delaySing + 'behind ') + 'schedule.';
            closest = WMATA.stopHaversine(match.Lat, match.Lon);

            if (closest !== undefined) {
                position.innerHTML = 'The next bus was near ' + WMATA.stops.Stops[closest].Name +
                    ' as of ' + WMATA.computeTime(match.DateTime.split('T')[1]) + '. ' +
                    delay + (delayInt > 0 ? (delayInt + delayNotice) : '');
            }
        } else {
            position.innerHTML = 'The next bus is not reporting its location at this time.';
        }
    },

    pureAjax: function (url) {
        'use strict';
        var script = window.document.createElement('script');
        script.src = url;
        script.async = true;
        window.document.body.appendChild(script);
    },

    key: "e8apbxn8jucqbk7bvv2wn2qm"
};
(function () {
    'use strict';
    WMATA.getPosition();
}());