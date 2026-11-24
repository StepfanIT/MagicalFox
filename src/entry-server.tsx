import { renderToString } from 'react-dom/server'
import App from './App'

export { structuredData } from './seo'
export const render = () => renderToString(<App />)
