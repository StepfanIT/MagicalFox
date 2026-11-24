import { BriefProvider } from './brief'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import Calculator from './components/Calculator'
import Security from './components/Security'
import Process from './components/Process'
import Faq from './components/Faq'
import Contact from './components/Contact'
import Footer from './components/Footer'
import MobileBar from './components/MobileBar'

export default function App() {
  return (
    <BriefProvider>
      <a href="#main" className="skip-link">До основного вмісту</a>
      <Header />
      <main id="main">
        <Hero />
        <Services />
        <Calculator />
        <Security />
        <Process />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <MobileBar />
    </BriefProvider>
  )
}
