import { createRoot } from "react-dom/client";
import BareMinimumApp from "./BareMinimumApp";
import "./index.css";

// Use a try-catch to help diagnose rendering issues
try {
  console.log("Initializing bare minimum application for debugging");
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Could not find root element to mount React app");
    document.body.innerHTML = "<div style='padding:20px;color:white;background:black;'>Error: Could not find root element</div>";
  } else {
    // Setup minimal error handlers
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
    
    // Render the bare minimum app with no dependencies on WebSockets or authentication
    createRoot(rootElement).render(<BareMinimumApp />);
    console.log("Bare minimum application rendered successfully");
  }
} catch (error) {
  console.error("Failed to render React application:", error);
  document.body.innerHTML = "<div style='padding:20px;color:white;background:black;'>Error rendering application. Check console for details.</div>";
}
