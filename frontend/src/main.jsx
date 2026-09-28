import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/admin.css";
import App from "./App";
import { ContentProvider } from "./context/ContentContext";
import { AuthProvider } from "./context/AuthContext";
import { AlumniAuthProvider } from "./context/AlumniAuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AlumniAuthProvider>
          <ContentProvider>
            <App />
          </ContentProvider>
        </AlumniAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
