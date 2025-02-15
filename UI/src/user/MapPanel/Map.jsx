import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// GeoJSON styling for Lebanon
const geoJsonStyle = {
  fillColor: 'transparent',
  color: 'transparent',
  weight: 0,
  fillOpacity: 0,
};

// Custom Marker Component
const CustomMarker = ({ location, customIcon }) => {
  const map = useMap();
  const markerRef = React.useRef(null);

  const handleMarkerClick = () => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }

    map.setView([location.latitude, location.longitude], 16, {
      animate: true,
      pan: {
        duration: 1.5,
      },
    });
    console.log('Items Needed for location:', location.itemsNeeded);
  };

  return (
    <Marker
      ref={markerRef}
      position={[location.latitude, location.longitude]}
      icon={customIcon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup autoPan={true} keepInView={true}>
        <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          <img
            src="./donation.png"
            alt="Helping Hand"
            style={{ width: '40px', height: '40px', marginBottom: '10px' }}
          />
          <h3 style={{ margin: '5px 0', fontSize: '18px', color: '#333', fontWeight: 'bold' }}>
            Helping {location.targetGroup}
          </h3>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#777' }}>
            <strong>Mission:</strong>
            <br />
            This case focuses on supporting the {location.targetGroup} in need. Your donation is
            directly impacting their lives.
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>
            <strong>Items Needed:</strong>
          </p>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
            {location.itemsNeeded && location.itemsNeeded.length > 0 ? (
              location.itemsNeeded.map((item, i) => <li key={i}>{item.name}</li>)
            ) : (
              <li>No items listed</li>
            )}
          </ul>
          <p style={{ fontSize: '14px', color: '#28a745', fontWeight: 'bold' }}>
            Thank you for being part of this important mission!
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

// Map component
const MapHome = () => {
  const [locations, setLocations] = useState([]);
  const [lebanonGeoJSON, setLebanonGeoJSON] = useState(null);
  const [initialZoom, setInitialZoom] = useState(9);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/cases/delivery-locations');
        const data = await response.json();
        if (data.success && data.cases) {
          const validLocations = data.cases
            .map((caseItem) => ({
              ...caseItem.location,
              targetGroup: caseItem.targetGroup,
              itemsNeeded: caseItem.itemsNeeded,
            }))
            .filter((location) => location.latitude && location.longitude);
          setLocations(validLocations);
        } else {
          console.error(data.message || 'No data found');
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    const fetchLebanonGeoJSON = async () => {
      try {
        const response = await fetch('./geojson/lebanon.geojson');
        if (!response.ok) {
          throw new Error('Failed to fetch GeoJSON');
        }
        const data = await response.json();
        setLebanonGeoJSON(data);
      } catch (error) {
        console.error('Error fetching GeoJSON:', error);
      }
    };

    fetchLocations();
    fetchLebanonGeoJSON();
  }, []);

  const customIcon = new L.Icon({
    iconUrl: './locationn.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const ResetZoomButton = () => {
    const map = useMap();
    const handleResetZoom = () => {
      map.setView([33.8547, 35.8623], initialZoom, {
        animate: true,
        duration: 3, // Slow down the zoom duration (in seconds)
      });
    };

    return (
      <button
        onClick={handleResetZoom}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '12px 25px',
          background: 'linear-gradient(145deg, #6c7b8b, #4a5862)',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)',
          zIndex: '1000',
          transition: 'transform 0.3s ease, background 0.3s ease',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        Reset Zoom
      </button>
    );
  };

  return (
    <MapContainer
      center={[33.8547, 35.8623]}
      zoom={initialZoom}
      style={{ height: '500px', width: '100%' }}
      maxBounds={[
        [33.05, 35.12],
        [34.64, 36.65],
      ]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />
      {lebanonGeoJSON && (
        <GeoJSON data={lebanonGeoJSON} style={geoJsonStyle} />
      )}
      {locations.map((location, index) => (
        <CustomMarker key={index} location={location} customIcon={customIcon} />
      ))}
      <ResetZoomButton />
    </MapContainer>
  );
};

export default MapHome;
