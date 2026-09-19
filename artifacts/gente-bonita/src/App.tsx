import { useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowDown, ArrowUpRight, Brush, Check, ChevronRight, Clock3, Crown, Eye, Gem, Instagram, Menu, MessageCircle, Palette, Scissors, Sparkles, X } from 'lucide-react';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const CONTACTS = {
  whatsappNumber: '5566984165461',
  whatsappLabel: '(66) 98416-5461',
  address: 'Rua Simeão Arraya, 1091 - Centro, Barra do Garças - MT, 78600-001',
  mapsUrl: 'https://maps.app.goo.gl/MjawqW4HePjDFeKVA',
  hours: 'Terça a sexta · 09:00–18:00',
  instagramHandle: '@gentebonitabg',
  instagramUrl: 'https://instagram.com/gentebonitabg',
};

const OPENING_HOURS = [
  { day: 'Domingo', hours: 'Fechada' },
  { day: 'Segunda-feira', hours: 'Fechada' },
  { day: 'Terça-feira', hours: '09:00–18:00' },
  { day: 'Quarta-feira', hours: '09:00–18:00' },
  { day: 'Quinta-feira', hours: '09:00–18:00' },
  { day: 'Sexta-feira', hours: '09:00–18:00' },
];

const NAV_ITEMS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'O atelier', href: '#sobre' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Agendamento', href: '#agendamento' },
];

const SERVICES = [
  { id: 'corte', number: '01', title: 'Corte & styling', description: 'Um desenho pensado para acompanhar o seu ritmo e revelar a sua presença.', detail: 'Personalizado', icon: Scissors },
  { id: 'cor', number: '02', title: 'Cor & iluminação', description: 'Dimensões, reflexos e tons que conversam com a sua pele — nunca uma fórmula pronta.', detail: 'Sob consulta', icon: Palette },
  { id: 'mega-hair', number: '03', title: 'Mega Hair', description: 'Comprimento e volume com acabamento natural, escolha cuidadosa e atenção a cada fio.', detail: 'Experiência autoral', icon: Gem },
  { id: 'tratamentos', number: '04', title: 'Tratamentos', description: 'Rituais de cuidado para devolver movimento, toque e brilho ao cabelo.', detail: 'Ritual completo', icon: Sparkles },
  { id: 'make', number: '05', title: 'Make & beleza', description: 'Beleza para ocasiões especiais ou para um dia que merece mais presença.', detail: 'Por ocasião', icon: Brush },
  { id: 'noiva', number: '06', title: 'Noivas & ocasiões', description: 'Um momento inteiro desenhado ao seu redor, com calma e intenção.', detail: 'Projeto especial', icon: Crown },
];

const GALLERY_ITEMS = [
  { src: '/images/hero-beauty.jpg', alt: 'Retrato editorial com cabelos acobreados', label: 'Textura & luz', size: 'large' },
  { src: '/images/mega-hair.jpg', alt: 'Detalhe de cabelo longo com reflexos', label: 'Mega Hair', size: 'tall' },
  { src: '/images/still-life.jpg', alt: 'Objetos de beleza sobre seda rosada', label: 'O gesto', size: 'small' },
  { src: '/images/profile-beauty.jpg', alt: 'Perfil de mulher com cabelo escuro', label: 'Presença', size: 'small' },
];

const PROFESSIONALS = ['Ainda não sei', 'Profissional a confirmar'];

function scrollToSection(href: string) {
  const id = href.replace('#', '');
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.replaceState(null, '', href);
}

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <a href="#inicio" onClick={(event) => { event.preventDefault(); scrollToSection('#inicio'); }} className={`inline-flex items-center gap-3 ${light ? 'text-[#f9eee7]' : 'text-[#f9eee7]'}`} data-testid="link-brand">
      <span className="gb-logo-mark flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d68c80]/70">
        <img src="/images/gente-bonita-logo.jpg" alt="" className="h-[170%] w-[170%] max-w-none object-cover mix-blend-screen" />
      </span>
      <span className="leading-none">
        <strong className="block text-[16px] font-medium tracking-[.13em]">GENTE</strong>
        <em className="block pt-1 text-[10px] not-italic tracking-[.32em] text-[#d68c80]">BONITA</em>
      </span>
    </a>
  );
}

