import React from 'react'
import { createRoot } from 'react-dom/client'

function TestApp() {
  const [count, setCount] = React.useState(0)
  
  React.useLayoutEffect(() => {
    console.log('useLayoutEffect working')
  }, [])

  return (
    <div>
      <h1>React Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

// Test if React is properly available
console.log('React:', React)
console.log('React.useLayoutEffect:', React.useLayoutEffect)

const root = createRoot(document.getElementById('root')!)
root.render(<TestApp />)