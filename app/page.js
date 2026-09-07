import Contact from "./_component/Contact"
import Dashboard from "./_component/Dashboard"
import Header from "./_component/Header"
import Hero from "./_component/Hero"

function page() {
  return (
    <div>
      <Header/>
      <Hero/>
      <Contact/>
      {/* <Dashboard/> */}
    </div>
  )
}

export default page
