// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { AuthProvider } from "./context/Auth.jsx";
import { FavsProvider } from "./context/Favs.jsx";
import { CartProvider } from "./context/Cart.jsx";

// Estilos globales (si no los importas en App.jsx)
import "./theme.css";
import { ToastProvider } from "./context/Toast.jsx";

const el = document.getElementById("root");
createRoot(el).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavsProvider>
          <CartProvider>
            <ToastProvider>
        <App />
          </ToastProvider>
          </CartProvider>
        </FavsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
