require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// -----------------------------------------------
// CONFIGURAÇÃO DO SUPABASE
// -----------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://chjqjxlkiqiuuwunyrup.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoanFqeGxraXFpdXV3dW55cnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDE2MTEsImV4cCI6MjEwMzc3NzYxMX0.bEul-DJ-3KDuFn0Hn8BLFHo6YI52d-p_mYTv80aorfY';

if (!process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️  SUPABASE_ANON_KEY não definida. Usando valor embutido (mude para variável de ambiente em produção).');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -----------------------------------------------
// INICIALIZAÇÃO DO BANCO
// -----------------------------------------------
async function initDb() {
  console.log('🔗 Conectando ao Supabase (multinivel-afiliados)...');

  const { data: existing, error } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (error) {
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('');
      console.error('╔══════════════════════════════════════════════════════════════╗');
      console.error('║  ERRO: Tabelas não encontradas no Supabase!                ║');
      console.error('║                                                            ║');
      console.error('║  Abra o painel do Supabase → SQL Editor e execute:         ║');
      console.error('║  O arquivo server/schema.sql do projeto.                   ║');
      console.error('╚══════════════════════════════════════════════════════════════╝');
      console.error('');
      throw new Error('Tabelas não encontradas. Execute server/schema.sql no Supabase SQL Editor.');
    }
    if (error.message.includes('row-level security')) {
      console.error('');
      console.error('╔══════════════════════════════════════════════════════════════╗');
      console.error('║  ERRO: Row-Level Security (RLS) está ativo!                ║');
      console.error('║                                                            ║');
      console.error('║  Abra o painel do Supabase → SQL Editor e execute:         ║');
      console.error('║  O arquivo server/schema.sql do projeto.                   ║');
      console.error('║  (Ele desabilita RLS e cria as tabelas necessárias)        ║');
      console.error('╚══════════════════════════════════════════════════════════════╝');
      console.error('');
      throw new Error('RLS ativo. Execute server/schema.sql no Supabase SQL Editor.');
    }
    throw new Error(`Erro ao conectar ao Supabase: ${error.message}`);
  }

  if (!existing || existing.length === 0) {
    console.log('🌱 Supabase vazio. Inserindo dados iniciais Epi...');
    await seedDatabase();
  } else {
    console.log(`ℹ️  Encontrados ${existing.length}+ registros na tabela users.`);
  }

  console.log('✅ Supabase conectado e pronto!');
}

async function seedDatabase() {
  const defaultPassword = await bcrypt.hash('123456', 10);

  const seeds = [
    { id: 1, name: 'Administrador Raiz', email: 'admin@sistema.com', password_hash: defaultPassword, referral_code: 'ADMIN100', sponsor_id: null, placement_id: null, position: null, role: 'admin', fee_refunded: true, current_cycle: 'Bronze', current_cycle_id: 1, registration_fee: 80 },
    { id: 2, name: 'Carlos Silva',       email: 'carlos@email.com',  password_hash: defaultPassword, referral_code: 'CARLOS10',  sponsor_id: 1, placement_id: 1, position: 1, role: 'user', fee_refunded: false, current_cycle: 'Bronze', current_cycle_id: 1, registration_fee: 80 },
    { id: 3, name: 'Ana Souza',          email: 'ana@email.com',     password_hash: defaultPassword, referral_code: 'ANA2026',   sponsor_id: 1, placement_id: 1, position: 2, role: 'user', fee_refunded: false, current_cycle: 'Bronze', current_cycle_id: 1, registration_fee: 80 },
    { id: 4, name: 'Beatriz Rocha',      email: 'beatriz@email.com', password_hash: defaultPassword, referral_code: 'BEA3000',   sponsor_id: 1, placement_id: 1, position: 3, role: 'user', fee_refunded: false, current_cycle: 'Bronze', current_cycle_id: 1, registration_fee: 80 },
    { id: 5, name: 'Bruno Lima',         email: 'bruno@email.com',   password_hash: defaultPassword, referral_code: 'BRUNO77',   sponsor_id: 1, placement_id: 2, position: 1, role: 'user', fee_refunded: false, current_cycle: 'Bronze', current_cycle_id: 1, registration_fee: 80 },
    { id: 6, name: 'Patricia Mendes',    email: 'patricia@email.com',password_hash: defaultPassword, referral_code: 'PATY99',    sponsor_id: 2, placement_id: 2, position: 2, role: 'user', fee_refunded: false, current_cycle: 'Bronze', current_cycle_id: 1, registration_fee: 80 },
    { id: 7, name: 'Fernanda Oliveira',  email: 'fernanda@email.com',password_hash: defaultPassword, referral_code: 'FERNANDA5', sponsor_id: 3, placement_id: 3, position: 1, role: 'user', fee_refunded: false, current_cycle: 'Bronze', current_cycle_id: 1, registration_fee: 80 },
  ];

  // Tentar inserir todos de uma vez (upsert)
  const { error: bulkError } = await supabase.from('users').upsert(seeds, { onConflict: 'id' });

  if (bulkError) {
    console.error('⚠️  Inserção em lote falhou:', bulkError.message);
    console.log('🔄 Tentando inserir usuários individualmente...');

    let inserted = 0;
    for (const seed of seeds) {
      const { error: individualError } = await supabase
        .from('users')
        .upsert([seed], { onConflict: 'id' });

      if (individualError) {
        console.error(`  ✗ ${seed.email}: ${individualError.message}`);
      } else {
        console.log(`  ✓ ${seed.email} inserido com sucesso.`);
        inserted++;
      }
    }

    console.log(`📊 Resultado: ${inserted}/${seeds.length} usuários inseridos.`);

    if (inserted === 0) {
      console.error('');
      console.error('╔══════════════════════════════════════════════════════════════╗');
      console.error('║  Nenhum usuário pôde ser inserido!                         ║');
      console.error('║                                                            ║');
      console.error('║  Possíveis causas:                                         ║');
      console.error('║  1. RLS (Row-Level Security) está ativo                    ║');
      console.error('║  2. Tabela "users" não existe                              ║');
      console.error('║                                                            ║');
      console.error('║  SOLUÇÃO: Abra o Supabase → SQL Editor e execute:          ║');
      console.error('║  O conteúdo do arquivo server/schema.sql                   ║');
      console.error('╚══════════════════════════════════════════════════════════════╝');
      console.error('');
    }
  } else {
    console.log('✅ Todos os 7 usuários demo inseridos com sucesso.');
  }
}

// -----------------------------------------------
// BUSCAR FILHOS POR POSIÇÃO (1=Esq, 2=Centro, 3=Dir)
// -----------------------------------------------
async function getChildAtPosition(parentId, pos) {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('placement_id', parentId)
    .eq('position', pos)
    .limit(1)
    .single();
  return data ? data.id : null;
}

// Conta quantos filhos diretos um nó tem (quantas das 3 pernas estão ocupadas)
async function countChildren(parentId) {
  const { data } = await supabase
    .from('users')
    .select('id, position')
    .eq('placement_id', parentId)
    .order('position', { ascending: true });
  return data || [];
}

