import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'react-tooltip/dist/react-tooltip.css'
import 'rc-slider/assets/index.css'

const root = document.getElementById('root')
createRoot(root).render(<App />)
