import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://umrratybfetmeiykxyee.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcnJhdHliZmV0bWVpeWt4eWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNzgwNDAsImV4cCI6MjEwNTg1NDA0MH0.64yeQKZw8GvAFFgMPAp6kwmFkdOx1qxUCFJTVai1hvI'
);

export type ServiceRow = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  duration: string;
  price: string;
  old_price: string | null;
  image_url: string | null;
  featured: boolean;
  sort_order: number;
};

export type HourRow = {
  id: string;
  day: string;
  hours: string;
  muted: boolean;
  sort_order: number;
};

export type SiteSettings = {
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  whatsapp_number: string;
  whatsapp_label: string;
  instagram_handle: string;
  instagram_url: string;
  footer_tagline: string;
};

export type SiteData = {
  services: ServiceRow[];
  hours: HourRow[];
  settings: SiteSettings;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  hero_title: 'A harmonia e a elegância de traços desenhados para você.',
  hero_subtitle: 'Realçamos sua beleza autêntica através da micropigmentação e estética facial de alto padrão, com resultados naturais e sofisticados.',
  hero_image_url: '',
  whatsapp_number: '5566984165461',
  whatsapp_label: '(66) 98416-5461',
  instagram_handle: '@daianegomesstudio',
  instagram_url: 'https://instagram.com/daianegomesstudio',
  footer_tagline: 'Micropigmentação e estética facial de alto padrão com exclusividade e sofisticação.',
};

export const DEFAULT_SERVICES: ServiceRow[] = [
  { id: 'microblading', title: 'Microblading fio a fio', subtitle: null, description: 'Micropigmentação de sobrancelhas com efeito fio a fio natural e realista.', duration: '~1h', price: 'R$ 380', old_price: null, image_url: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600&auto=format&fit=crop', featured: false, sort_order: 0 },
  { id: 'labial', title: 'Micropigmentação labial', subtitle: null, description: 'Realce de cor, contorno e beleza natural dos lábios com resultado duradouro.', duration: '~2h – 2h30', price: 'R$ 400', old_price: null, image_url: 'https://images.unsplash.com/photo-1588514981143-6c845b59740a?q=80&w=600&auto=format&fit=crop', featured: false, sort_order: 1 },
  { id: 'combo', title: 'Combo Especial', subtitle: 'Microblading + Labial', description: 'Os dois procedimentos em um único pacote. Economia de R$ 130,00 em relação ao valor separado.', duration: 'até 3h30', price: 'R$ 650', old_price: 'R$ 780', image_url: 'https://images.unsplash.com/photo-1512496015851-a1dc8a474665?q=80&w=600&auto=format&fit=crop', featured: true, sort_order: 2 },
  { id: 'limpeza', title: 'Limpeza de pele', subtitle: null, description: 'Limpeza facial profunda para uma pele saudável, purificada e iluminada.', duration: '~1h', price: 'R$ 200', old_price: null, image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop', featured: false, sort_order: 3 },
];

export const DEFAULT_HOURS: HourRow[] = [
  { id: '1', day: 'Segunda a Sexta', hours: '08h às 10h | 17h30 em diante', muted: false, sort_order: 0 },
  { id: '2', day: 'Intervalo (Seg–Sex)', hours: '13h–17h (reservado)', muted: true, sort_order: 1 },
  { id: '3', day: 'Sábado', hours: '07h às 15h30', muted: false, sort_order: 2 },
  { id: '4', day: 'Domingo', hours: 'Fechado', muted: true, sort_order: 3 },
];

export const DEFAULT_DATA: SiteData = {
  services: DEFAULT_SERVICES,
  hours: DEFAULT_HOURS,
  settings: DEFAULT_SETTINGS,
};

export async function loadSiteData(): Promise<SiteData> {
  try {
    const [svcRes, hrRes, stRes] = await Promise.all([
      supabase.from('services').select('*').order('sort_order'),
      supabase.from('opening_hours').select('*').order('sort_order'),
      supabase.from('site_settings').select('*'),
    ]);

    const services = svcRes.data && svcRes.data.length > 0 ? (svcRes.data as ServiceRow[]) : DEFAULT_SERVICES;
    const hours = hrRes.data && hrRes.data.length > 0 ? (hrRes.data as HourRow[]) : DEFAULT_HOURS;

    let settings = { ...DEFAULT_SETTINGS };
    if (stRes.data && stRes.data.length > 0) {
      for (const row of stRes.data as { key: string; value: string }[]) {
        (settings as Record<string, string>)[row.key] = row.value;
      }
    }

    return { services, hours, settings };
  } catch {
    return DEFAULT_DATA;
  }
}

export async function uploadMediaFile(file: File, path: string): Promise<string> {
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteMediaFile(path: string): Promise<void> {
  await supabase.storage.from('media').remove([path]);
}
