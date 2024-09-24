import { StrictMode } from "react";
import ReactDOM from "react-dom";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/leaflet.js";
import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);