// -----------------------------------------------
// DETERMINAR PRÓXIMA POSIÇÃO LIVRE DE UM NÓ
// -----------------------------------------------
async function nextFreePosition(parentId) {
  const children = await countChildren(parentId);
  const occupied = children.map(c => c.position);
  for (let pos = 1; pos <= 3; pos++) {
    if (!occupied.includes(pos)) return pos;
  }
  return null; // Nó cheio
}

// -----------------------------------------------
// ALGORITMO BFS COM POSIÇÃO EXATA (OTIMIZADO)
// Retorna { placementId, position }
// -----------------------------------------------
async function findAvailablePlacementNode(rootSponsorId, targetLeg = 'auto') {

  // ------ Perna específica ------
  if (targetLeg === 'left' || targetLeg === 'center' || targetLeg === 'right') {
    const legPos = targetLeg === 'left' ? 1 : targetLeg === 'center' ? 2 : 3;

    // Verificar se a perna direta está livre
    const occupant = await getChildAtPosition(rootSponsorId, legPos);

    if (occupant === null) {
      // Perna direta vazia → alocar aqui
      return { placementId: rootSponsorId, position: legPos };
    } else {
      // Perna já ocupada → descer na sub-árvore daquela perna (BFS auto)
      return findAvailablePlacementNode(occupant, 'auto');
    }
  }

  // ------ Auto (BFS otimizado com batch query) ------
  let currentLevel = [rootSponsorId];

  while (currentLevel.length > 0) {
    // Buscar TODOS os filhos do nível atual em UMA única query
    const { data: allChildren } = await supabase
      .from('users')
      .select('id, placement_id, position')
      .in('placement_id', currentLevel)
      .order('position', { ascending: true });

    // Indexar filhos por pai
    const childrenByParent = {};
    (allChildren || []).forEach(child => {
      if (!childrenByParent[child.placement_id]) {
        childrenByParent[child.placement_id] = [];
      }
      childrenByParent[child.placement_id].push(child);
    });

    // Verificar cada pai do nível atual
    for (const parentId of currentLevel) {
      const children = childrenByParent[parentId] || [];
      const occupied = children.map(c => c.position);

      for (let pos = 1; pos <= 3; pos++) {
        if (!occupied.includes(pos)) {
          return { placementId: parentId, position: pos };
        }
      }
    }

    // Todas as posições do nível atual ocupadas → descer para o próximo nível
    currentLevel = (allChildren || []).map(c => c.id);
  }

  return { placementId: rootSponsorId, position: 1 };
}

// -----------------------------------------------
// BUSCAR USUÁRIO POR CÓDIGO OU EMAIL
// -----------------------------------------------
async function findUserByIdentifier(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, referral_code, role, is_active, fee_refunded, current_cycle, sponsor_id, placement_id, position, password_hash, registration_fee, created_at')
      .or(`referral_code.ilike.${clean},email.ilike.${clean}`)
      .limit(1)
      .single();

    if (error || !data) return null;
    return { ...data, is_active: data.is_active !== false };
  } catch (err) {
    console.error('Erro em findUserByIdentifier:', err.message);
    return null;
  }
}

// -----------------------------------------------
// BUSCAR USUÁRIO POR EMAIL (LOGIN)
// -----------------------------------------------
async function findUserByEmail(email) {
  const clean = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', clean)
      .limit(1)
      .single();

    if (error || !data) return null;
    return { ...data, is_active: data.is_active !== false };
  } catch (err) {
    console.error('Erro em findUserByEmail:', err.message);
    return null;
  }
}