function SectionHeading({ eyebrow, title, copy, align = 'left' }: { eyebrow: string; title: ReactNode; copy?: string; align?: 'left' | 'center' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <p className="gb-eyebrow mb-5">{eyebrow}</p>
      <h2 className="gb-display text-4xl leading-[.98] text-[#f9eee7] md:text-6xl">{title}</h2>
      {copy && <p className="gb-muted mt-6 max-w-lg text-[15px] leading-7">{copy}</p>}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute left-0 right-0 top-0 z-40">
      <div className="gb-shell flex h-[88px] items-center justify-between border-b border-[#f9eee7]/15">
        <BrandMark light />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} onClick={(event) => { event.preventDefault(); scrollToSection(item.href); }} className="gb-nav-link text-[11px] uppercase tracking-[.12em]" data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.label}</a>
          ))}
        </nav>
        <a href="#agendamento" onClick={(event) => { event.preventDefault(); scrollToSection('#agendamento'); }} className="gb-button gb-button-primary hidden min-h-[40px] px-5 md:inline-flex" data-testid="link-header-booking">Reservar meu momento</a>
        <button type="button" aria-label={open ? 'Fechar menu' : 'Abrir menu'} className="rounded-full border border-[#f9eee7]/20 p-2 text-[#f9eee7] md:hidden" onClick={() => setOpen((value) => !value)} data-testid="button-mobile-menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="gb-menu-panel border-b border-[#f9eee7]/15 bg-[#080709] px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-5" aria-label="Navegação mobile">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} onClick={(event) => { event.preventDefault(); setOpen(false); scrollToSection(item.href); }} className="text-sm uppercase tracking-[.14em] text-[#f9eee7]" data-testid={`link-mobile-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.label}</a>
            ))}
          </nav>
          <button type="button" className="gb-button gb-button-primary mt-7 w-full" onClick={() => { setOpen(false); scrollToSection('#agendamento'); }} data-testid="button-mobile-booking">Reservar meu momento <ArrowUpRight size={15} /></button>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-[740px] items-end overflow-hidden bg-[#080709] pb-16 pt-32 md:min-h-[820px] md:pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_38%,rgba(185,93,85,.28),transparent_32%),linear-gradient(110deg,#080709_8%,rgba(8,7,9,.82)_45%,rgba(8,7,9,.25)_100%)]" />
      <div className="gb-luxe-glow absolute -left-24 top-24 h-72 w-72 rounded-full" />
      <Sparkles className="gb-sparkle absolute right-[22%] top-[22%] h-5 w-5 text-[#e4a49a]" />
      <div className="absolute inset-y-0 right-0 w-full md:w-[58%]">
        <img src="/images/hero-beauty.jpg" alt="Mulher com cabelo acobreado em retrato editorial" className="h-full w-full object-cover object-[56%_center] opacity-90 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080709] via-[#080709]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080709] via-transparent to-[#080709]/20" />
      </div>
      <div className="gb-shell relative z-10 w-full">
        <div className="max-w-[720px] gb-reveal">
          <p className="gb-eyebrow mb-7">Um atelier para a sua beleza</p>
          <h1 className="gb-display max-w-[760px] text-[clamp(3.65rem,9vw,7.9rem)] leading-[.88] text-[#f9eee7]">Sua beleza merece uma <em className="text-[#df9587]">experiência</em> extraordinária.</h1>
          <div className="mt-10">
            <a href="#servicos" onClick={(event) => { event.preventDefault(); scrollToSection('#servicos'); }} className="group flex w-fit items-center gap-3 text-[11px] uppercase tracking-[.14em] text-[#f9eee7]" data-testid="link-hero-services">Conheça os serviços <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" /></a>
          </div>
        </div>
        <div className="mt-16 flex items-end justify-between border-t border-[#f9eee7]/20 pt-5 gb-reveal gb-reveal-delay">
          <div className="hidden max-w-[260px] text-xs leading-5 text-[#d8bdb4] sm:block">Beleza que começa antes do espelho. Um tempo reservado para você.</div>
          <div className="ml-auto flex items-center gap-3 text-[#d8bdb4]"><ArrowDown size={15} /><span className="font-mono text-[10px] uppercase tracking-[.15em]">Explore o atelier</span></div>
        </div>
      </div>
    </section>
  );
}

