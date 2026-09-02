import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ClientsSection.css';

function useAos(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('aos-visible'), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

/* ── How many logos per slide at each screen size ── */
function usePerPage() {
  const calc = () => {
    if (typeof window === 'undefined') return 8;
    const w = window.innerWidth;
    if (w <= 480)  return 4;   // 2 x 2
    if (w <= 768)  return 6;   // 3 x 2
    if (w <= 1024) return 6;   // 3 x 2
    return 8;                  // 4 x 2
  };
  const [perPage, setPerPage] = useState(calc);
  useEffect(() => {
    let t;
    const onResize = () => { clearTimeout(t); t = setTimeout(() => setPerPage(calc()), 150); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t); };
  }, []);
  return perPage;
}

const clients = [
  { name: 'Bravo Investment House',   url: 'https://www.bravo-investment.com/',                                 initials: 'BI',  color: '#1a3a6e' },
  { name: 'John D Wood',              url: 'https://www.johndwood.co.uk',                                       initials: 'JDW', color: '#2c5282' },
  { name: 'County Rents',             url: 'https://www.countyrents.co.uk',                                     initials: 'CR',  color: '#276749' },
  { name: 'Corridy Property',         url: 'https://corridyproperty.co.uk/',                                    initials: 'CP',  color: '#744210' },
  { name: 'AZ Property',              url: 'https://azproperty.co.uk/',                                         initials: 'AZ',  color: '#553c9a' },
  { name: 'Ash Ponsonby',             url: 'https://www.ashponsonby.com/',                                      initials: 'AP',  color: '#1a3a6e' },
  { name: 'AMM Properties',           url: 'https://www.ammproperties.co.uk/pages/about-us',                    initials: 'AMM', color: '#9b2c2c' },
  { name: 'The Collaborative London', url: 'https://www.thecollaborativelondon.co.uk/',                         initials: 'TCL', color: '#22543d' },
  { name: 'RS Estate Agents',         url: 'https://rsestateagents.co.uk/',                                     initials: 'RS',  color: '#2a4365' },
  { name: 'IPS Property Services',    url: 'https://www.estatepropertyagents.co.uk/6401/ips-property-services',  initials: 'IPS', color: '#702459' },
  { name: 'Lawsons & Daughters',      url: 'https://www.lawsonsanddaughters.com/#/',                            initials: 'L&D', color: '#3d2c0a' },
  { name: 'Sequence Properties',      url: 'https://www.sequenceproperties.co.uk/',                             initials: 'SEQ', color: '#1a365d' },
  { name: 'HMO Property Licensing',   url: 'https://hmopropertylicensing.co.uk/',                               initials: 'HMO', color: '#276749' },
  { name: 'My Paragon',               url: 'https://www.myparagon.co.uk/',                                      initials: 'MP',  color: '#742a2a' },
  { name: 'KFH',                      url: 'https://www.kfh.co.uk/',                                            initials: 'KFH', color: '#2c5282' },
  { name: 'Bond Docwra',              url: 'https://bonddocwra.com/hmo-properties/',                            initials: 'BD',  color: '#3c366b' },
  { name: 'Mizen',                    url: 'https://www.mizen.co.uk/',                                          initials: 'MZ',  color: '#1a4731' },
  { name: 'Sterling Estates',         url: 'https://www.sterlingestates.org.uk',                                initials: 'SE',  color: '#1a5276' },
  { name: 'FSQ Design Build',         url: 'https://www.fsqdesignbuild.co.uk',                                  initials: 'FSQ', color: '#6e2f1a' },
  { name: 'Gibbs Gillespie',          url: 'https://www.gibbs-gillespie.co.uk/',                                initials: 'GG',  color: '#1a4a2e' },
];

function ClientCard({ client }) {
  return (
    <a
      href={client.url}
      target="_blank"
      rel="noopener noreferrer"
      className="client-card"
      title={client.name}
    >
      <div className="client-logo" style={{ background: client.color }}>
        <span>{client.initials}</span>
      </div>
      <span className="client-name">{client.name}</span>
    </a>
  );
}

export default function ClientsSection() {
  const headerRef = useAos(0);
  const perPage   = usePerPage();
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(clients.length / perPage));

  // Keep page in range when the screen size changes
  useEffect(() => {
    setPage(p => Math.min(p, totalPages - 1));
  }, [totalPages]);

  const next = useCallback(() => setPage(p => (p + 1) % totalPages), [totalPages]);
  const prev = useCallback(() => setPage(p => (p - 1 + totalPages) % totalPages), [totalPages]);

  // Build the pages
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(clients.slice(i * perPage, i * perPage + perPage));
  }

  // Swipe support
  const touchX = useRef(null);
  const onTouchStart = e => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
    touchX.current = null;
  };

  return (
    <section className="clients-section">
      <div className="container">
        <div className="clients-header aos-fade-up" ref={headerRef}>
          <div className="section-label">Trusted By</div>
          <h2 className="section-title">Clients We Work With</h2>
          <p className="section-desc">
            Proud to work with some of London&rsquo;s leading property companies, estate agents and letting agents.
          </p>
        </div>

        <div className="clients-slider">
          <button
            className="clients-arrow clients-arrow--prev"
            onClick={prev}
            aria-label="Previous clients"
            disabled={totalPages <= 1}
          >
            <ChevronLeft size={20} />
          </button>

          <div
            className="clients-viewport"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="clients-track"
              style={{ transform: `translateX(-${page * 100}%)` }}
            >
              {pages.map((group, i) => (
                <div className="clients-page" key={i}>
                  <div className="clients-grid">
                    {group.map((client, j) => (
                      <ClientCard key={`${i}-${j}`} client={client} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="clients-arrow clients-arrow--next"
            onClick={next}
            aria-label="Next clients"
            disabled={totalPages <= 1}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {totalPages > 1 && (
          <div className="clients-dots">
            {pages.map((_, i) => (
              <button
                key={i}
                className={`clients-dot ${i === page ? 'clients-dot--active' : ''}`}
                onClick={() => setPage(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