// -----------------------------------------------
// CRIAR USUÁRIO NA MATRIZ Epi (SUPABASE)
// Grava placement_id E position no Supabase
// -----------------------------------------------
async function createUserLspc({ name, email, passwordHash, referralCode, sponsorId, targetLeg = 'auto', phone, accountStatus = 'pending' }) {
  const { placementId, position } = await findAvailablePlacementNode(sponsorId, targetLeg);

  const legLabel = position === 1 ? 'Esquerda (Pos.1)' : position === 2 ? 'Centro (Pos.2)' : 'Direita (Pos.3)';
  console.log(`📍 Novo membro "${name}" → placement: #${placementId}, perna: ${legLabel}`);

  // Buscar ciclo Bronze como padrão
  const bronzeCycle = await getCycleById(1);
  const registrationFee = bronzeCycle ? bronzeCycle.price : 80.00;

  const { data, error } = await supabase
    .from('users')
    .insert([{
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      referral_code: referralCode.toUpperCase(),
      sponsor_id: sponsorId,
      placement_id: placementId,
      position: position,
      registration_fee: registrationFee,
      fee_refunded: false,
      current_cycle: bronzeCycle?.name || 'Bronze',
      current_cycle_id: 1,
      role: 'user',
      phone: phone || null,
      account_status: accountStatus
    }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar usuário: ${error.message}`);

  // Criar entrada no user_cycles para Bronze
  await supabase.from('user_cycles').insert([{
    user_id: data.id,
    cycle_id: 1,
    status: 'active'
  }]);

  // Registrar transação de compra do ciclo Bronze
  await supabase.from('transactions').insert([{
    user_id: data.id,
    type: 'cycle_purchase',
    amount: registrationFee,
    cycle_id: 1,
    to_user_id: data.id,
    description: `Compra do Ciclo Bronze — Socio Bronze`,
    status: 'completed'
  }]);

  // Comissão direta para o patrocinador (se existir)
  if (sponsorId && bronzeCycle && bronzeCycle.bonus_per_referral > 0) {
    await processDirectCommission(sponsorId, data.id, 1);
  }

  // Verificar se o PAI do placement completou 3 filhos → processar reembolso
  const children = await countChildren(placementId);
  if (children.length >= 3) {
    await processRefund(placementId);
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    referralCode: data.referral_code,
    sponsorId: data.sponsor_id,
    placementId: data.placement_id,
    position: data.position,
    legLabel
  };
}

// -----------------------------------------------
// OBTER MATRIZ Epi COM 3 CAMADAS (SUPABASE)
// -----------------------------------------------
async function getLspcMatrix(userId) {
  try {
    // Camada 1: Maestros (filhos diretos no placement_id) ordenados por position
    const { data: layer1, error: err1 } = await supabase
      .from('users')
      .select('id, name, email, referral_code, sponsor_id, placement_id, position, created_at, fee_refunded, current_cycle, document_photo_url')
      .eq('placement_id', userId)
      .order('position', { ascending: true });

    if (err1) {
      console.error('Erro ao buscar camada 1:', err1.message);
      return [];
    }
    if (!layer1 || layer1.length === 0) return [];

    const result = layer1.map(u => ({ ...u, layer: 1, is_spillover: u.sponsor_id !== userId }));

    // Camada 2: Líderes (filhos dos Maestros)
    const layer1Ids = layer1.map(u => u.id);
    const { data: layer2, error: err2 } = await supabase
      .from('users')
      .select('id, name, email, referral_code, sponsor_id, placement_id, position, created_at, fee_refunded, current_cycle, document_photo_url')
      .in('placement_id', layer1Ids)
      .order('position', { ascending: true });

    if (!err2 && layer2 && layer2.length > 0) {
      layer2.forEach(u => result.push({ ...u, layer: 2, is_spillover: !layer1Ids.includes(u.sponsor_id) }));

      // Camada 3: Ayudantes (filhos dos Líderes)
      const layer2Ids = layer2.map(u => u.id);
      const { data: layer3, error: err3 } = await supabase
        .from('users')
        .select('id, name, email, referral_code, sponsor_id, placement_id, position, created_at, fee_refunded, current_cycle, document_photo_url')
        .in('placement_id', layer2Ids)
        .order('position', { ascending: true });

      if (!err3 && layer3 && layer3.length > 0) {
        layer3.forEach(u => result.push({ ...u, layer: 3, is_spillover: !layer2Ids.includes(u.sponsor_id) }));
      }
    }

    return result;
  } catch (err) {
    console.error('Erro em getLspcMatrix:', err.message);
    return [];
  }
}

// -----------------------------------------------
// ESTRUTURA DE ÁRVORE HIERÁRQUICA
// -----------------------------------------------
async function getLspcTreeStructure(rootUserId) {
  const { data: rootUser, error } = await supabase
    .from('users')
    .select('id, name, email, referral_code, role, fee_refunded, current_cycle, sponsor_id, placement_id, position, document_photo_url')
    .eq('id', rootUserId)
    .single();

    if (error || !rootUser) {
      console.error('Erro ao buscar usuário raiz da árvore:', error ? error.message : 'Usuário não encontrado.');
      return null;
    }

  const matrixItems = await getLspcMatrix(rootUserId);

  const map = {
    [rootUser.id]: { ...rootUser, layer: 0, children: [] }
  };

  matrixItems.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });

  matrixItems.forEach(item => {
    if (map[item.placement_id]) {
      map[item.placement_id].children.push(map[item.id]);
    }
  });

  // Preencher sponsor_name e placement_name
  matrixItems.forEach(item => {
    if (item.sponsor_id && map[item.sponsor_id]) {
      map[item.id].sponsor_name = map[item.sponsor_id].name;
    }
    if (item.placement_id && map[item.placement_id]) {
      map[item.id].placement_name = map[item.placement_id].name;
    }
  });

  return map[rootUser.id];
}

// -----------------------------------------------
// TODOS OS USUÁRIOS COM ESTATÍSTICAS (ADMIN)
// -----------------------------------------------
async function getAllUsersWithLspcStats() {
  let users = null;
  let { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone, referral_code, role, is_active, sponsor_id, placement_id, position, registration_fee, fee_refunded, current_cycle, created_at')
    .order('id', { ascending: true });

  if (error) {
    // Tentar busca sem is_active caso a coluna ainda não exista na tabela do Supabase
    const fallback = await supabase
      .from('users')
      .select('id, name, email, phone, referral_code, role, sponsor_id, placement_id, position, registration_fee, fee_refunded, current_cycle, created_at')
      .order('id', { ascending: true });
    
    if (fallback.error) throw new Error(`Erro ao listar usuários: ${fallback.error.message}`);
    users = fallback.data;
  } else {
    users = data;
  }

  const userMap = {};
  users.forEach(u => { userMap[u.id] = u.name; });

  const result = await Promise.all(
    users.map(async (user) => {
      const matrix = await getLspcMatrix(user.id);
      const legName = user.position === 1 ? '👈 Esquerda' : user.position === 2 ? '🎯 Centro' : user.position === 3 ? '👉 Direita' : '—';
      return {
        ...user,
        is_active: user.is_active !== false,
        sponsor_name: user.sponsor_id ? (userMap[user.sponsor_id] || 'Nenhum') : 'Nenhum',
        placement_name: user.placement_id ? (userMap[user.placement_id] || 'Nenhum') : 'Nenhum',
        leg_label: legName,
        maestros_count: matrix.filter(m => m.layer === 1).length,
        lideres_count: matrix.filter(m => m.layer === 2).length,
        ayudantes_count: matrix.filter(m => m.layer === 3).length,
        total_matrix: matrix.length
      };
    })
  );

  return result;
}

// -----------------------------------------------
// ATUALIZAR ROLE (ADMIN / USER)
// -----------------------------------------------
async function updateUserRole(userId, newRole) {
  const { data, error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar perfil do usuário: ${error.message}`);
  return data;
}

// -----------------------------------------------
// ATUALIZAR SENHA DO USUÁRIO
// -----------------------------------------------
async function updateUserPassword(userId, passwordHash) {
  const { data, error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar senha do usuário: ${error.message}`);
  return data;
}

// -----------------------------------------------
// ATUALIZAR STATUS DE ATIVAÇÃO MENSAL
// -----------------------------------------------
async function setUserActiveStatus(userId, isActive) {
  const { data, error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar status de ativação: ${error.message}`);
  return data;
}

// -----------------------------------------------
// ALGORITMO DE COMPRESSÃO DINÂMICA
// Encontra o próximo patrocinador/linha ascendente ATIVO
// -----------------------------------------------
async function findActiveUpline(userId) {
  let currentId = userId;
  while (currentId) {
    const { data: user } = await supabase
      .from('users')
      .select('id, sponsor_id, is_active')
      .eq('id', currentId)
      .single();

    if (!user) break;
    if (user.id !== userId && user.is_active !== false) {
      return user.id; // Retorna o primeiro upline ativo
    }
    currentId = user.sponsor_id;
  }
  return 1; // Fallback para Admin Raiz
}

// -----------------------------------------------
// OBTER CARTEIRA DIGITAL DO USUÁRIO (WALLET)
// -----------------------------------------------
async function getUserWallet(userId) {
  let { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!wallet) {
    const { data: user } = await supabase
      .from('users')
      .select('id, fee_refunded, role, current_cycle_id')
      .eq('id', userId)
      .single();

    let initialBalance = 0;
    if (user && user.fee_refunded) {
      const cycle = await getCycleById(user.current_cycle_id || 1);
      initialBalance = cycle ? cycle.refund_amount : 60.00;
    } else if (user && user.id === 1) {
      initialBalance = 240.00;
    }

    const { data: newWallet, error: createError } = await supabase
      .from('wallets')
      .insert([{
        user_id: userId,
        balance: initialBalance,
        pending_balance: 0.00,
        total_earned: initialBalance
      }])
      .select()
      .single();

    if (!createError && newWallet) {
      wallet = newWallet;
    } else {
      wallet = { balance: initialBalance, pending_balance: 0.00, total_earned: initialBalance };
    }
  }

  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return {
    balance: parseFloat(wallet.balance || 0),
    pending_balance: parseFloat(wallet.pending_balance || 0),
    total_earned: parseFloat(wallet.total_earned || 0),
    withdrawals: withdrawals || []
  };
}

// -----------------------------------------------
// SOLICITAR SAQUE PIX
// -----------------------------------------------
async function requestWithdrawal(userId, amount, pixKey) {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Valor de saque inválido.');
  }

  const wallet = await getUserWallet(userId);
  if (wallet.balance < numericAmount) {
    throw new Error(`Saldo insuficiente. Saldo disponível: $US ${wallet.balance.toFixed(2)}`);
  }

  const newBalance = wallet.balance - numericAmount;
  const newPending = wallet.pending_balance + numericAmount;

  // Atualizar carteira
  await supabase
    .from('wallets')
    .upsert({
      user_id: userId,
      balance: newBalance,
      pending_balance: newPending,
      updated_at: new Date()
    }, { onConflict: 'user_id' });

  // Criar registro de saque
  const { data: withdrawal, error } = await supabase
    .from('withdrawals')
    .insert([{
      user_id: userId,
      amount: numericAmount,
      pix_key: pixKey,
      status: 'pending',
      created_at: new Date()
    }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao solicitar saque: ${error.message}`);
  return withdrawal;
}

// -----------------------------------------------
// LISTAR TODOS OS SAQUES (ADMIN)
// -----------------------------------------------
async function getAllWithdrawals() {
  const { data: withdrawals, error } = await supabase
    .from('withdrawals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !withdrawals) return [];

  const { data: users } = await supabase.from('users').select('id, name, email');
  const userMap = {};
  if (users) {
    users.forEach(u => { userMap[u.id] = u; });
  }

  return withdrawals.map(w => ({
    ...w,
    user_name: userMap[w.user_id]?.name || `Usuário #${w.user_id}`,
    user_email: userMap[w.user_id]?.email || 'N/A'
  }));
}

