import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function SimpleApp() {
  const [count, setCount] = React.useState(0)
  
  React.useLayoutEffect(() => {
    console.log('useLayoutEffect is working!')
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple React Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <p>If you can see this and the button works, React is functioning properly.</p>
    </div>
  )
}

console.log('React object:', React)
console.log('useLayoutEffect:', React.useLayoutEffect)

const root = createRoot(document.getElementById('root')!)
root.render(<SimpleApp />)