import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <main className="home-page">

      {/* ================= HERO ================= */}
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-eyebrow">HANDMADE WITH LOVE</p>

          <h1>
            Little creations,
            <br />
            made to tell a tale.
          </h1>

          <p className="home-hero-text">
            Discover unique handmade creations crafted to bring
            warmth, color, and a little joy into your everyday life.
          </p>

          <div className="home-hero-actions">
            <Link to="/shop" className="home-primary-button">
              Explore the Collection
            </Link>

            <Link to="/about" className="home-secondary-button">
              Our Story
            </Link>
          </div>
        </div>

        <div className="home-hero-decoration">
          <div className="home-flower flower-one">✿</div>
          <div className="home-flower flower-two">❀</div>
          <div className="home-flower flower-three">✿</div>

          <div className="home-hero-card">
            <span>CRAFTED</span>
            <strong>with love</strong>
          </div>
        </div>
      </section>

      {/* ================= INTRO ================= */}
      <section className="home-intro">
        <div className="home-container">
          <p className="home-eyebrow">
            WELCOME TO CRAFTING TALES
          </p>

          <h2>Handmade pieces with a story to tell.</h2>

          <p className="home-intro-text">
            We believe that handmade creations have something special
            about them. Every piece can become part of a memory, a
            thoughtful gift, or a small moment of happiness.
          </p>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="home-categories">
        <div className="home-container">

          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">EXPLORE</p>

              <h2>Find your favorite.</h2>
            </div>

            <Link to="/shop" className="home-view-link">
              View All →
            </Link>
          </div>

          <div className="home-category-grid">

            {/* BOUQUETS */}
            <Link
              to="/shop?category=Bouquet"
              className="home-category-card"
            >
              <div className="home-category-icon">
                ❀
              </div>

              <h3>Bouquets</h3>

              <p>
                Beautiful handmade flowers that last beyond
                the moment.
              </p>
            </Link>

            {/* KEYCHAINS */}
            <Link
              to="/shop?category=Keychains"
              className="home-category-card"
            >
              <div className="home-category-icon">
                ♡
              </div>

              <h3>Keychains</h3>

              <p>
                Small colorful creations made to travel
                with you.
              </p>
            </Link>

            {/* HAIRBANDS */}
            <Link
              to="/shop?category=Hairband"
              className="home-category-card"
            >
              <div className="home-category-icon">
                ✦
              </div>

              <h3>Hairbands</h3>

              <p>
                Playful handmade accessories for your
                everyday style.
              </p>
            </Link>

            {/* DECOR */}
            <Link
              to="/shop?category=Lamps"
              className="home-category-card"
            >
              <div className="home-category-icon">
                ✿
              </div>

              <h3>Decor</h3>

              <p>
                Handmade pieces designed to add character
                to your space.
              </p>
            </Link>

          </div>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="home-story">
        <div className="home-container home-story-grid">

          <div className="home-story-decoration">
            <div className="home-story-circle">
              <span>HANDMADE</span>
              <strong>WITH HEART</strong>
            </div>
          </div>

          <div className="home-story-content">
            <p className="home-eyebrow">
              THE CRAFTING TALES WAY
            </p>

            <h2>
              Because handmade feels personal.
            </h2>

            <p>
              From the first idea to the final detail, our
              creations are inspired by color, creativity,
              and the simple joy of making something beautiful.
            </p>

            <p>
              Whether you're looking for a gift or something
              special for yourself, we hope you find a creation
              that feels like it was made for your story.
            </p>

            <Link
              to="/about"
              className="home-story-link"
            >
              Discover Our Story →
            </Link>
          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="home-cta">
        <div className="home-container">

          <p className="home-eyebrow">
            YOUR NEXT FAVORITE CREATION
          </p>

          <h2>
            Something handmade is waiting for you.
          </h2>

          <p>
            Explore our collection and discover something beautiful.
          </p>

          <Link
            to="/shop"
            className="home-primary-button"
          >
            Shop Now
          </Link>

        </div>
      </section>

    </main>
  );
};

export default Home;