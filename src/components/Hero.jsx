import { useEffect, useRef } from "react";
import "../styles/Hero.css";
import banner from "../images/banner.png";

function Hero() {
  const bannerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const scrollY = window.scrollY;
        bannerRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero">
      <img
        ref={bannerRef}
        src={banner}
        alt="Sri Laxmi Fashion — Premium Indian Fashion and Jewellery"
        className="hero-banner"
      />
    </section>
  );
}

export default Hero;
