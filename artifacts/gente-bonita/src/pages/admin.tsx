import { useState, useEffect, useRef, type FormEvent } from 'react';
import { supabase, type ServiceRow, type HourRow, type SiteSettings, uploadMediaFile, deleteMediaFile } from '@/lib/supabase';
import { ArrowLeft, Save, Plus, Trash2, Upload, X, Eye, EyeOff, LogOut, Image as ImageIcon, Clock, Phone, Layers, Star } from 'lucide-react';

// ── Credentials ───────────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'daiane@daianegomesstudio.com';

// ── Helpers ───────────────────────────────────────────────────────────────────
const GOLD = 'hsl(43 74% 50%)';
const GOLD_DIM = 'hsl(43 74% 55% / .15)';
const DARK_CARD = 'hsl(0 0% 10%)';
const DARK_BORDER = 'hsl(0 0% 18%)';

function AdminInput({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa' }}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', background: 'hsl(0 0% 8%)', border: `1px solid ${DARK_BORDER}`, borderRadius: 6, color: '#f5f0ea', padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => (e.target.style.borderColor = GOLD)}
        onBlur={e => (e.target.style.borderColor = DARK_BORDER)}
      />
    </div>
  );
}

function AdminTextarea({ label, value, onChange, rows = 3, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa' }}>{label}</label>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', background: 'hsl(0 0% 8%)', border: `1px solid ${DARK_BORDER}`, borderRadius: 6, color: '#f5f0ea', padding: '10px 14px', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
        onFocus={e => (e.target.style.borderColor = GOLD)}
        onBlur={e => (e.target.style.borderColor = DARK_BORDER)}
      />
    </div>
  );
}

function SaveBtn({ onClick, saving, label = 'Salvar alterações' }: { onClick: () => void; saving: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: saving ? 'hsl(0 0% 18%)' : GOLD, color: '#fff', border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', transition: 'all .2s' }}
    >
      <Save size={14} /> {saving ? 'Salvando...' : label}
    </button>
  );
}

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999, padding: '14px 22px', borderRadius: 8, background: type === 'ok' ? '#16a34a' : '#dc2626', color: '#fff', fontWeight: 600, fontSize: 14, boxShadow: '0 8px 30px rgba(0,0,0,.4)', maxWidth: 360 }}>
      {msg}
    </div>
  );
}

// ── Hero Tab ──────────────────────────────────────────────────────────────────
function HeroTab({ settings, onRefresh }: { settings: SiteSettings; onRefresh: () => void }) {
  const [title, setTitle] = useState(settings.hero_title);
  const [subtitle, setSubtitle] = useState(settings.hero_subtitle);
  const [imageUrl, setImageUrl] = useState(settings.hero_image_url);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) { showToast('Formato inválido. Use PNG, JPG ou WebP.', 'err'); return; }
    setUploading(true);
    try {
      const url = await uploadMediaFile(file, `hero/main.${ext}`);
      setImageUrl(url);
      showToast('Imagem enviada! Clique em Salvar para confirmar.', 'ok');
    } catch (err: unknown) {
      showToast(`Erro no upload: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'err');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!imageUrl) return;
    if (!confirm('Remover a imagem da hero?')) return;
    try {
      // Extract storage path from URL
      const match = imageUrl.match(/\/object\/public\/media\/(.+)/);
      if (match) await deleteMediaFile(match[1]);
      setImageUrl('');
      showToast('Imagem removida. Clique em Salvar.', 'ok');
    } catch {
      showToast('Erro ao remover imagem.', 'err');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from('site_settings').upsert([
        { key: 'hero_title', value: title },
        { key: 'hero_subtitle', value: subtitle },
        { key: 'hero_image_url', value: imageUrl },
      ]);
      onRefresh();
      showToast('Hero atualizada com sucesso!', 'ok');
    } catch {
      showToast('Erro ao salvar. Tente novamente.', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <h2 style={{ color: '#f5f0ea', fontSize: 22, fontFamily: 'Georgia, serif', margin: 0 }}>Seção Hero</h2>

      <AdminTextarea label="Título principal (H1)" value={title} onChange={setTitle} rows={3} />
      <AdminTextarea label="Subtítulo" value={subtitle} onChange={setSubtitle} rows={3} />

      {/* Image upload */}
      <div>
        <label style={{ display: 'block', marginBottom: 12, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa' }}>Foto da Hero</label>

        {imageUrl ? (
          <div style={{ position: 'relative', marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: `1px solid ${DARK_BORDER}`, maxWidth: 420 }}>
            <img src={imageUrl} alt="Hero atual" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
            <button
              onClick={handleRemove}
              style={{ position: 'absolute', top: 10, right: 10, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ><X size={16} /></button>
          </div>
        ) : (
          <div
            style={{ width: '100%', maxWidth: 420, height: 180, border: `2px dashed ${DARK_BORDER}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', color: '#555', marginBottom: 16, transition: 'border-color .2s' }}
            onClick={() => fileRef.current?.click()}
            onMouseEnter={e => (e.currentTarget.style.borderColor = GOLD)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = DARK_BORDER)}
          >
            <ImageIcon size={36} />
            <span style={{ fontSize: 13 }}>Nenhuma imagem. Clique para enviar.</span>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleUpload} />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'transparent', border: `1px solid ${DARK_BORDER}`, borderRadius: 6, color: '#f5f0ea', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          <Upload size={14} /> {uploading ? 'Enviando...' : imageUrl ? 'Trocar imagem' : 'Enviar imagem (PNG ou JPG)'}
        </button>
        <p style={{ marginTop: 8, fontSize: 12, color: '#555' }}>Qualquer dispositivo · PNG, JPG ou WebP · A imagem antiga é removida automaticamente.</p>
      </div>

      <div><SaveBtn onClick={handleSave} saving={saving} /></div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// ── Services Tab ──────────────────────────────────────────────────────────────
