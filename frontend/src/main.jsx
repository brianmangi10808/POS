import * as React from "react";
import App from './App.jsx'
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { UserProvider } from './signup/UserContext';
const root = createRoot(document.getElementById("root"));

root.render(
  
  <BrowserRouter>
  <UserProvider>
    <App/>
    </UserProvider>
  </BrowserRouter>

);