import { useState } from "react";
import { MapPin, Globe, Send } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import FormField from "../components/FormField";
import Button from "../components/Button";
import { contentApi } from "../api/content";
import { SITE } from "../data/site.js";

const EMPTY = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSending(true);
    try {
      await contentApi.sendContact(form);
      setDone(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <PublicLayout active="Contact">
      <section className="banner">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you - reach out any time</p>
      </section>

      <div className="container contact-page">
        <div className="contact__info card">
          <h2>Get in Touch</h2>
          <p className="contact__intro">
            Have a question or want to collaborate? Send us a message and our team will respond as soon as possible.
          </p>
          <ul className="contact__list">
            <li>
              <span className="contact__icon"><MapPin size={18} /></span>
              <div>
                <strong>Address</strong>
                <p>{SITE.address}</p>
              </div>
            </li>
            <li>
              <span className="contact__icon"><Globe size={18} /></span>
              <div>
                <strong>Website</strong>
                <p><a href={`https://${SITE.website}`} target="_blank" rel="noreferrer" className="link">{SITE.website}</a></p>
              </div>
            </li>
          </ul>
        </div>

        <form className="contact__form card" onSubmit={submit}>
          <h2>Send a Message</h2>
          {done && (
            <div className="notice-ok" role="status">
              Thank you! Your message has been sent. We'll get back to you shortly.
            </div>
          )}
          {error && (
            <div className="notice-ok" style={{ background: "#fef2f2", color: "#b91c1c" }} role="alert">{error}</div>
          )}
          <div className="contact__grid">
            <FormField label="Your Name" required>
              <input className="control" required placeholder="Full name" value={form.name} onChange={set("name")} />
            </FormField>
            <FormField label="Email Address" required>
              <input className="control" type="email" required placeholder="your@email.com" value={form.email} onChange={set("email")} />
            </FormField>
          </div>
          <FormField label="Subject" required>
            <input className="control" required placeholder="What is this about?" value={form.subject} onChange={set("subject")} />
          </FormField>
          <FormField label="Message" required>
            <textarea className="control" required rows={6} placeholder="Write your message here…" value={form.message} onChange={set("message")} />
          </FormField>
          <Button type="submit" size="lg" disabled={sending} style={{ marginTop: 4 }}>
            <Send size={16} style={{ marginRight: 6 }} />
            {sending ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </div>
    </PublicLayout>
  );
}
