import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './UngDung'
import './toan-cuc.css'

const root = document.getElementById('root')
if (!root) throw new Error('Không tìm thấy phần tử #root')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
