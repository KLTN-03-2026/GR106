import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import HeroSection from "./sections/HeroSection";
import IntroSection from "./sections/IntroSection";
import ServicesSection from "./sections/ServicesSection";
import ContactSection from "./sections/ContactSection";
import CornIntro from "@/assets/Corn-intro.png";
import CornBackground from "@/assets/Corn-Background.png";

class HomePage extends React.Component {
  render() {
    return (
      <div className="w-full min-h-screen overflow-x-hidden">
        {/* Background wrapper for Navbar + HeroSection */}
        <div
          className="relative w-full min-h-[calc(120vh)]"
          style={{
            backgroundImage: `url(${CornBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "top",
            backgroundAttachment: "scroll",
          }}
        >
          {/* Navbar */}
          <Navbar />

          {/* Hero Section */}
          <HeroSection />

          {/* Corn Intro Image overlay */}
          <img
            src={CornIntro}
            alt="Corn field"
            className="absolute z-20 pointer-events-none w-[313px] h-[359px] object-cover drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
            style={{
              bottom: "-5%",
              left: "493px",
            }}
          />
        </div>

        {/* Rest of the page */}
        <div className="relative bg-white">
          <IntroSection />
          <ServicesSection />
          <ContactSection />
        </div>
      </div>
    );
  }
}

export default HomePage;
