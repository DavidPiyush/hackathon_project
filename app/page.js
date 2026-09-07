import About from "./_component/About"
import Contact from "./_component/Contact"
import Footer from "./_component/Footer"
import Header from "./_component/Header"
import Hero from "./_component/Hero"

function page() {
  return (
    <div>
      <Header/>
      <Hero/>
      <About/>
      <Contact/>
      <Footer/>
    </div>
  )
}

export default page
