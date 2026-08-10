import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import MuiThemeBridge from "./components/MuiThemeBridge";
import { applySettings, loadSettings } from "./services/settings";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

applySettings(loadSettings());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MuiThemeBridge>
        <App />
      </MuiThemeBridge>
    </BrowserRouter>
  </React.StrictMode>
);
