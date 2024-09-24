import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Popup,
  Polyline,
  Marker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Import leaflet CSS

// Define a car icon for the markers
const carIcon = L.icon({
  iconSize: [45, 45],
  popupAnchor: [2, -20],
  iconUrl:
    "https://mysql-backup-base.s3.amazonaws.com/New%20Project%20%281%29.png",
});

const gridSize = 0.01; // The size of each square in terms of latitude and longitude

// Function to generate lat/lng grid
const generateGrid = (center, rows, cols) => {
  const { lat, lng } = center;
  let grid = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const latOffset = i * gridSize;
      const lngOffset = j * gridSize;
      grid.push({
        lat: lat + latOffset,
        lng: lng + lngOffset,
        slotName: `Slot ${i * cols + j + 1}`, // Name each parking slot
        occupied: false, // Initially, no car is parked
        carNumber: 0, // No car in the slot initially
      });
    }
  }

  return grid;
};

// Function to calculate vertices of a square around a given point
const calculateSquareVertices = (lat, lng, size) => {
  return [
    [lat - size / 2, lng - size / 2], // Bottom-left
    [lat - size / 2, lng + size / 2], // Bottom-right
    [lat + size / 2, lng + size / 2], // Top-right
    [lat + size / 2, lng - size / 2], // Top-left
    [lat - size / 2, lng - size / 2], // Close the square
  ];
};

export default function CarGridMap() {
  const center = { lat: 51.505, lng: -0.09 }; // Central point of the map
  const rows = 10; // Number of rows in the grid
  const cols = 10; // Number of columns in the grid

  // State to hold parking slots (cars will be assigned to these slots)
  const [parkingSlots, setParkingSlots] = useState([]);
  const [carNumber, setCarNumber] = useState(0); // Track user input for car number
  const [error, setError] = useState(""); // Track errors

  // useEffect to generate the grid, runs only once (on mount)
  useEffect(() => {
    const generatedGrid = generateGrid(center, rows, cols);
    setParkingSlots(generatedGrid);
  }, []); // Ensure the dependencies are stable and don't change on every render

  // Handle car entry based on user input
  const handleEnterCar = () => {
    if (carNumber === 0) {
      setError("Please enter a car number.");
      return;
    }
    const carExists = parkingSlots.some((slot) => slot.carNumber === carNumber);

    if (carExists) {
      setError(`Car number ${carNumber} is already parked . `);
      return; // Prevent entering the car again
    }
    let slotFound = false;
    const updatedSlots = parkingSlots.map((slot) => {
      if (!slot.occupied && !slotFound) {
        // Find the first available slot and mark it as occupied with user carNumber
        slot.occupied = true;
        slot.carNumber = carNumber;
        slotFound = true; // Mark that we've found a slot
        return slot;
      }
      return slot;
    });

    if (slotFound) {
      setParkingSlots(updatedSlots);
      setCarNumber(0); // Clear input after entering the car
      setError(""); // Clear error
    } else {
      setError("No available slots. All are occupied.");
    }
  };

  // Handle car exit based on user input
  const handleExitCar = () => {
    if (carNumber === 0) {
      setError("Please enter a car number to exit.");
      return;
    }

    let carFound = false;
    const updatedSlots = parkingSlots.map((slot) => {
      if (slot.carNumber === carNumber) {
        // Find the slot with the specified car number and free it
        slot.occupied = false;
        slot.carNumber = 0;
        carFound = true;
      }
      return slot;
    });

    if (carFound) {
      setParkingSlots(updatedSlots);
      setCarNumber(0); // Clear input after exiting the car
      setError(""); // Clear error
    } else {
      setError(`Car ${carNumber} not found in any slots.`);
    }
  };

  return (
    <div>
      {/* Input for car number and action buttons */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "45vh",
          zIndex: 1000,
        }}
      >
        <input
          type="number"
          value={carNumber || ""} // Show empty string if carNumber is 0
          onChange={(e) =>
            setCarNumber(e.target.value ? parseInt(e.target.value) : 0)
          } // Ensure the value is parsed as a number
          placeholder="Enter Car Number"
        />
        <button style={{ marginLeft: "10px" }} onClick={handleEnterCar}>
          Enter Car
        </button>
        <button style={{ marginLeft: "10px" }} onClick={handleExitCar}>
          Exit Car
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* Map Component */}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Loop through parking slots to render markers (cars) and squares */}
        {parkingSlots.map((slot, index) => {
          const squareVertices = calculateSquareVertices(
            slot.lat,
            slot.lng,
            gridSize
          );

          return (
            <div key={index}>
              {/* Draw the parking slot with Polyline */}
              <Polyline positions={squareVertices} color="green" />

              {/* Show car marker if slot is occupied */}
              {slot.occupied && (
                <Marker position={[slot.lat, slot.lng]} icon={carIcon}>
                  <Popup>
                    {slot.slotName} <br />
                    Car: {slot.carNumber}
                  </Popup>
                </Marker>
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
