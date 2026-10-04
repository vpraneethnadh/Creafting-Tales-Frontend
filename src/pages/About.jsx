import { Link } from "react-router-dom";
import "./About.css"

const About = () => {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-container">
          <p className="about-eyebrow">OUR STORY</p>

          <h1>Crafting Tales</h1>

          <p className="about-intro">
            Handmade creations made with care, creativity, and a love
            for beautiful little things.
          </p>
        </div>
      </section>

      <section className="about-story">
        <div className="about-container about-grid">
          <div className="about-content">
            <p className="about-eyebrow">WHO WE ARE</p>

            <h2>Made by hand, made with heart.</h2>

            <p>
              Crafting Tales is a handmade creations store where every
              piece is created to bring a little more beauty and
              personality into everyday life.
            </p>

            <p>
              From floral arrangements and decorative pieces to
              thoughtful handmade gifts, we believe that the smallest
              details can create the most memorable moments.
            </p>

            <p>
              Each creation is carefully selected and presented with
              the idea that handmade products should feel personal,
              meaningful, and special.
            </p>
          </div>

          <div className="about-highlight">
            <div className="about-highlight-icon">✿</div>

            <h3>Thoughtfully Crafted</h3>

            <p>
              Every creation is chosen with attention to detail,
              quality, and the joy it can bring.
            </p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-container">
          <div className="about-section-heading">
            <p className="about-eyebrow">WHAT MATTERS TO US</p>

            <h2>Our Values</h2>
          </div>

          <div className="about-values-grid">
            <article className="about-value-card">
              <div className="about-value-icon">♡</div>

              <h3>Made with Care</h3>

              <p>
                We believe handmade creations should carry a sense of
                care and attention in every detail.
              </p>
            </article>

            <article className="about-value-card">
              <div className="about-value-icon">✿</div>

              <h3>Creativity</h3>

              <p>
                We celebrate creative ideas and unique designs that
                make ordinary spaces feel special.
              </p>
            </article>

            <article className="about-value-card">
              <div className="about-value-icon">✦</div>

              <h3>Meaningful Moments</h3>

              <p>
                Our creations are made to become part of gifts,
                celebrations, memories, and everyday moments.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="about-container">
          <p className="about-eyebrow">DISCOVER SOMETHING SPECIAL</p>

          <h2>Find something made just for you.</h2>

          <p>
            Explore our collection of handmade creations and discover
            something beautiful for yourself or someone special.
          </p>

          <Link to="/shop" className="about-shop-button">
            Explore the Shop
          </Link>
        </div>
      </section>
    </main>
  );
};

export default About;