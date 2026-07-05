import "../styles/Hero.css";
import banner from "../images/banner.png";

function Hero() {
  return (
    <section className="hero">
      <img
        src={banner}
        alt="Sri Laxmi Fashion Banner"
        className="hero-banner"
      />
    </section>
  );
}

export default Hero;