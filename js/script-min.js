var WMATA={ll:[],currentLines:[],getPosition:function(){"use strict";function t(t){WMATA.ll=[t.coords.latitude,t.coords.longitude],void 0===WMATA.stops?WMATA.getStops():WMATA.getStopPrediction()}window.navigator.geolocation?window.navigator.geolocation.getCurrentPosition(t,function(){alert("This device requires geolocation. Please enable and refresh.")}):window.alert("This device does not allow geolocation, which is required for this application.")},getStops:function(){WMATA.pureAjax("http://api.wmata.com/Bus.svc/json/JStops?lat="+WMATA.ll[0]+"&lon="+WMATA.ll[1]+"&radius=500&api_key="+WMATA.key+"&callback=WMATA.gotStops")},gotStops:function(t){var e=window.document.getElementById("stop");WMATA.stops=t,WMATA.closestStop=WMATA.stops.Stops[WMATA.stopHaversine(WMATA.ll[0],WMATA.ll[1])],window.document.title="WMATA "+WMATA.closestStop.Name+" Stop",e.innerText=WMATA.closestStop.Name,e.textContent=WMATA.closestStop.Name,WMATA.getStopPrediction()},getStopPrediction:function(){WMATA.pureAjax("http://api.wmata.com/NextBusService.svc/json/JPredictions?StopID="+WMATA.closestStop.StopID+"&api_key="+WMATA.key+"&callback=WMATA.gotStopPrediction")},gotStopPrediction:function(t){WMATA.stopPredictions=t,WMATA.displayResults(),WMATA.getBusPositions()},getBusPositions:function(){WMATA.pureAjax("http://api.wmata.com/Bus.svc/json/JBusPositions?routeId="+WMATA.stops.Stops[0].Routes[0]+"&includingVariations=true&api_key="+WMATA.key+"&callback=WMATA.gotBusPositions")},gotBusPositions:function(t){WMATA.busPositions=t,WMATA.displayBusPositions()},stopHaversine:function(t,e){"use strict";var o,i,n,s,a,c,A,d,r,u,l=[-1,2e4],p=6371;for(u=0;WMATA.stops.Stops.length>u;u+=1)o=t,n=WMATA.stops.Stops[u].Lat,i=e,s=WMATA.stops.Stops[u].Lon,a=(n-o)*Math.PI/180,c=(s-i)*Math.PI/180,o=o*Math.PI/180,n=n*Math.PI/180,A=Math.sin(a/2)*Math.sin(a/2)+Math.sin(c/2)*Math.sin(c/2)*Math.cos(o)*Math.cos(n),d=2*Math.atan2(Math.sqrt(A),Math.sqrt(1-A)),r=p*d,l[1]>r&&(l=[u,r]);return l[0]},computeTime:function(t){var e=new Date,o=e.getHours(),i=e.getMinutes(),n=t.split(":"),s=parseInt(n[0],10),a=parseInt(n[1],10),c="",A="";return i>a&&(c+=i-a+" minute"+(1===parseInt(i-a,10)?"":"s")),o>s&&(""!==c&&(A=", "),c+=A+o-s+" hour"+(1===parseInt(o-s,10)?"":"s")),""===c?c="just now":c+=" ago",c},displayResults:function(){"use strict";var t,e,o,i,n=window.document.getElementById("schedule"),s=["RouteID","DirectionText","Minutes"],a=window.document.createElement("table"),c=window.document.createElement("thead"),A=window.document.createElement("tbody"),d='<tr><th class="th1">RTE</th><th class="th2">DIRECTION</th><th class="th3">MIN</th></tr>';for(null!==window.document.getElementById("table1")&&n.removeChild(window.document.getElementById("table1")),c.id="thead1",c.innerHTML=d,a.id="table1",a.appendChild(c),o=0;WMATA.stopPredictions.Predictions.length>o;o+=1){for(t=window.document.createElement("tr"),t.className="row",i=0;s.length>i;i+=1)e=window.document.createElement("td"),0===i?e.appendChild(window.document.createTextNode(WMATA.stopPredictions.Predictions[o].RouteID)):e.appendChild(window.document.createTextNode(WMATA.stopPredictions.Predictions[o][s[i]])),e.className="cell"+(i+1),t.appendChild(e);A.appendChild(t)}a.appendChild(A),n.appendChild(a),window.setTimeout(function(){WMATA.getPosition()},3e4),void 0===WMATA.rainbow&&(/mobile/i.test(navigator.userAgent)&&setTimeout(function(){window.scrollTo(0,1)},200),WMATA.rainbow="unicorn")},displayBusPositions:function(){var t,e,o,i,n,s,a,c=window.document.getElementById("position");for(o=0;WMATA.busPositions.BusPositions.length>o;o+=1)WMATA.busPositions.BusPositions[o].VehicleID===WMATA.stopPredictions.Predictions[0].VehicleID&&(t=WMATA.busPositions.BusPositions[o]);void 0!==t?(a=parseInt(Math.abs(t.Deviation).toFixed(0),10),i=0===a?"It is currently on time.":"It is running about ",s=1===a?" minute ":" minutes ",n=(parseFloat(t.Deviation)>0?s+"ahead of ":s+"behind ")+"schedule.",e=WMATA.stopHaversine(t.Lat,t.Lon),void 0!==e&&(c.innerHTML="The next bus was near "+WMATA.stops.Stops[e].Name+" as of "+WMATA.computeTime(t.DateTime.split("T")[1])+". "+i+(a>0?a+n:""))):c.innerHTML="The next bus is not reporting its location at this time."},pureAjax:function(t){"use strict";var e=window.document.createElement("script");e.src=t,e.async=!0,window.document.body.appendChild(e)},key:"e8apbxn8jucqbk7bvv2wn2qm"};(function(){"use strict";WMATA.getPosition()})();