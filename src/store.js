// MythCaos · armazenamento (versão SITE PUBLICADO → Supabase)
// O artifact do claude.ai usa outra versão deste arquivo; o resto do código é igual nos dois.
window.MC_TEST_RESET = false; // true = esquece o contato salvo a cada carregamento (só para testes)
window.MC_STORE = (async () => {
  const SUPABASE_URL = 'https://hqpletnbkucuarkdixug.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Oe6C4mX9K7_fK0XLkqXI1A_4dv6z1Q8'; // chave pública; a segurança é o RLS
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  let uid = (await sb.auth.getSession()).data.session?.user?.id || null;
  // login anônimo só quando a pessoa grava algo (não cria usuário para cada visita)
  const ensure = async () => {
    if (uid) return uid;
    const r = await sb.auth.signInAnonymously(); if (r.error) throw r.error;
    return (uid = r.data.user.id);
  };
  const ok = r => { if (r.error) throw r.error; return r.data };
  const clean = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ''));
  return {
    get uid() { return uid },
    saveLead: async d => { const id = await ensure();
      ok(await sb.from('leads').upsert(clean({ user_id: id, nome: d.nome, email: d.email, tel: d.tel, mesa: d.mesa, catarse: d.catarse, origem: d.origem }))) },
    mesa: async () => ok(await sb.rpc('mesa_count')) || 0,
    myLead: async () => uid ? ok(await sb.from('leads').select('nome,email,tel').eq('user_id', uid).maybeSingle()) : null,
    myScore: async () => uid ? ok(await sb.from('puzzle').select('nome,t,total,moves').eq('user_id', uid).maybeSingle()) : null,
    saveScore: async d => { const id = await ensure();
      ok(await sb.from('puzzle').upsert({ user_id: id, nome: d.nome, t: d.t, total: d.total, moves: d.moves })) },
    scores: async () => (ok(await sb.from('puzzle').select('user_id,nome,t,total,moves').order('total').limit(200)) || []).map(x => ({ ...x, _id: x.user_id })),
  };
})().catch(e => { console.warn('MythCaos store', e); return null });