// -----------------------------------------------
// PROCESSAR SAQUE (APROVAR OU REJEITAR)
// -----------------------------------------------
async function processWithdrawal(withdrawalId, action) {
  const { data: withdrawal, error: findError } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('id', withdrawalId)
    .single();

  if (findError || !withdrawal) throw new Error('Solicitação de saque não encontrada.');
  if (withdrawal.status !== 'pending') throw new Error('Este saque já foi processado anteriormente.');

  const userId = withdrawal.user_id;
  const amount = parseFloat(withdrawal.amount);
  const wallet = await getUserWallet(userId);

  if (action === 'approve') {
    const newPending = Math.max(0, wallet.pending_balance - amount);
    const newTotal = wallet.total_earned + amount;

    await supabase
      .from('wallets')
      .upsert({ user_id: userId, pending_balance: newPending, total_earned: newTotal, updated_at: new Date() }, { onConflict: 'user_id' });

    await supabase
      .from('withdrawals')
      .update({ status: 'approved', processed_at: new Date() })
      .eq('id', withdrawalId);

    return { message: 'Saque APROVADO com sucesso!' };
  } else if (action === 'reject') {
    const newPending = Math.max(0, wallet.pending_balance - amount);
    const newBalance = wallet.balance + amount;

    await supabase
      .from('wallets')
      .upsert({ user_id: userId, balance: newBalance, pending_balance: newPending, updated_at: new Date() }, { onConflict: 'user_id' });

    await supabase
      .from('withdrawals')
      .update({ status: 'rejected', processed_at: new Date() })
      .eq('id', withdrawalId);

    return { message: 'Saque REJEITADO e valor estornado para a conta do usuário!' };
  } else {
    throw new Error('Ação de saque inválida.');
  }
}

// -----------------------------------------------
// MÓDULO LMS: CURSOS, MÓDULOS, AULAS E PROGRESSO
// -----------------------------------------------

// 1. Listar Cursos
async function getCourses(isAdmin = false) {
  let query = supabase.from('courses').select('*').order('created_at', { ascending: false });
  if (!isAdmin) {
    query = query.eq('is_published', true);
  }
  const { data: courses, error } = await query;
  if (error || !courses) return [];

  const coursesWithDetails = await Promise.all(courses.map(async (c) => {
    const { data: modules } = await supabase.from('modules').select('id').eq('course_id', c.id);
    const moduleIds = modules ? modules.map(m => m.id) : [];

    let lessonsCount = 0;
    if (moduleIds.length > 0) {
      const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds);
      lessonsCount = lessons ? lessons.length : 0;
    }

    return {
      ...c,
      modules_count: moduleIds.length,
      lessons_count: lessonsCount
    };
  }));

  return coursesWithDetails;
}

// 2. Obter Detalhes Completos do Curso (Módulos e Aulas)
async function getCourseDetails(courseId) {
  const { data: course, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
  if (error || !course) throw new Error('Curso não encontrado.');

  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  const modulesWithLessonsAndQuizzes = await Promise.all((modules || []).map(async (m) => {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', m.id)
      .order('order_index', { ascending: true });

    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('*, questions(*, quiz_options(*))')
      .eq('module_id', m.id)
      .order('created_at', { ascending: true });

    return {
      ...m,
      lessons: lessons || [],
      quizzes: quizzes || []
    };
  }));

  return {
    ...course,
    modules: modulesWithLessonsAndQuizzes
  };
}

// 3. Criar / Atualizar / Excluir Cursos
async function createCourse({ title, description, thumbnail_url, is_published = true }) {
  const { data, error } = await supabase
    .from('courses')
    .insert([{
      title,
      description,
      thumbnail_url: thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
      is_published: is_published !== false
    }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar curso: ${error.message}`);
  return data;
}

async function updateCourse(courseId, { title, description, thumbnail_url, is_published }) {
  const { data, error } = await supabase
    .from('courses')
    .update({ title, description, thumbnail_url, is_published, updated_at: new Date() })
    .eq('id', courseId)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar curso: ${error.message}`);
  return data;
}

async function deleteCourse(courseId) {
  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) throw new Error(`Erro ao excluir curso: ${error.message}`);
  return true;
}

// 4. Criar / Excluir Módulos
async function createModule({ course_id, title, order_index = 1 }) {
  const { data, error } = await supabase
    .from('modules')
    .insert([{ course_id, title, order_index }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar módulo: ${error.message}`);
  return data;
}

async function deleteModule(moduleId) {
  const { error } = await supabase.from('modules').delete().eq('id', moduleId);
  if (error) throw new Error(`Erro ao excluir módulo: ${error.message}`);
  return true;
}

// 5. Criar / Excluir Aulas
async function createLesson({ module_id, title, description, video_url, duration = '10:00', order_index = 1 }) {
  const { data, error } = await supabase
    .from('lessons')
    .insert([{ module_id, title, description, video_url, duration, order_index }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao cadastrar aula: ${error.message}`);
  return data;
}

async function deleteLesson(lessonId) {
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
  if (error) throw new Error(`Erro ao excluir aula: ${error.message}`);
  return true;
}

// 6. Progresso do Aluno
async function getUserCompletedLessons(userId) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map(item => item.lesson_id);
}

async function toggleLessonProgress(userId, lessonId) {
  const { data: existing } = await supabase
    .from('lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  if (existing) {
    await supabase.from('lesson_progress').delete().eq('id', existing.id);
    return { completed: false };
  } else {
    await supabase.from('lesson_progress').insert([{ user_id: userId, lesson_id: lessonId }]);
    return { completed: true };
  }
}

async function createQuiz({ module_id, title, passing_score = 70 }) {
  const { data, error } = await supabase
    .from('quizzes')
    .insert([{ module_id, title, passing_score }])
    .select()
    .single();
  if (error) throw new Error(`Erro ao criar quiz: ${error.message}`);
  return data;
}

async function addQuestion({ quiz_id, question_text, correct_option_index, options }) {
  const { data: question, error } = await supabase
    .from('questions')
    .insert([{ quiz_id, question_text, correct_option_index }])
    .select()
    .single();
  if (error) throw new Error(`Erro ao criar pergunta: ${error.message}`);

  const optionsToInsert = options.map(opt => ({ question_id: question.id, option_text: opt }));
  const { error: optError } = await supabase
    .from('quiz_options')
    .insert(optionsToInsert);

  if (optError) throw new Error(`Erro ao criar opções: ${optError.message}`);
  return { ...question, options };
}

async function getQuiz(quiz_id) {
  const { data: quiz, error } = await supabase
    .from('quizzes')
    .select('*, questions(*, quiz_options(*))')
    .eq('id', quiz_id)
    .single();
  if (error) throw new Error('Quiz não encontrado.');
  return quiz;
}

async function getQuizzesByModule(module_id) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(*, quiz_options(*))')
    .eq('module_id', module_id)
    .order('created_at', { ascending: true });
  if (error) return [];
  return data || [];
}

