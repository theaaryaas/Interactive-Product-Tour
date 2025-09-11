export default function TestPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ color: 'blue', fontSize: '24px' }}>Test Page</h1>
      <p style={{ color: 'red' }}>If you can see this, the basic React is working!</p>
      <button style={{ 
        backgroundColor: '#007bff', 
        color: 'white', 
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px'
      }}>
        Test Button
      </button>
    </div>
  )
}
