import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/geologica/shrp.css'
import '@fontsource-variable/onest/wght.css'
import './index.css'
import App from './App'

const root = document.getElementById('root')!
if (root.firstElementChild) hydrateRoot(root, <App />)
else createRoot(root).render(<App />)