async function deleteQuiz(quiz_id) {
  const { error } = await supabase.from('quizzes').delete().eq('id', quiz_id);
  if (error) throw new Error(`Erro ao excluir quiz: ${error.message}`);
  return true;
}

async function deleteQuestion(question_id) {
  const { error } = await supabase.from('questions').delete().eq('id', question_id);
  if (error) throw new Error(`Erro ao excluir pergunta: ${error.message}`);
  return true;
}

async function submitQuizAttempt(user_id, quiz_id, answers) {
  const quiz = await getQuiz(quiz_id);
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    throw new Error('Quiz sem perguntas cadastradas.');
  }

  let correctCount = 0;
  quiz.questions.forEach((q) => {
    const userAnswer = answers[q.id];
    if (userAnswer !== undefined && userAnswer === q.correct_option_index) {
      correctCount++;
    }
  });

  const score = (correctCount / quiz.questions.length) * 100;
  const passed = score >= (quiz.passing_score || 70);

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([{ user_id, quiz_id, score, passed }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao salvar tentativa: ${error.message}`);

  return {
    ...data,
    total_questions: quiz.questions.length,
    correct_count: correctCount,
    score,
    passed
  };
}

async function getUserQuizAttempts(user_id) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

// ============================================================
// WEBHOOK HOTMART — Processar Pagamento Aprovado
// ============================================================
async function processHotmartPurchase({ buyerEmail, buyerName, productId }) {
  const cyclesByProduct = {
    [process.env.HOTMART_PRODUCT_BRONZE || '']: 1,
    [process.env.HOTMART_PRODUCT_PRATA || '']: 2,
    [process.env.HOTMART_PRODUCT_OURO || '']: 3,
    [process.env.HOTMART_PRODUCT_PLATINO || '']: 4,
    [process.env.HOTMART_PRODUCT_DIAMANTE || '']: 5,
  };

  const registrationProductId = process.env.HOTMART_PRODUCT_REGISTRATION || '';

  const cycleId = cyclesByProduct[String(productId)];
  const isRegistration = String(productId) === String(registrationProductId);
  
  if (!cycleId && !isRegistration) {
    console.warn(`⚠️ [Hotmart] Product ID ${productId} não mapeado para nenhum ciclo.`);
    return { success: false, reason: 'product_not_mapped' };
  }

  let cycle = null;
  if (cycleId) {
    cycle = await getCycleById(cycleId);
    if (!cycle) {
      console.error(`❌ [Hotmart] Ciclo ID ${cycleId} não encontrado no banco.`);
      return { success: false, reason: 'cycle_not_found' };
    }
  }

  // 1. Buscar usuário existente
  let user = await findUserByEmail(buyerEmail);

  // 2. Se não existe, criar automaticamente na matriz
  if (!user) {
    console.log(`👤 [Hotmart] Novo usuário: ${buyerEmail}. Criando conta...`);

    // Buscar admin padrão como patrocinador
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (!adminUser) {
      console.error('❌ [Hotmart] Nenhum admin encontrado como patrocinador padrão.');
      return { success: false, reason: 'no_sponsor_available' };
    }

    const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(-12), 10);
    const referralCode = generateReferralCodeHotmart(buyerEmail);

    const newUser = await createUserLspc({
      name: buyerName || buyerEmail.split('@')[0],
      email: buyerEmail,
      passwordHash: tempPassword,
      referralCode,
      sponsorId: adminUser.id,
      targetLeg: 'auto'
    });

    // Buscar o usuário recém-criado para prosseguir
    user = await findUserByEmail(buyerEmail);
    console.log(`✅ [Hotmart] Usuário criado: ID ${user.id}, email: ${buyerEmail}`);
  }

  // 2.1. Se é pagamento de REGISTRO → ativar conta
  if (isRegistration) {
    if (user.account_status === 'active') {
      console.log(`ℹ️ [Hotmart] Usuário ${buyerEmail} já está ativo. Ignorando.`);
      return { success: true, already_active: true, type: 'registration' };
    }
    await supabase
      .from('users')
      .update({ account_status: 'active', is_active: true })
      .eq('id', user.id);
    console.log(`✅ [Hotmart] Conta ativada: ${buyerEmail} — Pagamento de registro confirmado`);
    return { success: true, type: 'registration_activated', user_id: user.id };
  }

  // 3. Verificar se já possui este ciclo
  const { data: existingCycle } = await supabase
    .from('user_cycles')
    .select('id')
    .eq('user_id', user.id)
    .eq('cycle_id', cycleId)
    .limit(1)
    .single();

  if (existingCycle) {
    console.log(`ℹ️ [Hotmart] Usuário ${buyerEmail} já possui o Ciclo ${cycle.name}. Ignorando.`);
    return { success: true, already_has_cycle: true, cycle: cycle.name };
  }

  // 4. Registrar compra do ciclo (user_cycles + transactions + update users)
  await purchaseCycle(user.id, cycleId);
  console.log(`💰 [Hotmart] Compra registrada: ${buyerEmail} → Ciclo ${cycle.name} ($${cycle.price})`);

  // 5. Se produto físico (Ouro, Platino, Diamante), criar shipment pendente
  if (cycle.product_type === 'physical' || cycle.product_type === 'both') {
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('cycle_id', cycleId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (product) {
      await supabase.from('shipments').insert([{
        user_id: user.id,
        cycle_id: cycleId,
        product_id: product.id,
        status: 'pending',
        shipping_address: user.shipping_address || null
      }]);
      console.log(`📦 [Hotmart] Envio criado para ${buyerEmail} — Ciclo ${cycle.name}`);
    } else {
      console.warn(`⚠️ [Hotmart] Nenhum produto ativo encontrado para o Ciclo ${cycle.name}. Shipment não criado.`);
    }
  }

  return { success: true, cycle: cycle.name, user_id: user.id };
}

function generateReferralCodeHotmart(email) {
  const prefix = email.split('@')[0].replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix || 'EPI'}${randomNum}`;
}

// Seed Inicial de Cursos
async function seedCoursesDatabase() {
  try {
    const { data: existing } = await supabase.from('courses').select('id').limit(1);
    if (!existing || existing.length === 0) {
      console.log('🎓 Criando curso inicial de demonstração no LMS...');
      const course = await createCourse({
        title: 'Formação MMN & Matriz 3x3 Epi',
        description: 'Aprenda do zero como acelerar sua rede de afiliados, dominar o algoritmo de derrame e formar seus 3 Maestros.',
        thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
        is_published: true
      });

      const mod1 = await createModule({ course_id: course.id, title: 'Módulo 1: Fundamentos do Sistema EPI', order_index: 1 });
      await createLesson({
        module_id: mod1.id,
        title: 'Aula 1: Apresentação da Plataforma e Matriz 3x3',
        description: 'Visão geral do sistema de afiliados, funcionamento da matriz forçada e ciclo Socio Bronce.',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '12:45',
        order_index: 1
      });
      await createLesson({
        module_id: mod1.id,
        title: 'Aula 2: Como Funciona o Algoritmo de Derrame (BFS)',
        description: 'Aprenda como as posições são alocadas automaticamente da esquerda para a direita quando você faz novos convites.',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '18:20',
        order_index: 2
      });

      const mod2 = await createModule({ course_id: course.id, title: 'Módulo 2: Estratégias de Divulgação e Saques', order_index: 2 });
      await createLesson({
        module_id: mod2.id,
        title: 'Aula 3: Como Usar Seu Link Direto de Indicação (?ref=CODIGO)',
        description: 'Técnicas práticas para compartilhar seu link de afiliado nas redes sociais e preencher sua linha de Maestros.',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '15:10',
        order_index: 1
      });
      await createLesson({
        module_id: mod2.id,
        title: 'Aula 4: Solicitação de Saques PIX e Gestão de Saldo',
        description: 'Tutorial completo de como solicitar saques de comissões via PIX e acompanhar o histórico financeiro.',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '10:00',
        order_index: 2
      });
    }
  } catch (err) {
    console.error('Aviso ao gerar seed de cursos:', err.message);
  }
}

// Chamar seed de cursos na inicialização
seedCoursesDatabase();

// ============================================================
// SISTEMA DE LOGS DE AUDITORIA
// ============================================================
async function createAuditLog({ adminUserId, adminName, action, targetUserId, targetUserName, details, ipAddress }) {
  try {
    await supabase.from('audit_logs').insert([{
      admin_user_id: adminUserId,
      admin_name: adminName,
      action,
      target_user_id: targetUserId || null,
      target_user_name: targetUserName || null,
      details: details || null,
      ip_address: ipAddress || null
    }]);
  } catch (err) {
    console.error('Erro ao registrar log de auditoria:', err.message);
  }
}

async function getAuditLogs(limit = 50) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

// EXPIRAÇÃO DE CONTAS INATIVAS
async function deactivateInactiveAccounts(inactiveDays = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

    const { data: inactiveUsers, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'user')
      .eq('is_active', true)
      .eq('account_status', 'active')
      .lt('last_active_at', cutoffDate.toISOString());

    if (error) throw new Error(error.message);
    if (!inactiveUsers || inactiveUsers.length === 0) {
      console.log(`[Expiration] Nenhum usuário inativo há ${inactiveDays}+ dias.`);
      return { deactivated: 0 };
    }

    const userIds = inactiveUsers.map(u => u.id);
    await supabase
      .from('users')
      .update({ is_active: false, account_status: 'expired' })
      .in('id', userIds);

    console.log(`[Expiration] ${inactiveUsers.length} contas expiradas (${inactiveDays}+ dias)`);
    return { deactivated: inactiveUsers.length, users: inactiveUsers.map(u => u.name) };
  } catch (err) {
    console.error('[Expiration] Erro ao expirar contas:', err.message);
    return { deactivated: 0, error: err.message };
  }
}

