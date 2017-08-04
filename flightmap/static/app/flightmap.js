// start angles
var angles = { x: -32, y: 81, z: 0},
// colors
    colorSphere = "000",
    colorWater = '#123d63',
    colorLand = '#efefef',
// var colorLand = '#fd8e49'
    colorGraticule = '#164a79',
    colorBorders = '#ccc',
    colorAirports = "#57B6D9",
    colorCurrent = "#f00",
    tolerance = 3,
    currentPath = '',
    airports,
    flights;
    // colorAirports = "#FFD700"
// autorotation speed
// var degPerSec = 6


var canvas = d3.select("canvas"),
    width = canvas.property("width"),
    height = canvas.property("height"),
    context = canvas.node().getContext("2d");

var projection = d3.geoOrthographic()
    .scale((height - 10) / 2)
    .translate([width / 2, height / 2])
    .precision(0.1);

var graticule = d3.geoGraticule10()

var path = d3.geoPath()
    .projection(projection)
    .context(context);

canvas.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged))
    .on('mousemove', mousemove);

function setAngles() {
    var rotation = projection.rotate()
    rotation[0] = angles.y
    rotation[1] = angles.x
    rotation[2] = angles.z
    projection.rotate(rotation)
}

var render = function() {},
    v0, // Mouse position in Cartesian coordinates at start of drag gesture.
    r0, // Projection rotation as Euler angles at start.
    q0; // Projection rotation as versor at start

function dragstarted() {
  v0 = versor.cartesian(projection.invert(d3.mouse(this)));
  r0 = projection.rotate();
  q0 = versor(r0);
}

function dragged() {
  var v1 = versor.cartesian(projection.rotate(r0).invert(d3.mouse(this))),
      q1 = versor.multiply(q0, versor.delta(v0, v1)),
      r1 = versor.rotation(q1);
  projection.rotate(r1);
  render();
}

// Mouseover Handlers

//
// Handler
//

function enter(flightpath) {
  // var country = countryList.find(function(c) {
  //   return c.id === country.id
  // })
  // current.text(country && country.name || '')
}

function leave(flightpath) {
  current.text('')
}

function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

function onPath(path, point, tolerance) {
    var a = {"x": point[0], "y": point[1]};
    var b = {"x": path[0][0], "y": path[0][1]};
    var c = {"x": path[1][0], "y": path[1][1]};
    console.log(a);
    console.log(b);
    console.log(c);

    dist = distToSegment(a,b,c);
    console.log(dist)
    if (dist <= tolerance) {
        return true;
    } else {
        return false;
    }




    // //test if the point c is inside a pre-defined distance (tolerance) from the line
    // var distance = Math.abs((c.y - b.y)*a.x - (c.x - b.x)*a.y + c.x*b.y - c.y*b.x) / Math.sqrt(Math.pow((c.y-b.y),2) + Math.pow((c.x-b.x),2));
    // if (distance > tolerance){ return false; }
    // console.log(distance);
    //
    // //test if the point c is between a and b
    // var dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y)*(b.y - a.y)
    // if(dotproduct < 0){ return false; }
    //
    // var squaredlengthba = (b.x - a.x)*(b.x - a.x) + (b.y - a.y)*(b.y - a.y);
    // if(dotproduct > squaredlengthba){ return false; }

    return true;
}

function mousemove() {
  var c = getFlightPath(this)
  if (!c) {
    if (currentPath) {
    //   leave(currentPath)
      currentPath = undefined
      render()
    }
    return
  }
  if (c === currentPath) {
    return
  }
  currentPath = c
  console.log(currentPath);
  render()
  enter(c)
}

function getFlightPath(event) {
    console.log(d3.mouse(event));
  var pos = projection.invert(d3.mouse(event));
  var nearpath = flights.find(function(f) {
      return onPath(f.geometry.coordinates, pos, tolerance)
  })
  return nearpath;
}

// drawing utilities
function fill(thing, color) {
    context.beginPath(),
    path(thing),
    context.fillStyle = color,
    context.fill();
}

function stroke(thing, color) {
    context.beginPath(),
    path(thing),
    context.strokeStyle = color,
    context.stroke();
}

// Initialize
setAngles();

d3.queue()
    .defer(d3.json, "https://unpkg.com/world-atlas@1/world/110m.json")
    .defer(d3.json, "/static/data/record_airports.geojson")
    .await(ready);

function ready(error, world, tripdata) {
    if (error) throw error;

    var sphere = {type: "Sphere"},
        land = topojson.feature(world, world.objects.land),
        countries = topojson.feature(world, world.objects.countries).features,
        borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; });
    airports = tripdata.objects.airports.features;
    flights = tripdata.objects.trips.features;

    render = function() {
        context.clearRect(0, 0, width, height);
        fill(sphere, colorWater);
        stroke(graticule, colorGraticule);
        fill(land, colorLand);
        stroke(borders, colorBorders);
        stroke(sphere, colorSphere);
        path.pointRadius(3);
        airports.forEach(function(d) {
            fill(d, colorAirports)
        });
        context.lineWidth = 2;
        flights.forEach(function(d) {
            stroke(d, colorAirports);
        });
        if (currentPath) {
            context.linewidth = 3;
            stroke(currentPath, colorCurrent)
        }
        context.lineWidth = 1;

    };

    render();
};