function Services({ onSelect }: { onSelect: (service: string) => void }) {
  return (
    <section id="servicos" className="scroll-mt-6 bg-[#080709] py-16 md:py-20">
      <div className="gb-shell">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <SectionHeading eyebrow="01 / Serviços" title={<>Escolha o seu<br /><em className="text-[#df9587]">próximo ritual.</em></>} copy="Toque em um serviço para adicioná-lo ao seu agendamento." />
          <p className="max-w-[180px] text-right font-mono text-[10px] uppercase leading-5 tracking-[.12em] text-[#a99594]">Um ou mais<br />para você</p>
        </div>
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <button type="button" key={service.id} onClick={() => onSelect(service.title)} title={service.description} className={`gb-service-tile ${service.id === 'mega-hair' ? 'gb-service-tile-featured' : ''}`} aria-label={`Adicionar ${service.title} ao agendamento`} data-testid={`button-service-${service.id}`}>
                <span className="gb-service-number">{service.number}</span>
                <span className="gb-service-icon"><Icon size={23} strokeWidth={1.35} /></span>
                <span className="gb-service-title">{service.title}</span>
                <span className="gb-service-detail">{service.detail}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MegaHair({ onSelect }: { onSelect: (service: string) => void }) {
  return (
    <section id="mega-hair" className="scroll-mt-6 bg-[#100c10] py-16 text-[#f9eee7] md:py-20">
      <div className="gb-shell grid items-center gap-10 md:grid-cols-[.9fr_1.1fr] md:gap-16">
        <div className="relative order-2 md:order-1">
          <div className="absolute -left-4 -top-4 h-full w-full border border-[#b86665]/30 md:-left-7 md:-top-7" />
          <img src="/images/mega-hair.jpg" alt="Detalhe de fios longos com reflexos quentes" className="relative h-[300px] w-full object-cover md:h-[460px]" />
          <span className="absolute -bottom-5 -right-4 flex h-24 w-24 items-center justify-center rounded-full border border-[#d68c80]/55 bg-[#100c10] text-center font-mono text-[9px] uppercase leading-4 tracking-[.1em] text-[#df9587] md:-right-8">O seu<br />novo<br />movimento</span>
        </div>
        <div className="order-1 md:order-2">
          <p className="gb-eyebrow text-[#df9587]">02 / A experiência Gente Bonita</p>
          <h2 className="gb-display mt-5 text-5xl leading-[.95] md:text-7xl">Cabelos que<br /><em className="text-[#a75b58]">contam você.</em></h2>
          <p className="mt-6 max-w-[480px] text-[15px] leading-7 text-[#c9b5b3]">Mega Hair para transformar o espelho sem perder a naturalidade. A escolha dos fios, a técnica e o acabamento são pensados para que o resultado pareça — e se sinta — seu.</p>
          <p className="mt-5 max-w-[480px] text-[15px] leading-7 text-[#c9b5b3]">Um novo comprimento. Um novo movimento. A mesma você, mais extraordinária.</p>
          <button type="button" onClick={() => onSelect('Mega Hair')} className="gb-button mt-9 border-[#df9587] text-[#df9587] hover:bg-[#df9587] hover:text-[#100c10]" data-testid="button-mega-hair-booking">Conversar sobre Mega Hair <ArrowUpRight size={16} /></button>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="sobre" className="scroll-mt-6 bg-[#111014] py-20 md:py-24">
      <div className="gb-shell grid gap-10 md:grid-cols-[.8fr_1.2fr] md:gap-16">
        <div>
          <p className="gb-eyebrow">03 / O atelier</p>
          <div className="mt-7 flex items-center gap-4 text-[#d68c80]"><span className="h-px w-12 bg-[#d68c80]" /><span className="font-mono text-[10px] uppercase tracking-[.18em]">Gente Bonita</span></div>
        </div>
        <div>
          <h2 className="gb-display text-4xl leading-[1.03] text-[#f9eee7] md:text-6xl">Aqui, o cuidado não é uma etapa.<br /><em className="text-[#df9587]">É a experiência inteira.</em></h2>
          <div className="mt-8 grid gap-6 border-t border-[#f9eee7]/15 pt-7 md:grid-cols-2">
            <p className="text-[15px] leading-7 text-[#d1bbb6]">Gente Bonita nasceu para ser um lugar de pausa. Um atelier onde cada detalhe — do primeiro olhar ao último toque — existe para lembrar você da sua própria beleza.</p>
            <p className="text-[15px] leading-7 text-[#d1bbb6]">Não acreditamos em transformações que apagam quem você é. Acreditamos em escutar, interpretar e criar uma beleza que tenha a sua assinatura.</p>
          </div>
          <div className="mt-7 flex items-center gap-4 text-xs text-[#a99594]"><Sparkles size={17} className="text-[#d68c80]" /><span>Um espaço íntimo para você se escolher de novo.</span></div>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section id="galeria" className="scroll-mt-6 bg-[#080709] py-20 md:py-24">
      <div className="gb-shell">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading eyebrow="04 / Galeria" title={<>A beleza<br /><em className="text-[#df9587]">em detalhes.</em></>} />
          <p className="max-w-[230px] text-sm leading-6 text-[#a99594]">Uma seleção visual do universo Gente Bonita. <span className="text-[#d68c80]">Em atualização.</span></p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {GALLERY_ITEMS.map((item, index) => (
            <figure key={item.label} className={`group relative overflow-hidden ${index === 0 ? 'col-span-2 row-span-2 aspect-[.9] md:aspect-[.8]' : index === 1 ? 'col-span-2 aspect-[1.3] md:col-span-1 md:row-span-2 md:aspect-[.7]' : 'aspect-square'}`}>
              <img src={item.src} alt={item.alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080709]/80 via-transparent to-transparent opacity-80" />
              <figcaption className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-[.14em] text-[#f9eee7]"><span>{item.label}</span><ArrowUpRight size={14} /></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

type BookingForm = {
  name: string;
  whatsapp: string;
  services: string[];
  professional: string;
  date: string;
  time: string;
  observations: string;
};

function Booking({ selectedServices, onClearSelection }: { selectedServices: string[]; onClearSelection: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [serviceError, setServiceError] = useState(false);
  const [form, setForm] = useState<BookingForm>({ name: '', whatsapp: '', services: selectedServices, professional: '', date: '', time: '', observations: '' });

  function updateField(field: Exclude<keyof BookingForm, 'services'>, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }
  function toggleService(service: string) {
    setServiceError(false);
    setForm((current) => ({
      ...current,
      services: current.services.includes(service)
        ? current.services.filter((item) => item !== service)
        : [...current.services, service],
    }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.services.length === 0) {
      setServiceError(true);
      return;
    }
    setSubmitted(true);
  }
  if (submitted) {
    return (
      <section id="agendamento" className="scroll-mt-6 bg-[#d68c80] py-20 text-[#24161d] md:py-24">
        <div className="gb-shell">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#24161d]/35"><Check size={26} /></div>
            <p className="gb-eyebrow mt-8 text-[#6b3c3e]">Pedido recebido</p>
            <h2 className="gb-display mt-5 text-5xl leading-none md:text-7xl">Seu momento começa<br /><em>agora.</em></h2>
            <p className="mx-auto mt-7 max-w-md text-[15px] leading-7 text-[#4d2a2d]">Recebemos seu pedido de agendamento. Em breve, entraremos em contato pelo WhatsApp para confirmar os detalhes com todo o cuidado.</p>
            <button type="button" onClick={() => { setSubmitted(false); onClearSelection(); }} className="gb-button mt-9 border-[#754447] text-[#5b3032] hover:bg-[#754447] hover:text-[#f2d9d0]" data-testid="button-new-booking">Fazer novo pedido</button>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="agendamento" className="scroll-mt-6 bg-[#d68c80] py-20 text-[#24161d] md:py-24">
      <div className="gb-shell grid gap-10 md:grid-cols-[.8fr_1.2fr] md:gap-16">
        <div>
          <p className="gb-eyebrow text-[#3a1c20]">05 / Agendamento</p>
          <h2 className="gb-display mt-6 text-5xl leading-[.92] md:text-7xl">Vamos reservar<br /><em>um tempo<br />para você?</em></h2>
          <p className="mt-6 max-w-sm text-sm font-medium leading-6 text-[#402125]">Preencha o formulário e conte um pouco do que você deseja. Este é um pedido de horário — a confirmação acontece depois, pelo WhatsApp.</p>
          <div className="mt-7 flex items-center gap-3 border-t border-[#24161d]/25 pt-5 text-xs font-semibold text-[#402125]"><Clock3 size={16} /><span>{CONTACTS.hours}</span></div>
        </div>
        <form onSubmit={submit} className="grid gap-5" data-testid="form-booking">
          <div className="grid gap-5 sm:grid-cols-2">
            <label><span className="gb-input-label text-[#3a1c20]">Seu nome</span><input required value={form.name} onChange={(event) => updateField('name', event.target.value)} className="gb-field text-[#f9eee7] placeholder:text-[#ead4cc]" placeholder="Como podemos chamar você?" data-testid="input-booking-name" /></label>
            <label><span className="gb-input-label text-[#3a1c20]">WhatsApp</span><input required value={form.whatsapp} onChange={(event) => updateField('whatsapp', event.target.value)} className="gb-field text-[#f9eee7] placeholder:text-[#ead4cc]" placeholder="(00) 00000-0000" data-testid="input-booking-whatsapp" /></label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <span className="gb-input-label text-[#3a1c20]">Serviços desejados <span className="normal-case tracking-normal text-[#713e42]">· escolha quantos quiser</span></span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Serviços desejados">
                {SERVICES.map((service) => {
                  const selected = form.services.includes(service.title);
                  return (
                    <label key={service.id} className={`gb-service-choice ${selected ? 'gb-service-choice-selected' : ''}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleService(service.title)} className="sr-only" data-testid={`checkbox-booking-service-${service.id}`} />
                      <span>{service.title}</span>
                      {selected && <Check size={14} />}
                    </label>
                  );
                })}
              </div>
              {serviceError && <p className="mt-2 text-xs text-[#713e42]" role="alert">Escolha pelo menos um serviço para continuar.</p>}
            </div>
            <label><span className="gb-input-label text-[#3a1c20]">Profissional (opcional)</span><select value={form.professional} onChange={(event) => updateField('professional', event.target.value)} className="gb-field text-[#f9eee7]" data-testid="select-booking-professional"><option value="">Escolha uma opção</option>{PROFESSIONALS.map((professional) => <option key={professional} value={professional}>{professional}</option>)}</select></label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label><span className="gb-input-label text-[#3a1c20]">Data desejada</span><input required type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} className="gb-field text-[#f9eee7]" data-testid="input-booking-date" /></label>
            <label><span className="gb-input-label text-[#3a1c20]">Horário desejado</span><input required type="time" value={form.time} onChange={(event) => updateField('time', event.target.value)} className="gb-field text-[#f9eee7]" data-testid="input-booking-time" /></label>
          </div>
          <label><span className="gb-input-label text-[#3a1c20]">Observações</span><textarea value={form.observations} onChange={(event) => updateField('observations', event.target.value)} className="gb-field min-h-[110px] resize-y text-[#f9eee7] placeholder:text-[#ead4cc]" placeholder="Tem algo que gostaria de nos contar?" data-testid="textarea-booking-observations" /></label>
          <button type="submit" className="gb-button mt-2 w-full border-[#080709] bg-[#080709] text-[#f2d9d0] hover:bg-[#45272e] sm:w-fit" data-testid="button-submit-booking">Enviar pedido de agendamento <ArrowUpRight size={16} /></button>
        </form>
      </div>
    </section>
  );
}

function InstagramCta() {
  return (
    <section id="instagram" className="scroll-mt-6 bg-[#080709] py-20 md:py-24">
      <div className="gb-shell relative overflow-hidden border border-[#f9eee7]/15 px-7 py-14 md:px-16 md:py-20">
        <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border border-[#d68c80]/20 md:h-96 md:w-96" />
        <div className="absolute -right-2 -top-16 h-56 w-56 rounded-full border border-[#d68c80]/15 md:h-80 md:w-80" />
        <div className="relative max-w-2xl">
          <p className="gb-eyebrow">06 / Siga o gesto</p>
          <h2 className="gb-display mt-5 text-5xl leading-[.95] text-[#f9eee7] md:text-7xl">Mais beleza<br /><em className="text-[#df9587]">por perto.</em></h2>
          <p className="mt-7 max-w-md text-sm leading-6 text-[#b9a4a0]">O universo Gente Bonita, os detalhes do atelier e inspirações para o seu próximo momento.</p>
          <a href={CONTACTS.instagramUrl} target="_blank" rel="noreferrer" className="gb-button gb-button-ghost mt-9" data-testid="link-instagram"><Instagram size={16} /> {CONTACTS.instagramHandle}</a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#050506] pb-10 pt-16">
      <div className="gb-shell">
        <div className="grid gap-12 border-b border-[#f9eee7]/10 pb-14 md:grid-cols-[1.3fr_1fr_1fr]">
          <div><BrandMark /><p className="mt-7 max-w-xs text-sm leading-6 text-[#a99594]">Um atelier de beleza para você se sentir cuidada, confiante e extraordinária.</p></div>
          <div>
            <p className="gb-eyebrow mb-5">Visite</p>
            <a href={CONTACTS.mapsUrl} target="_blank" rel="noreferrer" className="block text-sm leading-6 text-[#b9a4a0] transition-colors hover:text-[#df9587]" data-testid="link-footer-address">{CONTACTS.address}</a>
            <div className="mt-6 border-t border-[#f9eee7]/10 pt-5">
              <p className="gb-eyebrow mb-4">Horários</p>
              <div className="grid gap-2 text-xs text-[#b9a4a0]">
                {OPENING_HOURS.map((item) => (
                  <div key={item.day} className="flex justify-between gap-4">
                    <span>{item.day}</span>
                    <span className={item.hours === 'Fechada' ? 'text-[#776b70]' : 'text-[#df9587]'}>{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div><p className="gb-eyebrow mb-5">Converse</p><a href={`https://wa.me/${CONTACTS.whatsappNumber}`} target="_blank" rel="noreferrer" className="block text-sm text-[#b9a4a0] transition-colors hover:text-[#df9587]" data-testid="link-footer-whatsapp">{CONTACTS.whatsappLabel}</a><a href={CONTACTS.instagramUrl} target="_blank" rel="noreferrer" className="mt-3 block text-sm text-[#b9a4a0] transition-colors hover:text-[#df9587]" data-testid="link-footer-instagram">{CONTACTS.instagramHandle}</a></div>
        </div>
        <div className="flex flex-col justify-between gap-4 pt-7 text-[10px] uppercase tracking-[.12em] text-[#786a70] md:flex-row"><span>© {new Date().getFullYear()} Gente Bonita</span><span>Beleza com presença.</span></div>
      </div>
    </footer>
  );
}

function Home() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  function selectService(service: string) {
    setSelectedServices((current) => current.includes(service) ? current : [...current, service]);
    document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', '#agendamento');
  }
  return (
    <div className="site-noise min-h-[100dvh] overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Services onSelect={selectService} />
        <MegaHair onSelect={selectService} />
        <About />
        <Gallery />
        <Booking key={selectedServices.join('|')} selectedServices={selectedServices} onClearSelection={() => setSelectedServices([])} />
        <InstagramCta />
      </main>
      <a href={`https://wa.me/${CONTACTS.whatsappNumber}`} target="_blank" rel="noreferrer" className="gb-whatsapp gb-button" aria-label="Conversar pelo WhatsApp" data-testid="link-floating-whatsapp"><MessageCircle size={19} /><span>Falar no WhatsApp</span></a>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;