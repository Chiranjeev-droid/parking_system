import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Popup, Polyline } from "react-leaflet";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
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

  // State to hold car positions in the grid
  const [carData, setCarData] = useState([]);

  useEffect(() => {
    // Generate grid of lat/lng for the squares
    const generatedGrid = generateGrid(center, rows, cols);
    setCarData(generatedGrid);
  }, [center, rows, cols]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Loop through carData to render markers (cars) and squares */}
      {carData.map((car, index) => {
        const squareVertices = calculateSquareVertices(
          car.lat,
          car.lng,
          gridSize
        );

        return (
          <div key={index}>
            {/* Car Marker */}
            <LeafletTrackingMarker
              icon={carIcon}
              position={[car.lat, car.lng]}
              previousPosition={[car.lat - gridSize, car.lng - gridSize]} // Simulate movement for demo purposes
              duration={1000}
              keepAtCenter={false}
            >
              <Popup>
                Car at: {car.lat.toFixed(4)}, {car.lng.toFixed(4)}
              </Popup>
            </LeafletTrackingMarker>

            {/* Polyline for square around the car */}
            <Polyline positions={squareVertices} color="green" />
          </div>
        );
      })}
    </MapContainer>
  );
}
// import { useEffect, useState } from "react";
// import {
//   MapContainer,
//   TileLayer,
//   Popup,
//   Polyline,
//   Marker,
// } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css"; // Import leaflet CSS

// // Define a car icon for the markers
// const carIcon = L.divIcon({
//   className: "custom-icon",
//   html: (carNumber) =>
//     `<div style="background-color: blue; border-radius: 50%; color: white; width: 45px; height: 45px; display: flex; justify-content: center; align-items: center;">${carNumber}</div>`,
//   iconSize: [45, 45],
//   popupAnchor: [2, -20],
// });

// const gridSize = 0.01; // The size of each square in terms of latitude and longitude

// // Function to generate lat/lng grid
// const generateGrid = (center, rows, cols) => {
//   const { lat, lng } = center;
//   let grid = [];

//   for (let i = 0; i < rows; i++) {
//     for (let j = 0; j < cols; j++) {
//       const latOffset = i * gridSize;
//       const lngOffset = j * gridSize;
//       grid.push({
//         lat: lat + latOffset,
//         lng: lng + lngOffset,
//         slotName: `Slot ${i * cols + j + 1}`, // Name each parking slot
//         occupied: false, // Initially, no car is parked
//         carNumber: null, // No car in the slot initially
//       });
//     }
//   }

//   return grid;
// };

// // Function to calculate vertices of a square around a given point
// const calculateSquareVertices = (lat, lng, size) => {
//   return [
//     [lat - size / 2, lng - size / 2], // Bottom-left
//     [lat - size / 2, lng + size / 2], // Bottom-right
//     [lat + size / 2, lng + size / 2], // Top-right
//     [lat + size / 2, lng - size / 2], // Top-left
//     [lat - size / 2, lng - size / 2], // Close the square
//   ];
// };

// export default function CarGridMap() {
//   const center = { lat: 51.505, lng: -0.09 }; // Central point of the map
//   const rows = 10; // Number of rows in the grid
//   const cols = 10; // Number of columns in the grid

//   // State to hold parking slots (cars will be assigned to these slots)
//   const [parkingSlots, setParkingSlots] = useState([]);
//   const [carNumber, setCarNumber] = useState(""); // Track user input for car number

//   useEffect(() => {
//     // Generate grid of lat/lng for the parking slots
//     const generatedGrid = generateGrid(center, rows, cols);
//     setParkingSlots(generatedGrid);
//   }, [center, rows, cols]);

//   // Handle car entry based on user input
//   const handleEnterCar = () => {
//     const updatedSlots = parkingSlots.map((slot) => {
//       if (!slot.occupied && !slot.carNumber) {
//         // Find the first available slot and mark it as occupied with user carNumber
//         slot.occupied = true;
//         slot.carNumber = carNumber;
//         return slot;
//       }
//       return slot;
//     });
//     setParkingSlots(updatedSlots);
//     setCarNumber(""); // Clear input after entering the car
//   };

//   // Handle car exit based on user input
//   const handleExitCar = () => {
//     const updatedSlots = parkingSlots.map((slot) => {
//       if (slot.carNumber === carNumber) {
//         // Find the slot with the specified car number and free it
//         slot.occupied = false;
//         slot.carNumber = null;
//       }
//       return slot;
//     });
//     setParkingSlots(updatedSlots);
//     setCarNumber(""); // Clear input after exiting the car
//   };

//   return (
//     <div>
//       {/* Input for car number and action buttons */}
//       <div
//         style={{
//           position: "absolute",
//           top: "10px",
//           left: "10px",
//           zIndex: 1000,
//         }}
//       >
//         <input
//           type="text"
//           value={carNumber}
//           onChange={(e) => setCarNumber(e.target.value)}
//           placeholder="Enter Car Number"
//         />
//         <button onClick={handleEnterCar}>Enter Car</button>
//         <button onClick={handleExitCar}>Exit Car</button>
//       </div>

//       {/* Map Component */}
//       <MapContainer
//         center={[center.lat, center.lng]}
//         zoom={14}
//         style={{ height: "100vh", width: "100%" }}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//         />
//         {/* Loop through parking slots to render markers (cars) and squares */}
//         {parkingSlots.map((slot, index) => {
//           const squareVertices = calculateSquareVertices(
//             slot.lat,
//             slot.lng,
//             gridSize
//           );

//           return (
//             <div key={index}>
//               {/* Draw the parking slot with Polyline */}
//               <Polyline positions={squareVertices} color="green" />

//               {/* Show car marker if slot is occupied */}
//               {slot.occupied && (
//                 <Marker
//                   position={[slot.lat, slot.lng]}
//                   icon={carIcon(slot.carNumber)}
//                 >
//                   <Popup>
//                     {slot.slotName} <br />
//                     Car: {slot.carNumber} <br />
//                     <button onClick={() => handleExitCar(slot.carNumber)}>
//                       Exit Car {slot.carNumber}
//                     </button>
//                   </Popup>
//                 </Marker>
//               )}
//             </div>
//           );
//         })}
//       </MapContainer>
//     </div>
//   );
// }
