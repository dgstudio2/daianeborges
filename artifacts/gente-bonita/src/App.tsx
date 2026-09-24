import { useState, useEffect, type FormEvent, type ReactNode, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowUpRight, Clock3, MessageCircle, AlertCircle, Instagram } from 'lucide-react';
import NotFound from '@/pages/not-found';
import AdminPage from '@/pages/admin';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { supabase, loadSiteData, DEFAULT_DATA, type SiteData, type ServiceRow, type HourRow, type SiteSettings } from '@/lib/supabase';

const queryClient = new QueryClient();

// ── Site Data Context ─────────────────────────────────────────────────────────
const SiteDataContext = createContext<SiteData>(DEFAULT_DATA);
const useSiteData = () => useContext(SiteDataContext);

// ── Utilitários ───────────────────────────────────────────────────────────────
function scrollTo(href: string) {
  const id = href.replace('#', '');
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function waLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

// ── Marca ─────────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header className="dg-header">
      <div className="dg-shell flex h-[72px] items-center" />
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const { settings } = useSiteData();
  const heroImg = settings.hero_image_url;

  return (
    <section id="inicio"
      className={`relative flex items-center pt-24 pb-14 overflow-hidden ${heroImg ? 'min-h-[420px] md:min-h-[520px]' : 'min-h-[360px] md:min-h-[440px]'}`}
      style={{ background: 'hsl(0 0% 8%)' }}>
      {heroImg && <div className="absolute right-0 top-0 w-full h-full md:w-[48%] -z-10" style={{ background: 'hsl(0 0% 5%)' }} />}
      <div className="absolute left-0 bottom-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent -z-10" />

      <div className={`dg-shell relative z-10 w-full ${heroImg ? 'grid md:grid-cols-2 gap-10 items-center' : 'flex flex-col items-center text-center'}`}>
        <div className="dg-reveal max-w-[600px] py-8 md:py-0">
          <h1 className="dg-display text-[36px] leading-[1.06] md:text-[52px]" style={{ color: '#f5f0ea' }}>
            {settings.hero_title}
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed max-w-[440px] mx-auto" style={{ color: 'hsl(0 0% 55%)' }}>
            {settings.hero_subtitle}
          </p>
        </div>

        {heroImg && (
          <div className="dg-reveal dg-reveal-delay relative aspect-[4/5] w-full max-w-[440px] mx-auto rounded-tl-[70px] rounded-br-[70px] overflow-hidden shadow-2xl"
            style={{ border: '4px solid hsl(43 74% 45% / .25)' }}>
            <img src={heroImg} alt="Studio Daiane Gomes" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}


// ── Services ──────────────────────────────────────────────────────────────────
function Services() {
  const { services, settings } = useSiteData();

  return (
    <section id="especialidades" className="dg-dark-section scroll-mt-20 py-20 md:py-28">
      <div className="dg-shell">
        <div className="text-center max-w-xl mx-auto mb-12 dg-reveal">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: 'hsl(43 74% 55%)' }}>Especialidades</p>
          <h2 className="dg-display text-4xl md:text-5xl" style={{ color: '#f5f0ea' }}>Nossos Serviços</h2>
          <div className="mt-5 mx-auto h-px w-20" style={{ background: 'linear-gradient(90deg, transparent, hsl(43 74% 55%), transparent)', boxShadow: '0 0 8px hsl(43 74% 55% / .6)' }} />
        </div>

        <div className="dg-cards-grid">
          {services.map((s: ServiceRow, i: number) => (
            <div
              key={s.id}
              className={`dg-service-card dg-reveal${s.featured ? ' dg-service-featured' : ''}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="relative h-40 shrink-0 overflow-hidden">
                <img src={s.image_url ?? ''} alt={s.title} className="h-full w-full object-cover opacity-80" />
                {s.featured && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest"
                    style={{ background: 'hsl(43 74% 45%)', color: '#fff', boxShadow: '0 0 10px hsl(43 74% 45% / .7)' }}>
                    Oferta Especial
                  </span>
                )}
              </div>
              <div className="flex flex-col flex-grow p-5">
                <h3 className="font-serif text-xl font-semibold leading-tight" style={{ color: '#f5f0ea' }}>{s.title}</h3>
                {s.subtitle && <p className="mt-0.5 text-xs font-semibold" style={{ color: 'hsl(43 74% 55%)' }}>{s.subtitle}</p>}
                <p className="mt-3 text-xs leading-relaxed flex-grow" style={{ color: 'hsl(0 0% 58%)' }}>{s.description}</p>

                <div className="mt-4 mb-5 border-t pt-4" style={{ borderColor: 'hsl(0 0% 16%)' }}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: 'hsl(0 0% 45%)' }}>Investimento</span>
                    <span className="text-xl font-bold" style={{ color: 'hsl(43 74% 55%)', textShadow: '0 0 10px hsl(43 74% 55% / .5)' }}>{s.price}</span>
                  </div>
                  {s.old_price && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="line-through text-xs" style={{ color: 'hsl(0 0% 38%)' }}>{s.old_price}</span>
                      <span className="text-xs font-bold" style={{ color: 'hsl(43 74% 55%)' }}>economia!</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock3 size={11} style={{ color: 'hsl(0 0% 45%)' }} />
                    <span className="text-[11px]" style={{ color: 'hsl(0 0% 45%)' }}>{s.duration}</span>
                  </div>
                </div>

                <a
                  href={waLink(settings.whatsapp_number, `Olá Daiane! Tenho interesse no serviço de ${s.title} (${s.price}). Como estão os horários?`)}
                  target="_blank" rel="noreferrer"
                  className="dg-button-gold-neon w-full text-center"
                  style={{ fontSize: '10px' }}
                >
                  Agendar pelo WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Hours + Booking ───────────────────────────────────────────────────────────
function HoursAndBooking() {
  const { hours, services, settings } = useSiteData();
  const [form, setForm] = useState({ name: '', phone: '', service: '', date: '', time: '' });
  const [error, setError] = useState('');

  const handleBooking = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.phone.trim() || !form.service || !form.date || !form.time) {
      setError('Preencha todos os campos para consultar a disponibilidade.');
      return;
    }

    const booking = new Date(`${form.date}T${form.time}:00`);
    const day = booking.getDay();
    const mins = booking.getHours() * 60 + booking.getMinutes();

    if (day === 0) { setError('Não realizamos atendimentos aos domingos.'); return; }

    if (day >= 1 && day <= 5) {
      const morning = mins >= 480 && mins <= 600;
      const evening = mins >= 1050;
      const rest = mins >= 780 && mins < 1020;
      if (rest) { setError('Das 13h às 17h é reservado para cuidados familiares. Escolha outro horário.'); return; }
      if (!morning && !evening) { setError('De seg. a sex. atendemos das 08h às 10h e a partir das 17h30.'); return; }
    }

    if (day === 6) {
      if (mins < 420 || mins > 930) { setError('Aos sábados atendemos das 07h às 15h30.'); return; }
    }

    const d = form.date.split('-').reverse().join('/');
    window.open(waLink(
      settings.whatsapp_number,
      `Olá Daiane! Me chamo *${form.name.trim()}* e meu WhatsApp é *${form.phone.trim()}*.\n\nTenho interesse em *${form.service}* no dia *${d}* às *${form.time}*. Poderia confirmar disponibilidade?`
    ), '_blank');
  };

  return (
    <section id="agendamento" className="dg-dark-section scroll-mt-20 py-20 md:py-28 border-t" style={{ borderColor: 'hsl(0 0% 14%)' }}>
      <div className="dg-shell">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Horários */}
          <div className="dg-reveal">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: 'hsl(43 74% 55%)' }}>Agenda</p>
            <h2 className="dg-display text-4xl mb-8" style={{ color: '#f5f0ea' }}>Horários de Atendimento</h2>

            <div className="space-y-3">
              {hours.map((item: HourRow) => (
                <div key={item.id} className="flex justify-between items-center p-4 rounded-lg border"
                  style={{
                    background: item.muted ? 'hsl(0 0% 7%)' : 'hsl(0 0% 10%)',
                    borderColor: item.muted ? 'hsl(0 0% 14%)' : 'hsl(43 74% 45% / .2)',
                    opacity: item.muted ? 0.6 : 1,
                    boxShadow: item.muted ? 'none' : '0 0 0 1px hsl(43 74% 45% / .08)',
                  }}>
                  <span className="font-semibold text-sm" style={{ color: item.muted ? 'hsl(0 0% 40%)' : '#f5f0ea' }}>{item.day}</span>
                  <span className="text-sm" style={{ color: item.muted ? 'hsl(0 0% 38%)' : 'hsl(43 74% 60%)' }}>{item.hours}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 rounded-lg border flex gap-4 items-start" style={{ background: 'hsl(43 74% 45% / .07)', borderColor: 'hsl(43 74% 45% / .25)' }}>
              <AlertCircle size={22} style={{ color: 'hsl(43 74% 55%)', flexShrink: 0 }} />
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(0 0% 55%)' }}>
                <strong style={{ color: '#f5f0ea', display: 'block', marginBottom: 4 }}>Nota importante</strong>
                O intervalo das 13h às 17h de segunda a sexta é reservado para cuidados com meu bebê. Agradeço a compreensão!
              </p>
            </div>
          </div>

          {/* Formulário */}
          <div className="dg-reveal dg-reveal-delay">
            <div className="p-8 md:p-10 rounded-2xl border"
              style={{ background: 'hsl(0 0% 9%)', borderColor: 'hsl(43 74% 45% / .25)', boxShadow: '0 0 40px hsl(43 74% 45% / .06)' }}>
              <h3 className="font-serif text-3xl mb-2" style={{ color: '#f5f0ea' }}>Solicitar Horário</h3>
              <p className="text-sm mb-8" style={{ color: 'hsl(0 0% 45%)' }}>
                Preencha os dados abaixo. Você será redirecionada ao WhatsApp para confirmar a disponibilidade.
              </p>

              <form onSubmit={handleBooking} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="dg-input-label">Seu Nome</label>
                    <input required type="text" placeholder="Ex: Maria Silva" className="dg-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="dg-input-label">Seu WhatsApp</label>
                    <input required type="tel" placeholder="(66) 9 9999-9999" className="dg-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="dg-input-label">Serviço</label>
                  <select required className="dg-input" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                    <option value="">Selecione...</option>
                    {services.map((s: ServiceRow) => (
                      <option key={s.id} value={s.title}>{s.title} ({s.price})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="dg-input-label">Data</label>
                    <input required type="date" className="dg-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="dg-input-label">Horário</label>
                    <input required type="time" className="dg-input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                </div>

                {error && (
                  <p className="text-sm font-medium p-3 rounded-md" style={{ color: 'hsl(0 84% 65%)', background: 'hsl(0 84% 60% / .1)', border: '1px solid hsl(0 84% 60% / .25)' }}>
                    {error}
                  </p>
                )}

                <button type="submit" className="dg-button-gold-neon w-full">
                  Verificar Disponibilidade <ArrowUpRight size={15} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const { settings, hours } = useSiteData();

  return (
    <footer style={{ background: 'hsl(0 0% 4%)', color: '#f5f0ea', paddingTop: '56px', paddingBottom: '40px' }}>
      <div className="dg-shell">
        <div className="grid md:grid-cols-3 gap-10 pb-10 border-b" style={{ borderColor: 'hsl(0 0% 14%)' }}>
          {/* Marca */}
          <div>
            <span className="font-serif text-3xl font-bold tracking-tighter" style={{ color: '#f5f0ea' }}>DG Studio</span>
            <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: 'hsl(0 0% 45%)' }}>{settings.footer_tagline}</p>
          </div>

          {/* Contato */}
          <div>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'hsl(43 74% 55%)' }}>Contato</p>
            <ul className="space-y-4 text-sm" style={{ color: 'hsl(0 0% 50%)' }}>
              <li>
                <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors" style={{ color: 'hsl(0 0% 50%)' }}>
                  <MessageCircle size={14} /> {settings.whatsapp_label}
                </a>
              </li>
              <li>
                <a href={settings.instagram_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors" style={{ color: 'hsl(0 0% 50%)' }}>
                  <Instagram size={14} /> {settings.instagram_handle}
                </a>
              </li>
            </ul>
          </div>

          {/* Horários */}
          <div>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'hsl(43 74% 55%)' }}>Horários</p>
            <ul className="space-y-2 text-sm" style={{ color: 'hsl(0 0% 50%)' }}>
              {hours.filter((h: HourRow) => !h.muted).map((h: HourRow) => (
                <li key={h.id}>{h.day}: {h.hours}</li>
              ))}
              {hours.filter((h: HourRow) => h.muted).map((h: HourRow) => (
                <li key={h.id} style={{ color: 'hsl(0 0% 32%)' }}>{h.day}: {h.hours}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs" style={{ color: 'hsl(0 0% 30%)' }}>
          <p>© {new Date().getFullYear()} Daiane Gomes Studio. Todos os direitos reservados.</p>

          {/* Botão ADM — discreto e elegante */}
          <a
            href="/admin"
            title="Área Administrativa"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'hsl(0 0% 28%)', fontSize: 11, fontWeight: 600,
              letterSpacing: '.08em', textDecoration: 'none',
              border: '1px solid hsl(0 0% 16%)', borderRadius: 4,
              padding: '5px 12px', transition: 'all .25s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'hsl(43 74% 55%)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'hsl(43 74% 45% / .4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'hsl(0 0% 28%)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'hsl(0 0% 16%)'; }}
          >
            ✦ Área ADM
          </a>
        </div>
      </div>
    </footer>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
function Home() {
  return (
    <div className="min-h-[100dvh] overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Services />
        <HoursAndBooking />
      </main>
      <Footer />
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [siteData, setSiteData] = useState<SiteData>(DEFAULT_DATA);

  useEffect(() => {
    loadSiteData().then(setSiteData);
    // Refresh on focus (after admin edits in another tab)
    const onFocus = () => loadSiteData().then(setSiteData);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SiteDataContext.Provider value={siteData}>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
        </SiteDataContext.Provider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;