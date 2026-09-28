import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import { contentApi } from "../api/content";

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // index of open image

  useEffect(() => {
    contentApi.getGallery()
      .then((r) => setItems(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const open = (i) => setLightbox(i);
  const close = () => setLightbox(null);
  const prev = () => setLightbox((i) => (i - 1 + items.length) % items.length);
  const next = () => setLightbox((i) => (i + 1) % items.length);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, items.length]);

  return (
    <PublicLayout active="Gallery">
      <section className="banner">
        <h1>Photo Gallery</h1>
        <p>Memories from our alumni events and gatherings</p>
      </section>

      <div className="container gallery-page">
        {loading && <p style={{ color: "var(--text-muted)", padding: "40px 0" }}>Loading…</p>}
        {!loading && items.length === 0 && (
          <p style={{ color: "var(--text-muted)", padding: "40px 0" }}>No gallery photos yet.</p>
        )}
        {items.length > 0 && (
          <div className="gallery__grid gallery__grid--page">
            {items.map((item, i) => (
              <figure key={item.id} className="gallery__item gallery__item--clickable" onClick={() => open(i)}>
                <img src={item.imageUrl} alt={item.title || "Gallery photo"} loading="lazy" />
                {item.title && <figcaption>{item.title}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </div>

      {lightbox !== null && (
        <div className="lightbox" onClick={close}>
          <button className="lightbox__close" onClick={close} aria-label="Close"><X size={28} /></button>
          {items.length > 1 && (
            <button className="lightbox__prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">
              <ChevronLeft size={36} />
            </button>
          )}
          <div className="lightbox__img-wrap" onClick={(e) => e.stopPropagation()}>
            <img src={items[lightbox].imageUrl} alt={items[lightbox].title || "Gallery photo"} />
            {items[lightbox].title && <p className="lightbox__caption">{items[lightbox].title}</p>}
          </div>
          {items.length > 1 && (
            <button className="lightbox__next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">
              <ChevronRight size={36} />
            </button>
          )}
        </div>
      )}
    </PublicLayout>
  );
}
