import React from 'react';

// Simple plain HTML version without component imports
// This will help us test if basic rendering works

export default function TestPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
        Test Page
      </h1>
      
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Basic Test Component</h2>
        <div style={{ padding: '10px' }}>
          <p style={{ marginBottom: '10px' }}>This is a simple test page to verify rendering is working correctly.</p>
          <button style={{ padding: '8px 16px', backgroundColor: '#3366cc', color: 'white', border: 'none', borderRadius: '4px' }}>
            Test Button
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Card 1</h2>
          <div style={{ padding: '10px' }}>
            <p>This is the first test card content.</p>
          </div>
        </div>
        
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Card 2</h2>
          <div style={{ padding: '10px' }}>
            <p>This is the second test card content.</p>
          </div>
        </div>
      </div>
    </div>
  );
}