import { createRoot } from "react-dom/client";
import SimpleApp from "./SimpleApp"; // Using SimpleApp temporarily
import "./index.css";

// Use a try-catch to help diagnose rendering issues
try {
  console.log("Initializing application with simplified components");
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Could not find root element to mount React app");
    document.body.innerHTML = "<div style='padding:20px;color:white;background:black;'>Error: Could not find root element</div>";
  } else {
    createRoot(rootElement).render(<SimpleApp />);
    console.log("Application rendered successfully");
  }
} catch (error) {
  console.error("Failed to render React application:", error);
  document.body.innerHTML = "<div style='padding:20px;color:white;background:black;'>Error rendering application. Check console for details.</div>";
}
