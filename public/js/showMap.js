mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: geometry.coordinates,
    zoom: 13
});
const marker = new mapboxgl.Marker()
    .setLngLat(geometry.coordinates)
    .addTo(map);
