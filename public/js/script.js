const socket = io();

const map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "Real-Time Tracker" }).addTo(map);

let marker = {};
let routeLayer;

async function geocode(address) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    return data[0] ? { lat: data[0].lat, lon: data[0].lon } : null;
}

async function showRoute() {
    const fromAddress = document.getElementById('from').value;
    const toAddress = document.getElementById('to').value;

    if (!fromAddress || !toAddress) {
        alert('Please enter both addresses.');
        return;
    }

    const fromCoords = await geocode(fromAddress);
    const toCoords = await geocode(toAddress);

    if (!fromCoords || !toCoords) {
        alert('Could not find one or both addresses.');
        return;
    }

    if (routeLayer) {
        map.removeLayer(routeLayer);
    }
    if (marker.from) {
        map.removeLayer(marker.from);
    }
    if (marker.to) {
        map.removeLayer(marker.to);
    }

    routeLayer = L.polyline(
        [
            [fromCoords.lat, fromCoords.lon],
            [toCoords.lat, toCoords.lon]
        ],
        { color: 'blue' }
    ).addTo(map);

    marker.from = L.marker([fromCoords.lat, fromCoords.lon]).addTo(map);
    marker.to = L.marker([toCoords.lat, toCoords.lon]).addTo(map);

    map.fitBounds(routeLayer.getBounds());

    const distance = getDistanceFromLatLonInKm(fromCoords.lat, fromCoords.lon, toCoords.lat, toCoords.lon);
    const speed = 60;
    const time = (distance / speed) * 60;
    document.getElementById('travel-time').innerText = `Travel Time: ${time.toFixed(2)} minutes`;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

socket.on('receive-location', (coords) => {
    const { id, latitude, longitude } = coords;
    if (marker[id]) {
        marker[id].setLatLng([latitude, longitude]);
    } else {
        marker[id] = L.marker([latitude, longitude]).addTo(map);
    }
    map.setView([latitude, longitude], 16);
});

socket.on("disconnect", (id) => {
    if (marker[id]) {
        map.removeLayer(marker[id]);
        delete marker[id];
    }
});
