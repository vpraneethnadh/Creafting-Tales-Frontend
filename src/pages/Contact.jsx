import { useState } from "react";
import "./Contact.css"

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="contact-container">
          <p className="contact-eyebrow">GET IN TOUCH</p>

          <h1>Contact Us</h1>

          <p className="contact-intro">
            Have a question about our handmade creations? We would
            love to hear from you.
          </p>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-container contact-grid">
          <div className="contact-info">
            <p className="contact-eyebrow">WE'D LOVE TO HEAR FROM YOU</p>

            <h2>Let's start a conversation.</h2>

            <p>
              Whether you have a question about a product, your order,
              or simply want to know more about Crafting Tales, feel
              free to reach out.
            </p>

            <div className="contact-details">
              <div className="contact-detail">
                <div className="contact-icon">✉</div>

                <div>
                  <h3>Email</h3>
                  <p>support@craftingtales.com</p>
                </div>
              </div>

              <div className="contact-detail">
                <div className="contact-icon">☎</div>

                <div>
                  <h3>Phone</h3>
                  <p>+91 00000 00000</p>
                </div>
              </div>

              <div className="contact-detail">
                <div className="contact-icon">⌂</div>

                <div>
                  <h3>Location</h3>
                  <p>Hyderabad, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success">
                <div className="contact-success-icon">✓</div>

                <h2>Message Sent!</h2>

                <p>
                  Thank you for reaching out. We will get back to you
                  as soon as possible.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="contact-submit"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-field">
                  <label htmlFor="name">Your Name</label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="email">Email Address</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="subject">Subject</label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="What would you like to ask?"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="message">Message</label>

                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    placeholder="Write your message..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="contact-submit"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;