module.exports = {
  initDb,
  findUserByIdentifier,
  findUserByEmail,
  createUserLspc,
  findAvailablePlacementNode,
  getLspcMatrix,
  getLspcTreeStructure,
  getAllUsersWithLspcStats,
  updateUserRole,
  updateUserPassword,
  setUserActiveStatus,
  findActiveUpline,
  getUserWallet,
  requestWithdrawal,
  getAllWithdrawals,
  processWithdrawal,
  getCourses,
  getCourseDetails,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  deleteModule,
  createLesson,
  deleteLesson,
  getUserCompletedLessons,
  toggleLessonProgress,
  createQuiz,
  addQuestion,
  getQuiz,
  getQuizzesByModule,
  deleteQuiz,
  deleteQuestion,
  submitQuizAttempt,
  getUserQuizAttempts,
  checkCourseCompletion,
  getAllCycles,
  getCycleById,
  getNextCycle,
  getUserCycleProgress,
  checkMatrixCompletion,
  processDirectCommission,
  processRefund,
  processUpgrade,
  purchaseCycle,
  getUserTransactions,
  getAllTransactions,
  getAllShipments,
  getUserShipments,
  updateShipmentStatus,
  updateCycle,
  getUserDashboardData,
  seedCycles,
  creditWallet,
  processHotmartPurchase,
  createAuditLog,
  getAuditLogs,
  deactivateInactiveAccounts,
  supabase
};

async function checkCourseCompletion(userId, courseId) {
  const { data: course } = await getCourseDetails(courseId);
  if (!course || !course.modules) return false;

  const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0);
  const completedLessons = await getUserCompletedLessons(userId);

  const courseLessonIds = course.modules.flatMap(m => (m.lessons || []).map(l => l.id));
  const completedInCourse = courseLessonIds.filter(id => completedLessons.includes(id));

  return completedInCourse.length === courseLessonIds.length && courseLessonIds.length > 0;
}

// ============================================================
// SISTEMA DE 5 CICLOS PROGRESSIVOS
// ============================================================

// 1. Listar todos os ciclos
async function getAllCycles() {
  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .order('order_index', { ascending: true });
  if (error || !data) return [];
  return data;
}

// 2. Buscar ciclo por ID
async function getCycleById(cycleId) {
  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('id', cycleId)
    .single();
  if (error || !data) return null;
  return data;
}

// 3. Buscar próximo ciclo de upgrade
async function getNextCycle(currentCycleId) {
  const current = await getCycleById(currentCycleId);
  if (!current) return null;
  const { data } = await supabase
    .from('cycles')
    .select('*')
    .gt('order_index', current.order_index)
    .order('order_index', { ascending: true })
    .limit(1)
    .single();
  return data || null;
}

// 4. Progresso de ciclos do usuário
async function getUserCycleProgress(userId) {
  const { data: userCycles, error } = await supabase
    .from('user_cycles')
    .select('*, cycle:cycles(*)')
    .eq('user_id', userId)
    .order('purchased_at', { ascending: true });

  if (error || !userCycles) return [];

  return userCycles.map(uc => ({
    id: uc.id,
    cycle_id: uc.cycle_id,
    cycle_name: uc.cycle?.name || 'Unknown',
    cycle_display_name: uc.cycle?.display_name || 'Unknown',
    cycle_price: uc.cycle?.price || 0,
    cycle_order: uc.cycle?.order_index || 0,
    status: uc.status,
    purchased_at: uc.purchased_at,
    completed_at: uc.completed_at
  }));
}

// 5. Verificar se usuário completou a matriz 3x3 (39 nós reais)
async function checkMatrixCompletion(userId) {
  const matrix = await getLspcMatrix(userId);
  const maestros = matrix.filter(m => m.layer === 1);
  const lideres = matrix.filter(m => m.layer === 2);
  const ayudantes = matrix.filter(m => m.layer === 3);

  // Matriz completa: 3 Maestros + 9 Líderes + 27 Ajudantes = 39
  return maestros.length >= 3 && lideres.length >= 9 && ayudantes.length >= 27;
}

