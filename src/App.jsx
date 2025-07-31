import React,{ useState } from 'react'
import './App.css'
import TreeEditor from './components/TreeEditor'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div className="w-full h-screen">
      <TreeEditor />
    </div>
    </>
  )
}

export default App
