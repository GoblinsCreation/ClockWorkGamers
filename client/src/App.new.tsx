import React from 'react';

function App() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#0066cc', textAlign: 'center' }}>ClockWork Gamers</h1>
      <p style={{ textAlign: 'center' }}>Basic React App - No External Dependencies</p>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Welcome to ClockWork Gamers</h2>
        <p>This is a simplified version of the app to troubleshoot rendering issues.</p>
        <button 
          style={{ 
            backgroundColor: '#0066cc', 
            color: 'white', 
            border: 'none', 
            padding: '10px 15px', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
          onClick={() => alert('Button clicked!')}
        >
          Click Me
        </button>
      </div>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Troubleshooting Steps</h2>
        <p>If you can see this page, basic React rendering is working correctly.</p>
        <ul>
          <li>Next, we can add back features one by one</li>
          <li>Start with routing and simple components</li>
          <li>Add providers gradually to identify issues</li>
        </ul>
      </div>
    </div>
  );
}

export default App;