// 6. Processar comissão por indicação direta
async function processDirectCommission(userId, fromUserId, cycleId) {
  const cycle = await getCycleById(cycleId);
  if (!cycle || cycle.bonus_per_referral <= 0) return null;

  const { data: fromUser } = await supabase
    .from('users')
    .select('name')
    .eq('id', fromUserId)
    .single();

  const description = `Comissão direta por indicação de ${fromUser?.name || 'usuário'} (Ciclo ${cycle.name})`;

  const { data: tx, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: userId,
      type: 'commission_direct',
      amount: cycle.bonus_per_referral,
      cycle_id: cycleId,
      from_user_id: fromUserId,
      to_user_id: userId,
      description,
      status: 'completed'
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao registrar comissão direta:', error.message);
    return null;
  }

  // Creditar na wallet
  await creditWallet(userId, cycle.bonus_per_referral);

  console.log(`💰 Comissão $${cycle.bonus_per_referral} creditada para usuário #${userId} (Ciclo ${cycle.name})`);
  return tx;
}

// 7. Creditar valor na wallet
async function creditWallet(userId, amount) {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) return;

  let { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!wallet) {
    const { data: newWallet } = await supabase
      .from('wallets')
      .insert([{ user_id: userId, balance: numericAmount, pending_balance: 0.00, total_earned: numericAmount }])
      .select()
      .single();
    wallet = newWallet;
  } else {
    const newBalance = parseFloat(wallet.balance) + numericAmount;
    const newTotal = parseFloat(wallet.total_earned) + numericAmount;
    await supabase
      .from('wallets')
      .update({ balance: newBalance, total_earned: newTotal, updated_at: new Date() })
      .eq('user_id', userId);
  }
}

// 8. Processar reembolso ao completar matriz 3x3
async function processRefund(userId) {
  const { data: user } = await supabase
    .from('users')
    .select('id, current_cycle_id, fee_refunded, name')
    .eq('id', userId)
    .single();

  if (!user || user.fee_refunded) return null;

  const cycle = await getCycleById(user.current_cycle_id || 1);
  if (!cycle) return null;

  const refundAmount = cycle.refund_amount;

  const { data: tx, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: userId,
      type: 'refund',
      amount: refundAmount,
      cycle_id: cycle.id,
      to_user_id: userId,
      description: `Reembolso Ciclo ${cycle.name} — Matriz 3x3 completada`,
      status: 'completed'
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao registrar reembolso:', error.message);
    return null;
  }

  await creditWallet(userId, refundAmount);
  await supabase.from('users').update({ fee_refunded: true }).eq('id', userId);

  console.log(`💸 Reembolso $${refundAmount} creditado para ${user.name} (Ciclo ${cycle.name})`);
  return tx;
}

// 9. Processar upgrade de ciclo
async function processUpgrade(userId, targetCycleId) {
  const { data: user } = await supabase
    .from('users')
    .select('id, current_cycle_id, name')
    .eq('id', userId)
    .single();

  if (!user) throw new Error('Usuário não encontrado.');

  const targetCycle = await getCycleById(targetCycleId);
  if (!targetCycle) throw new Error('Ciclo alvo não encontrado.');

  const currentCycle = await getCycleById(user.current_cycle_id || 1);
  if (currentCycle && targetCycle.order_index <= currentCycle.order_index) {
    throw new Error('Você já está neste ciclo ou num ciclo superior.');
  }

  // Verificar se completou a matriz no ciclo atual
  const completed = await checkMatrixCompletion(userId);
  if (!completed) {
    throw new Error('Complete sua matriz 3x3 no ciclo atual antes de fazer upgrade.');
  }

  // Verificar saldo
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();

  const balance = parseFloat(wallet?.balance || 0);
  if (balance < targetCycle.price) {
    throw new Error(`Saldo insuficiente. Necessário: $${targetCycle.price}, disponível: $${balance.toFixed(2)}`);
  }

  // Debitar da wallet
  const newBalance = balance - targetCycle.price;
  await supabase
    .from('wallets')
    .update({ balance: newBalance, updated_at: new Date() })
    .eq('user_id', userId);

  // Registrar transação de upgrade
  await supabase.from('transactions').insert([{
    user_id: userId,
    type: 'upgrade',
    amount: targetCycle.price,
    cycle_id: targetCycleId,
    to_user_id: userId,
    description: `Upgrade para Ciclo ${targetCycle.name} (${targetCycle.display_name})`,
    status: 'completed'
  }]);

  // Completar ciclo anterior
  if (currentCycle) {
    await supabase
      .from('user_cycles')
      .update({ status: 'completed', completed_at: new Date() })
      .eq('user_id', userId)
      .eq('cycle_id', currentCycle.id);
  }

  // Criar/atualizar ciclo novo
  const { error: ucError } = await supabase
    .from('user_cycles')
    .upsert({ user_id: userId, cycle_id: targetCycleId, status: 'active' }, { onConflict: 'user_id,cycle_id' });

  if (ucError) {
    console.error('Erro ao criar user_cycle:', ucError.message);
  }

  // Atualizar ciclo do usuário
  await supabase
    .from('users')
    .update({ current_cycle_id: targetCycleId, current_cycle: targetCycle.name, fee_refunded: false })
    .eq('id', userId);

  // Se produto físico, criar shipment
  if (targetCycle.product_type === 'physical' || targetCycle.product_type === 'both') {
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('cycle_id', targetCycleId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (product) {
      await supabase.from('shipments').insert([{
        user_id: userId,
        cycle_id: targetCycleId,
        product_id: product.id,
        status: 'pending',
        shipping_address: user.shipping_address || null
      }]);
      console.log(`📦 Envio criado para ${user.name} — Ciclo ${targetCycle.name}`);
    }
  }

  console.log(`⬆️ ${user.name} fez upgrade para Ciclo ${targetCycle.name} ($${targetCycle.price})`);
  return { success: true, cycle: targetCycle };
}

// 10. Registrar compra de ciclo (registro inicial)
async function purchaseCycle(userId, cycleId) {
  const cycle = await getCycleById(cycleId);
  if (!cycle) throw new Error('Ciclo não encontrado.');

  const { data: existing } = await supabase
    .from('user_cycles')
    .select('id')
    .eq('user_id', userId)
    .eq('cycle_id', cycleId)
    .limit(1)
    .single();

  if (existing) throw new Error('Você já possui este ciclo.');

  const { error } = await supabase
    .from('user_cycles')
    .insert([{ user_id: userId, cycle_id: cycleId, status: 'active' }]);

  if (error) throw new Error(`Erro ao registrar compra: ${error.message}`);

  await supabase
    .from('users')
    .update({ current_cycle_id: cycleId, current_cycle: cycle.name, registration_fee: cycle.price })
    .eq('id', userId);

  await supabase.from('transactions').insert([{
    user_id: userId,
    type: 'cycle_purchase',
    amount: cycle.price,
    cycle_id: cycleId,
    to_user_id: userId,
    description: `Compra do Ciclo ${cycle.name} — ${cycle.display_name}`,
    status: 'completed'
  }]);

  return { success: true, cycle };
}

// 11. Extrato de transações do usuário
async function getUserTransactions(userId, limit = 20) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, cycle:cycles(name, display_name), from_user:from_user_id(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(tx => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    status: tx.status,
    cycle_name: tx.cycle?.display_name || null,
    from_user_name: tx.from_user?.name || null,
    created_at: tx.created_at
  }));
}

