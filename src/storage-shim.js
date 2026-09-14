// Recreates the window.storage API that the app was originally built against
// (the one available inside Claude.ai Artifacts), backed by:
//   - shared = true  -> a Supabase table (visible/editable by everyone using the app)
//   - shared = false -> this browser's localStorage ("personal" data, e.g. the
//                        display name someone picked for themselves)
//
// This file must be imported BEFORE the App component runs (see main.jsx),
// since App reads window.storage as soon as it mounts.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    'Thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Tạo file .env (xem .env.example) rồi khởi động lại.'
  );
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

const LOCAL_PREFIX = 'personal:';

function localGet(key) {
  const raw = window.localStorage.getItem(LOCAL_PREFIX + key);
  if (raw === null) throw new Error(`Local key not found: ${key}`);
  return { key, value: raw, shared: false };
}

function localSet(key, value) {
  window.localStorage.setItem(LOCAL_PREFIX + key, value);
  return { key, value, shared: false };
}

function localDelete(key) {
  const existed = window.localStorage.getItem(LOCAL_PREFIX + key) !== null;
  window.localStorage.removeItem(LOCAL_PREFIX + key);
  return { key, deleted: existed, shared: false };
}

function localList(prefix) {
  const keys = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(LOCAL_PREFIX)) {
      const bare = k.slice(LOCAL_PREFIX.length);
      if (!prefix || bare.startsWith(prefix)) keys.push(bare);
    }
  }
  return { keys, prefix, shared: false };
}

window.storage = {
  async get(key, shared = false) {
    if (!shared) return localGet(key);
    const { data, error } = await supabase
      .from('kv_store')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Shared key not found: ${key}`);
    return { key, value: JSON.stringify(data.value), shared: true };
  },

  async set(key, value, shared = false) {
    if (!shared) return localSet(key, value);
    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      parsed = value;
    }
    const { error } = await supabase
      .from('kv_store')
      .upsert({ key, value: parsed, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw error;
    return { key, value, shared: true };
  },

  async delete(key, shared = false) {
    if (!shared) return localDelete(key);
    const { error } = await supabase.from('kv_store').delete().eq('key', key);
    if (error) throw error;
    return { key, deleted: true, shared: true };
  },

  async list(prefix = '', shared = false) {
    if (!shared) return localList(prefix);
    let query = supabase.from('kv_store').select('key');
    if (prefix) query = query.like('key', `${prefix}%`);
    const { data, error } = await query;
    if (error) throw error;
    return { keys: (data || []).map((row) => row.key), prefix, shared: true };
  },
};
