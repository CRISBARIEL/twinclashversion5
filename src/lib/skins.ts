export interface Skin {
  id: string;
  name: string;
  price: number;
  cardBackColor: string;
  cardBorderColor: string;
  description: string;
}

export const SKINS: Skin[] = [
  {
    id: 'default',
    name: 'Clásico',
    price: 0,
    cardBackColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
    cardBorderColor: 'border-blue-300',
    description: 'El diseño original',
  },
  {
    id: 'gold',
    name: 'Dorado',
    price: 100,
    cardBackColor: 'bg-gradient-to-br from-yellow-400 to-amber-600',
    cardBorderColor: 'border-yellow-300',
    description: 'Lujo y elegancia',
  },
  {
    id: 'emerald',
    name: 'Esmeralda',
    price: 150,
    cardBackColor: 'bg-gradient-to-br from-green-400 to-emerald-600',
    cardBorderColor: 'border-green-300',
    description: 'Naturaleza y frescura',
  },
  {
    id: 'ruby',
    name: 'Rubí',
    price: 180,
    cardBackColor: 'bg-gradient-to-br from-red-400 to-rose-600',
    cardBorderColor: 'border-red-300',
    description: 'Pasión y energía',
  },
  {
    id: 'midnight',
    name: 'Medianoche',
    price: 220,
    cardBackColor: 'bg-gradient-to-br from-indigo-600 to-purple-800',
    cardBorderColor: 'border-indigo-400',
    description: 'Misterio nocturno',
  },
];

export function getSkinById(id: string): Skin | undefined {
  return SKINS.find((s) => s.id === id);
}

export function getDefaultSkin(): Skin {
  return SKINS[0];
}

import { supabase } from './supabase';
import { getOrCreateClientId } from './supabase';

interface UserThemes {
  owned_themes: string[];
  equipped_theme: string;
}

export async function getUserThemes(): Promise<UserThemes> {
  const clientId = getOrCreateClientId();

  const { data, error } = await supabase
    .from('user_themes')
    .select('owned_themes, equipped_theme')
    .eq('client_id', clientId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching themes:', error);
    return { owned_themes: ['default'], equipped_theme: 'default' };
  }

  if (!data) {
    const { data: newData, error: insertError } = await supabase
      .from('user_themes')
      .upsert({
        client_id: clientId,
        owned_themes: ['default'],
        equipped_theme: 'default',
      }, {
        onConflict: 'client_id'
      })
      .select('owned_themes, equipped_theme')
      .maybeSingle();

    if (insertError) {
      console.error('Error upserting themes:', insertError);
    }

    return newData || { owned_themes: ['default'], equipped_theme: 'default' };
  }

  return data;
}

export async function ownTheme(themeId: string): Promise<boolean> {
  const clientId = getOrCreateClientId();
  const themes = await getUserThemes();

  if (themes.owned_themes.includes(themeId)) {
    return true;
  }

  const newOwned = [...themes.owned_themes, themeId];

  const { error } = await supabase
    .from('user_themes')
    .upsert({
      client_id: clientId,
      owned_themes: newOwned,
      equipped_theme: themes.equipped_theme,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'client_id'
    });

  if (error) {
    console.error('Error owning theme:', error);
    return false;
  }

  return true;
}

export async function equipTheme(themeId: string): Promise<boolean> {
  const clientId = getOrCreateClientId();
  const themes = await getUserThemes();

  if (!themes.owned_themes.includes(themeId)) {
    console.error('Cannot equip unowned theme');
    return false;
  }

  const { error } = await supabase
    .from('user_themes')
    .update({
      equipped_theme: themeId,
      updated_at: new Date().toISOString(),
    })
    .eq('client_id', clientId);

  if (error) {
    console.error('Error equipping theme:', error);
    return false;
  }

  return true;
}

export async function hasTheme(themeId: string): Promise<boolean> {
  const themes = await getUserThemes();
  return themes.owned_themes.includes(themeId);
}

export async function getOwnedCount(): Promise<number> {
  const themes = await getUserThemes();
  return themes.owned_themes.length;
}

export async function getEquippedTheme(): Promise<string> {
  const themes = await getUserThemes();
  return themes.equipped_theme || 'default';
}
