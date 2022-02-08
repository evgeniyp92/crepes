console.log(`Bunqus`);
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2E3bmlwIiwiYSI6ImNrejg5N2l3MjB0NHEycHM4bjZzd2g5cWwifQ.H2_DIRS0qokYZ4l_HoySPQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/ca7nip/ckz89od8c000q15nzx46teq6r',
  center: [locations[0].coordinates[0], locations[0].coordinates[1]],
  zoom: 3,
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(location => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({ element: el, anchor: 'bottom' })
    .setLngLat(location.coordinates)
    .addTo(map);

  // Add a popup
  new mapboxgl.Popup({ offset: 30 })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
    .addTo(map);

  // Extend map bounds to inlcude the current location
  bounds.extend(location.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
