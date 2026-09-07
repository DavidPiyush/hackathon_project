import HowItWorks from "./_component/HowItWork";
import EmailHome from "./Dashboard/EmailHome";
import About from "./_component/About"
import Contact from "./_component/Contact"
import Footer from "./_component/Footer"
import Header from "./_component/Header"
import Hero from "./_component/Hero"
import Features from "./_component/Features";

function page() {
  return (
    <div>
      <Header />    
      <Hero/>
      <HowItWorks/>
      <Features/>
      <About/>
      <Contact/>
      <Footer/>
    </div>
  );
}

export default page;