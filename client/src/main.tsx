import { createRoot } from "react-dom/client";
import MinimalApp from "./MinimalApp"; // Using MinimalApp with basic auth and routing
import "./index.css";

// Use a try-catch to help diagnose rendering issues
try {
  console.log("Initializing application with auth and basic routing");
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Could not find root element to mount React app");
    document.body.innerHTML = "<div style='padding:20px;color:white;background:black;'>Error: Could not find root element</div>";
  } else {
    createRoot(rootElement).render(<MinimalApp />);
    console.log("Application rendered successfully");
  }
} catch (error) {
  console.error("Failed to render React application:", error);
  document.body.innerHTML = "<div style='padding:20px;color:white;background:black;'>Error rendering application. Check console for details.</div>";
}