// 12. Todas as transações (admin)
async function getAllTransactions(limit = 100) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, cycle:cycles(name, display_name), user:users(name, email)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(tx => ({
    ...tx,
    user_name: tx.user?.name || 'N/A',
    user_email: tx.user?.email || 'N/A',
    cycle_name: tx.cycle?.display_name || null
  }));
}

// 13. Todos os envios (admin)
async function getAllShipments() {
  const { data, error } = await supabase
    .from('shipments')
    .select('*, user:users(name, email), cycle:cycles(name, display_name), product:products(name, sku)')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(s => ({
    id: s.id,
    user_name: s.user?.name || 'N/A',
    user_email: s.user?.email || 'N/A',
    cycle_name: s.cycle?.display_name || 'N/A',
    product_name: s.product?.name || 'N/A',
    product_sku: s.product?.sku || 'N/A',
    status: s.status,
    tracking_code: s.tracking_code,
    shipping_address: s.shipping_address || '—',
    shipped_at: s.shipped_at,
    delivered_at: s.delivered_at,
    created_at: s.created_at
  }));
}

// 14. Envios do usuário
async function getUserShipments(userId) {
  const { data, error } = await supabase
    .from('shipments')
    .select('*, cycle:cycles(name, display_name), product:products(name, description)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

// 15. Atualizar status de envio (admin)
async function updateShipmentStatus(shipmentId, status, trackingCode) {
  const updates = { status };
  if (trackingCode) updates.tracking_code = trackingCode;
  if (status === 'shipped') updates.shipped_at = new Date();
  if (status === 'delivered') updates.delivered_at = new Date();

  const { data, error } = await supabase
    .from('shipments')
    .update(updates)
    .eq('id', shipmentId)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar envio: ${error.message}`);
  return data;
}

// 16. Atualizar ciclo (admin)
async function updateCycle(cycleId, updates) {
  const { data, error } = await supabase
    .from('cycles')
    .update(updates)
    .eq('id', cycleId)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar ciclo: ${error.message}`);
  return data;
}

// 17. Dashboard expandido com dados de ciclo
async function getUserDashboardData(userId) {
  const currentUser = await findUserByEmail(
    (await supabase.from('users').select('email').eq('id', userId).single()).data?.email
  );
  if (!currentUser) return null;

  const matrix = await getEpiMatrix(userId);
  const maestros = matrix.filter(item => item.layer === 1);
  const lideres = matrix.filter(item => item.layer === 2);
  const ayudantes = matrix.filter(item => item.layer === 3);

  const currentCycle = await getCycleById(currentUser.current_cycle_id || 1);
  const nextCycle = currentCycle ? await getNextCycle(currentCycle.id) : null;
  const cycleProgress = await getUserCycleProgress(userId);
  const completed = await checkMatrixCompletion(userId);

  const isRefundUnlocked = maestros.length >= 3 || Boolean(currentUser.fee_refunded);

  let sponsorName = 'Nenhum (Sistema Raiz)';
  if (currentUser.sponsor_id) {
    const sponsor = await findUserByIdentifier(currentUser.sponsor_id.toString());
    if (sponsor) sponsorName = sponsor.name;
  }

  return {
    user: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      referral_code: currentUser.referral_code,
      sponsor_name: sponsorName,
      registration_fee: currentUser.registration_fee || 80.00,
      fee_refunded: isRefundUnlocked,
      current_cycle: currentUser.current_cycle || 'Bronze',
      current_cycle_id: currentUser.current_cycle_id || 1,
      is_active: currentUser.is_active,
      shipping_address: currentUser.shipping_address || '',
      created_at: currentUser.created_at
    },
    current_cycle: currentCycle,
    next_cycle: nextCycle,
    matrix_completed: completed,
    cycle_progress: cycleProgress,
    epi_layers: {
      maestros: { count: maestros.length, max: 3, percent: Math.round((maestros.length / 3) * 100) },
      lideres: { count: lideres.length, max: 9, percent: Math.round((lideres.length / 9) * 100) },
      ayudantes: { count: ayudantes.length, max: 27, percent: Math.round((ayudantes.length / 27) * 100) },
      total_platform: { count: matrix.length, max: 39, percent: Math.round((matrix.length / 39) * 100) }
    },
    matrix: matrix
  };
}

// 18. Seed de ciclos (chamado na inicialização)
async function seedCycles() {
  try {
    const cyclesData = [
      { name: 'Bronze', slug: 'bronze', display_name: 'Socio Bronze', price: 80.00, description: 'Curso Básico de Marketing Digital. Bônus de $20 por indicação direta.', product_type: 'digital', product_description: 'Curso Básico de Marketing Digital', bonus_per_referral: 20.00, refund_amount: 60.00, order_index: 1 },
      { name: 'Prata', slug: 'prata', display_name: 'Socio Prata', price: 100.00, description: 'Módulo Intermediário/Avançado de Estratégias e Vendas.', product_type: 'digital', product_description: 'Módulo Intermediário/Avançado de Estratégias e Vendas', bonus_per_referral: 0.00, refund_amount: 0.00, order_index: 2 },
      { name: 'Ouro', slug: 'ouro', display_name: 'Socio Ouro', price: 500.00, description: 'Kit Vitaminas/Suplementos + Módulo Master de Liderança. Liberação de produto físico.', product_type: 'both', product_description: 'Kit de Vitaminas/Suplementos + Módulo Master de Liderança', bonus_per_referral: 0.00, refund_amount: 0.00, order_index: 3 },
      { name: 'Platino', slug: 'platino', display_name: 'Socio Platino', price: 1000.00, description: 'Linha Completa de Suplementos Avançados + Imersão Executiva Digital.', product_type: 'both', product_description: 'Linha Completa de Suplementos + Imersão Executiva Digital', bonus_per_referral: 0.00, refund_amount: 0.00, order_index: 4 },
      { name: 'Diamante', slug: 'diamante', display_name: 'Socio Diamante', price: 5000.00, description: 'Kit Alta Performance + Conselho de Estratégia e Mentorias Vitalício.', product_type: 'both', product_description: 'Kit Alta Performance + Conselho de Estratégia e Mentorias', bonus_per_referral: 0.00, refund_amount: 0.00, order_index: 5 }
    ];

    const { data: existing } = await supabase.from('cycles').select('id');
    if (existing && existing.length > 0) {
      console.log(`ℹ️ ${existing.length} ciclos já existem. Atualizando valores oficiais...`);
      for (const c of cyclesData) {
        await supabase.from('cycles').update({
          price: c.price,
          bonus_per_referral: c.bonus_per_referral,
          refund_amount: c.refund_amount,
          description: c.description,
          product_type: c.product_type,
          product_description: c.product_description
        }).eq('slug', c.slug);
      }
      console.log('✅ Ciclos atualizados com valores oficiais.');
      return;
    }

    console.log('🔄 Inserindo 5 ciclos progressivos...');
    await supabase.from('cycles').insert(cyclesData);
    console.log('✅ 5 ciclos progressivos inseridos.');
  } catch (err) {
    console.error('Erro ao inserir ciclos:', err.message);
  }
}



