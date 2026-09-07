import About from "./_component/About";
import Header from "./_component/Header";
import HowItWorks from "./_component/HowItWork";
import EmailHome from "./Dashboard/EmailHome";

function page() {
  return (
    <div>
      <Header />
      <About />
      <EmailHome />
      <HowItWorks/>
    </div>
  );
}

export default page;