type EditableService = ServiceRow & { _dirty?: boolean };

function ServicesTab({ initialServices, onRefresh }: { initialServices: ServiceRow[]; onRefresh: () => void }) {
  const [services, setServices] = useState<EditableService[]>(initialServices);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const update = (id: string, field: keyof ServiceRow, val: unknown) =>
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: val, _dirty: true } : s));

  const handleSave = async (svc: EditableService) => {
    setSaving(svc.id);
    try {
      const { _dirty, ...row } = svc;
      void _dirty;
      const isNew = !initialServices.find(s => s.id === svc.id);
      if (isNew) {
        await supabase.from('services').insert(row);
      } else {
        await supabase.from('services').upsert(row);
      }
      onRefresh();
      showToast('Serviço salvo!', 'ok');
    } catch { showToast('Erro ao salvar.', 'err'); }
    finally { setSaving(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este serviço permanentemente?')) return;
    await supabase.from('services').delete().eq('id', id);
    setServices(prev => prev.filter(s => s.id !== id));
    onRefresh();
    showToast('Serviço excluído.', 'ok');
  };

  const handleAdd = () => {
    const newSvc: EditableService = {
      id: crypto.randomUUID(), title: 'Novo Serviço', subtitle: null, description: '',
      duration: '', price: 'R$ 0', old_price: null, image_url: null,
      featured: false, sort_order: services.length, _dirty: true,
    };
    setServices(prev => [...prev, newSvc]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ color: '#f5f0ea', fontSize: 22, fontFamily: 'Georgia, serif', margin: 0 }}>Serviços</h2>
        <button onClick={handleAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: GOLD, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          <Plus size={14} /> Novo Serviço
        </button>
      </div>

      {services.map(svc => (
        <div key={svc.id} style={{ background: DARK_CARD, border: `1px solid ${svc._dirty ? 'hsl(43 74% 45% / .5)' : DARK_BORDER}`, borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ color: GOLD, fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 600 }}>{svc.title || 'Novo Serviço'}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#aaa', fontSize: 12, fontWeight: 600 }}>
                <input type="checkbox" checked={svc.featured} onChange={e => update(svc.id, 'featured', e.target.checked)} />
                <Star size={12} /> Destaque
              </label>
              <button onClick={() => handleDelete(svc.id)} style={{ background: 'transparent', border: `1px solid hsl(0 84% 60% / .4)`, color: '#f87171', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                <Trash2 size={13} /> Excluir
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <AdminInput label="Título" value={svc.title} onChange={v => update(svc.id, 'title', v)} />
            <AdminInput label="Subtítulo (opcional)" value={svc.subtitle ?? ''} onChange={v => update(svc.id, 'subtitle', v || null)} />
          </div>
          <AdminTextarea label="Descrição" value={svc.description} onChange={v => update(svc.id, 'description', v)} rows={2} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <AdminInput label="Preço" value={svc.price} onChange={v => update(svc.id, 'price', v)} placeholder="R$ 380" />
            <AdminInput label="Preço antigo (opcional)" value={svc.old_price ?? ''} onChange={v => update(svc.id, 'old_price', v || null)} placeholder="R$ 500" />
            <AdminInput label="Duração" value={svc.duration} onChange={v => update(svc.id, 'duration', v)} placeholder="~1h" />
          </div>
          <AdminInput label="URL da imagem" value={svc.image_url ?? ''} onChange={v => update(svc.id, 'image_url', v || null)} placeholder="https://..." />

          <div><SaveBtn onClick={() => handleSave(svc)} saving={saving === svc.id} label="Salvar este serviço" /></div>
        </div>
      ))}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// ── Hours Tab ─────────────────────────────────────────────────────────────────
type EditableHour = HourRow & { _dirty?: boolean };

function HoursTab({ initialHours, onRefresh }: { initialHours: HourRow[]; onRefresh: () => void }) {
  const [hours, setHours] = useState<EditableHour[]>(initialHours);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const update = (id: string, field: keyof HourRow, val: unknown) =>
    setHours(prev => prev.map(h => h.id === id ? { ...h, [field]: val, _dirty: true } : h));

  const handleAdd = () => {
    setHours(prev => [...prev, { id: crypto.randomUUID(), day: 'Novo Dia', hours: '', muted: false, sort_order: prev.length, _dirty: true }]);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remover esta linha de horário?')) return;
    setHours(prev => prev.filter(h => h.id !== id));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Delete all and re-insert for simplicity
      await supabase.from('opening_hours').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const rows = hours.map(({ _dirty, ...h }) => { void _dirty; return h; });
      await supabase.from('opening_hours').insert(rows);
      onRefresh();
      showToast('Horários salvos com sucesso!', 'ok');
    } catch { showToast('Erro ao salvar horários.', 'err'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#f5f0ea', fontSize: 22, fontFamily: 'Georgia, serif', margin: 0 }}>Horários de Atendimento</h2>
        <button onClick={handleAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: GOLD, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          <Plus size={14} /> Adicionar linha
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {hours.map(h => (
          <div key={h.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 10, alignItems: 'center', background: DARK_CARD, border: `1px solid ${h._dirty ? 'hsl(43 74% 45% / .4)' : DARK_BORDER}`, borderRadius: 8, padding: '14px 16px' }}>
            <input
              value={h.day} onChange={e => update(h.id, 'day', e.target.value)}
              placeholder="Ex: Segunda a Sexta"
              style={{ background: 'hsl(0 0% 8%)', border: `1px solid ${DARK_BORDER}`, borderRadius: 6, color: '#f5f0ea', padding: '9px 12px', fontSize: 13, outline: 'none' }}
            />
            <input
              value={h.hours} onChange={e => update(h.id, 'hours', e.target.value)}
              placeholder="Ex: 08h às 18h"
              style={{ background: 'hsl(0 0% 8%)', border: `1px solid ${DARK_BORDER}`, borderRadius: 6, color: '#f5f0ea', padding: '9px 12px', fontSize: 13, outline: 'none' }}
            />
            <label title="Marcar como fechado/reservado" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', whiteSpace: 'nowrap', color: h.muted ? '#f87171' : '#aaa', fontSize: 12, fontWeight: 600 }}>
              <input type="checkbox" checked={h.muted} onChange={e => update(h.id, 'muted', e.target.checked)} />
              {h.muted ? 'Fechado' : 'Aberto'}
            </label>
            <button onClick={() => handleDelete(h.id)} title="Remover linha" style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div><SaveBtn onClick={handleSaveAll} saving={saving} label="Salvar todos os horários" /></div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// ── Contact Tab ───────────────────────────────────────────────────────────────
function ContactTab({ settings, onRefresh }: { settings: SiteSettings; onRefresh: () => void }) {
  const [wa, setWa] = useState(settings.whatsapp_number);
  const [waLabel, setWaLabel] = useState(settings.whatsapp_label);
  const [igHandle, setIgHandle] = useState(settings.instagram_handle);
  const [igUrl, setIgUrl] = useState(settings.instagram_url);
  const [tagline, setTagline] = useState(settings.footer_tagline);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from('site_settings').upsert([
        { key: 'whatsapp_number', value: wa },
        { key: 'whatsapp_label', value: waLabel },
        { key: 'instagram_handle', value: igHandle },
        { key: 'instagram_url', value: igUrl },
        { key: 'footer_tagline', value: tagline },
      ]);
      onRefresh();
      showToast('Contato e rodapé salvos!', 'ok');
    } catch { showToast('Erro ao salvar.', 'err'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ color: '#f5f0ea', fontSize: 22, fontFamily: 'Georgia, serif', margin: 0 }}>Contato & Rodapé</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <AdminInput label="Número WhatsApp (com DDI)" value={wa} onChange={setWa} placeholder="5566984165461" />
        <AdminInput label="Exibição do número" value={waLabel} onChange={setWaLabel} placeholder="(66) 98416-5461" />
        <AdminInput label="Instagram @handle" value={igHandle} onChange={setIgHandle} placeholder="@daianegomesstudio" />
        <AdminInput label="URL do Instagram" value={igUrl} onChange={setIgUrl} placeholder="https://instagram.com/..." />
      </div>
      <AdminTextarea label="Texto do rodapé (tagline)" value={tagline} onChange={setTagline} rows={2} />
      <div><SaveBtn onClick={handleSave} saving={saving} /></div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
type Tab = 'hero' | 'services' | 'hours' | 'contact';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'hero', label: 'Hero', icon: <ImageIcon size={15} /> },
  { id: 'services', label: 'Serviços', icon: <Layers size={15} /> },
  { id: 'hours', label: 'Horários', icon: <Clock size={15} /> },
  { id: 'contact', label: 'Contato & Rodapé', icon: <Phone size={15} /> },
];

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [data, setData] = useState<{ services: ServiceRow[]; hours: HourRow[]; settings: SiteSettings } | null>(null);
  const [loadError, setLoadError] = useState('');

  const loadData = async () => {
    try {
      const [svcRes, hrRes, stRes] = await Promise.all([
        supabase.from('services').select('*').order('sort_order'),
        supabase.from('opening_hours').select('*').order('sort_order'),
        supabase.from('site_settings').select('*'),
      ]);
      const settings: SiteSettings = {
        hero_title: '', hero_subtitle: '', hero_image_url: '',
        whatsapp_number: '', whatsapp_label: '', instagram_handle: '',
        instagram_url: '', footer_tagline: '',
      };
      for (const row of (stRes.data ?? []) as { key: string; value: string }[]) {
        (settings as Record<string, string>)[row.key] = row.value;
      }
      setData({ services: (svcRes.data ?? []) as ServiceRow[], hours: (hrRes.data ?? []) as HourRow[], settings });
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(0 0% 5%)', color: '#f5f0ea', fontFamily: 'Manrope, sans-serif' }}>
      {/* Top bar */}
      <div style={{ background: 'hsl(0 0% 8%)', borderBottom: `1px solid ${DARK_BORDER}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: GOLD }}>DG</span>
          <span style={{ color: '#aaa', fontSize: 13, fontWeight: 600, letterSpacing: '.05em' }}>Painel Administrativo</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: `1px solid ${DARK_BORDER}`, padding: '7px 14px', borderRadius: 6 }}>
            <Eye size={13} /> Ver site
          </a>
          <button onClick={onLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: 12, fontWeight: 600, background: 'transparent', border: `1px solid ${DARK_BORDER}`, padding: '7px 14px', borderRadius: 6, cursor: 'pointer' }}>
            <LogOut size={13} /> Sair
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <nav style={{ width: 200, background: 'hsl(0 0% 7%)', borderRight: `1px solid ${DARK_BORDER}`, padding: '24px 0', flexShrink: 0 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: activeTab === t.id ? GOLD_DIM : 'transparent', borderLeft: `3px solid ${activeTab === t.id ? GOLD : 'transparent'}`, border: 'none', borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeftStyle: 'solid', borderLeftWidth: 3, borderLeftColor: activeTab === t.id ? GOLD : 'transparent', color: activeTab === t.id ? GOLD : '#888', cursor: 'pointer', fontSize: 13, fontWeight: 600, textAlign: 'left', transition: 'all .2s', fontFamily: 'Manrope, sans-serif' }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, padding: '36px 40px', maxWidth: 900, overflowY: 'auto' }}>
          {loadError && (
            <div style={{ background: 'hsl(0 84% 60% / .15)', border: '1px solid hsl(0 84% 60% / .4)', borderRadius: 8, padding: '14px 20px', marginBottom: 24, color: '#f87171', fontSize: 14 }}>
              ⚠️ {loadError} — Verifique se o script SQL foi executado no Supabase.
            </div>
          )}

          {!data ? (
            <div style={{ color: '#555', fontSize: 14 }}>Carregando dados...</div>
          ) : (
            <>
              {activeTab === 'hero'     && <HeroTab settings={data.settings} onRefresh={loadData} />}
              {activeTab === 'services' && <ServicesTab initialServices={data.services} onRefresh={loadData} />}
              {activeTab === 'hours'    && <HoursTab initialHours={data.hours} onRefresh={loadData} />}
              {activeTab === 'contact'  && <ContactTab settings={data.settings} onRefresh={loadData} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authErr } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    setLoading(false);
    if (authErr) { setError('Senha incorreta. Tente novamente.'); return; }
    onLogin();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(0 0% 5%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, sans-serif', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'hsl(0 0% 9%)', border: `1px solid hsl(43 74% 45% / .25)`, borderRadius: 16, padding: 40, boxShadow: `0 0 60px hsl(43 74% 45% / .06)` }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, border: `1px solid hsl(43 74% 45% / .5)`, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: GOLD }}>DG</span>
          </div>
          <h1 style={{ color: '#f5f0ea', fontFamily: 'Georgia, serif', fontSize: 24, margin: '0 0 6px', fontWeight: 600 }}>Área Administrativa</h1>
          <p style={{ color: '#555', fontSize: 13, margin: 0 }}>Daiane Gomes Studio</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* E-mail pré-preenchido (somente leitura) */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa' }}>E-mail</label>
            <input
              type="email"
              value={ADMIN_EMAIL}
              readOnly
              style={{ width: '100%', background: 'hsl(0 0% 6%)', border: `1px solid ${DARK_BORDER}`, borderRadius: 6, color: '#555', padding: '12px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', cursor: 'default' }}
            />
          </div>

          {/* Senha */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                required
                style={{ width: '100%', background: 'hsl(0 0% 8%)', border: `1px solid ${DARK_BORDER}`, borderRadius: 6, color: '#f5f0ea', padding: '12px 44px 12px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = GOLD)}
                onBlur={e => (e.target.style.borderColor = DARK_BORDER)}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: 13, margin: 0, background: 'hsl(0 84% 60% / .1)', padding: '10px 14px', borderRadius: 6, border: '1px solid hsl(0 84% 60% / .25)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? 'hsl(0 0% 18%)' : GOLD, color: '#fff', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 6, transition: 'background .2s' }}
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>

        <a href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, color: '#444', fontSize: 12, textDecoration: 'none' }}>
          <ArrowLeft size={12} /> Voltar ao site
        </a>
      </div>
    </div>
  );
}

// ── Admin Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(false);
  };

  if (session === null) return (
    <div style={{ minHeight: '100vh', background: 'hsl(0 0% 5%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'Manrope, sans-serif' }}>
      Verificando sessão...
    </div>
  );

  if (!session) return <LoginForm onLogin={() => setSession(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
}
