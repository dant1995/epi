require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const { sendWelcomeEmail, sendNewAffiliateNotification, sendWithdrawStatusEmail } = require('./email');
const {
  initDb,
  findUserByIdentifier,
  findUserByEmail,
  createUserLspc,
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
  getUserCycleProgress,
  processUpgrade,
  purchaseCycle,
  getUserTransactions,
  getAllTransactions,
  getAllShipments,
  getUserShipments,
  updateShipmentStatus,
  updateCycle,
  getUserDashboardData,
  deactivateInactiveAccounts,
  seedCycles,
  checkMatrixCompletion,
  processHotmartPurchase,
  createAuditLog,
  getAuditLogs,
  supabase
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.JWT_SECRET) {
  console.error('╔══════════════════════════════════════════════════════════════╗');
  console.error('║  SEGURANÇA: Variável JWT_SECRET não definida!              ║');
  console.error('║  Defina JWT_SECRET no seu .env ou variável de ambiente.    ║');
  console.error('║  O servidor usará um valor temporário INSEGURO.            ║');
  console.error('╚══════════════════════════════════════════════════════════════╝');
}
const JWT_SECRET = process.env.JWT_SECRET || 'TEMPORARY_INSECURE_SECRET_' + Date.now();

app.use(cors());
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => { req.rawBody = buf; }
}));
app.use(express.static(path.join(__dirname, '../dist')));

// Middleware JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token nÃ£o fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token invÃ¡lido ou expirado.' });
    }
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('account_status, role')
        .eq('id', decoded.id)
        .single();
      req.user = {
        ...decoded,
        account_status: dbUser?.account_status || 'active',
        role: dbUser?.role || decoded.role
      };
      // Atualizar last_active_at (fire and forget)
      supabase.from('users').update({ last_active_at: new Date().toISOString() }).eq('id', decoded.id).then(() => {});
    } catch (e) {
      req.user = decoded;
    }
    next();
  });
}

// Middleware de Admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Acesso negado. Ãrea exclusiva do Administrador Epi.' });
  }
}

// Middleware: Conta deve estar ativa (após pagamento)
function requireActiveAccount(req, res, next) {
  if (req.user && (req.user.account_status === 'active' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ 
      error: 'Conta pendente de ativação.', 
      code: 'ACCOUNT_PENDING',
      message: 'Complete o pagamento da taxa de registro para ativar sua conta.'
    });
  }
}

// Helper para Gerar CÃ³digo de IndicaÃ§Ã£o
function generateReferralCode(name) {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName || 'Epi'}${randomNum}`;
}

// ----------------------------------------------------
// ROTAS DE AUTENTICAÃ‡ÃƒO E CADASTRO Epi
// ----------------------------------------------------

// 1. ValidaÃ§Ã£o de Patrocinador
app.get('/api/sponsor/validate/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const sponsor = await findUserByIdentifier(identifier);

    if (!sponsor) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Patrocinador Epi nÃ£o encontrado. Verifique o cÃ³digo digitado.' 
      });
    }

    return res.json({
      valid: true,
      sponsor: {
        id: sponsor.id,
        name: sponsor.name,
        email: sponsor.email,
        referral_code: sponsor.referral_code
      }
    });
  } catch (error) {
    console.error('Erro ao validar patrocinador:', error);
    res.status(500).json({ error: 'Erro interno ao consultar patrocinador.' });
  }
});

// 2. Registro com Matriz ForÃ§ada 3x3 e SeleÃ§Ã£o de Perna (Derrame)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, sponsorIdentifier, targetLeg, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos (nome, e-mail e senha).' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    if (!sponsorIdentifier) {
      return res.status(400).json({ error: 'O cÃ³digo do Patrocinador Epi Ã© obrigatÃ³rio.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail jÃ¡ estÃ¡ registrado na plataforma Epi.' });
    }

    const sponsor = await findUserByIdentifier(sponsorIdentifier);
    if (!sponsor) {
      return res.status(400).json({ error: 'Patrocinador invÃ¡lido. NÃ£o foi possÃ­vel realizar o cadastro.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode(name);

    // Registro com alocaÃ§Ã£o na perna escolhida (Esquerda, Centro, Direita ou Auto)
    const newUser = await createUserLspc({
      name,
      email,
      passwordHash,
      referralCode,
      sponsorId: sponsor.id,
      targetLeg: targetLeg || 'auto',
      phone,
      accountStatus: 'pending'
    });

    const userRole = 'user';
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const registrationFee = newUser.registration_fee || 80.00;
    const hotmartCheckoutUrl = process.env.HOTMART_CHECKOUT_URL || '';

    res.status(201).json({
      message: 'Cadastro realizado! Para ativar sua conta, complete o pagamento da taxa de registro.',
      account_status: 'pending',
      requires_payment: true,
      payment: {
        amount: registrationFee,
        currency: 'USD',
        checkout_url: hotmartCheckoutUrl,
        description: 'Taxa de Registro - Matriz Epi 3x3'
      },
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        referral_code: newUser.referralCode,
        sponsor_name: sponsor.name,
        role: userRole,
        account_status: 'pending',
        registration_fee: registrationFee,
        fee_refunded: false,
        current_cycle: 'Socio Bronce'
      }
    });

    // Enviar email de boas-vindas (async, não bloqueia resposta)
    sendWelcomeEmail({
      name: newUser.name,
      email: newUser.email,
      referral_code: newUser.referralCode,
      sponsor_name: sponsor.name
    }).catch(err => console.error('[Email] Erro boas-vindas:', err.message));

    // Notificar patrocinador sobre novo afiliado
    sendNewAffiliateNotification(sponsor, {
      name: newUser.name,
      email: newUser.email,
      referral_code: newUser.referralCode
    }).catch(err => console.error('[Email] Erro notificação patrocinador:', err.message));
  } catch (error) {
    console.error('Erro no registro Epi:', error);
    res.status(500).json({ error: 'Erro ao processar o cadastro na matriz.' });
  }
});

// 3. Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Informe o e-mail e a senha.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'E-mail nÃ£o encontrado.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    let sponsorName = 'Nenhum (Raiz)';
    if (user.sponsor_id) {
      const sponsor = await findUserByIdentifier(user.sponsor_id.toString());
      if (sponsor) sponsorName = sponsor.name;
    }

    const userRole = user.role || (user.id === 1 || user.email === 'admin@sistema.com' ? 'admin' : 'user');

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        referral_code: user.referral_code,
        sponsor_name: sponsorName,
        role: userRole,
        registration_fee: user.registration_fee || 60.00,
        fee_refunded: Boolean(user.fee_refunded),
        current_cycle: user.current_cycle || 'Socio Bronce',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        country: user.country || '',
        document_photo_url: user.document_photo_url || '',
        profile_completed: Boolean(user.profile_completed),
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(500).json({ error: 'Erro interno ao processar o login. Tente novamente.' });
  }
});

// 3. Atualização de Perfil do Usuário
app.put('/api/user/profile', [authenticateToken], async (req, res) => {
  try {
    const { phone, date_of_birth, country, document_photo_url, shipping_address } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('users')
      .update({
        phone: phone || undefined,
        date_of_birth: date_of_birth || undefined,
        country: country || undefined,
        document_photo_url: document_photo_url || undefined,
        shipping_address: shipping_address || undefined,
        profile_completed: true
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    res.json({
      message: 'Perfil actualizado con éxito',
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        date_of_birth: data.date_of_birth || '',
        country: data.country || '',
        document_photo_url: data.document_photo_url || '',
        shipping_address: data.shipping_address || '',
        profile_completed: Boolean(data.profile_completed)
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error.message);
    res.status(500).json({ error: 'Erro ao actualizar el perfil.' });
  }
});

// ----------------------------------------------------
// ROTAS DO PAINEL DO USUÃRIO (DASHBOARD MATRIZ Epi)
// ----------------------------------------------------

// 4. Obter EstatÃ­sticas da Matriz 3x3 Fechada (39 Pessoas)
app.get('/api/user/dashboard', [authenticateToken, requireActiveAccount], async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await findUserByEmail(req.user.email);

    if (!currentUser) {
      return res.status(404).json({ error: 'UsuÃ¡rio nÃ£o encontrado.' });
    }

    let sponsorName = 'Nenhum (Sistema Raiz)';
    if (currentUser.sponsor_id) {
      const sponsor = await findUserByIdentifier(currentUser.sponsor_id.toString());
      if (sponsor) sponsorName = sponsor.name;
    }

    // Buscar membros da Matriz Epi (Limitado a 3 camadas: 3, 9, 27)
    const matrix = await getLspcMatrix(userId);

    const maestros = matrix.filter(item => item.layer === 1);
    const lideres = matrix.filter(item => item.layer === 2);
    const ayudantes = matrix.filter(item => item.layer === 3);

    const isRefundUnlocked = maestros.length >= 3 || Boolean(currentUser.fee_refunded);

    res.json({
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        referral_code: currentUser.referral_code,
        sponsor_name: sponsorName,
        registration_fee: currentUser.registration_fee || 60.00,
        fee_refunded: isRefundUnlocked,
        current_cycle: currentUser.current_cycle || 'Socio Bronce',
        created_at: currentUser.created_at
      },
      epi_layers: {
        maestros: { count: maestros.length, max: 3, percent: Math.round((maestros.length / 3) * 100) },
        lideres: { count: lideres.length, max: 9, percent: Math.round((lideres.length / 9) * 100) },
        ayudantes: { count: ayudantes.length, max: 27, percent: Math.round((ayudantes.length / 27) * 100) },
        total_platform: { count: matrix.length, max: 39, percent: Math.round((matrix.length / 39) * 100) }
      },
      matrix: matrix
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard Epi:', error);
    res.status(500).json({ error: `Erro ao carregar dados da matriz: ${error.message}` });
  }
});

// 5. Ãrvore da Matriz 3x3
app.get('/api/user/tree', [authenticateToken, requireActiveAccount], async (req, res) => {
  try {
    const userId = req.user.id;
    const tree = await getLspcTreeStructure(userId);
    res.json({ tree });
  } catch (error) {
    console.error('Erro ao carregar Ã¡rvore Epi:', error);
    res.status(500).json({ error: 'Erro ao carregar estrutura da Ã¡rvore.' });
  }
});

// ----------------------------------------------------
// ROTAS DO ADMINISTRADOR
// ----------------------------------------------------

// 6. Listagem Global da Matriz para Admin
app.get('/api/admin/users', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const users = await getAllUsersWithLspcStats();
    res.json({ users });
  } catch (error) {
    console.error('Erro ao listar usuÃ¡rios admin:', error);
    res.status(500).json({ error: 'Erro ao carregar lista de usuÃ¡rios.' });
  }
});

// 7. ExportaÃ§Ã£o CSV da Matriz Epi
app.get('/api/admin/export', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const users = await getAllUsersWithLspcStats();

    let csvContent = 'ID;Nome;Email;Codigo;Patrocinador;No_Posicionamento_Derrame;Ciclo;Reembolso_60_USD;Maestros_3;Lideres_9;Ayudantes_27;Total_Plataforma_39;Data\n';

    users.forEach(u => {
      const dateFormatted = new Date(u.created_at).toLocaleDateString('pt-BR');
      const row = [
        u.id,
        `"${u.name}"`,
        `"${u.email}"`,
        u.referral_code,
        `"${u.sponsor_name || 'Nenhum'}"`,
        `"${u.placement_name || 'Nenhum'}"`,
        `"${u.current_cycle}"`,
        u.fee_refunded ? 'LIBERADO ($US 60)' : 'PENDENTE (Falta 3 Maestros)',
        u.maestros_count,
        u.lideres_count,
        u.ayudantes_count,
        u.total_matrix,
        dateFormatted
      ].join(';');

      csvContent += row + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=matriz_epi_afiliados.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    res.status(500).json({ error: 'Erro ao gerar CSV.' });
  }
});

// 8. Cadastro Manual de UsuÃ¡rios pelo Administrador
app.post('/api/admin/register-user', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { name, email, password, sponsorIdentifier, targetLeg } = req.body;

    if (!name || !email || !password || !sponsorIdentifier) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios (nome, e-mail, senha e patrocinador).' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail jÃ¡ estÃ¡ cadastrado no sistema.' });
    }

    const sponsor = await findUserByIdentifier(sponsorIdentifier);
    if (!sponsor) {
      return res.status(400).json({ error: 'Patrocinador selecionado nÃ£o foi encontrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode(name);

    const newUser = await createUserLspc({
      name,
      email,
      passwordHash,
      referralCode,
      sponsorId: sponsor.id,
      targetLeg: targetLeg || 'auto'
    });

    res.status(201).json({
      message: `Novo membro "${name}" cadastrado com sucesso vinculando a "${sponsor.name}"!`,
      user: newUser
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuÃ¡rio pelo Admin:', error);
    res.status(500).json({ error: 'Erro interno ao processar o cadastro manual.' });
  }
});

// 9. Alterar Perfil/Role do UsuÃ¡rio (Admin / User)
app.patch('/api/admin/users/:id/role', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Perfil invÃ¡lido. Deve ser "admin" ou "user".' });
    }

    if (userId === 1 || userId === req.user.id) {
      if (role === 'user') {
        return res.status(400).json({ error: 'NÃ£o Ã© possÃ­vel remover as permissÃµes do Administrador Raiz principal.' });
      }
    }

    const updatedUser = await updateUserRole(userId, role);
    
    // Registrar log de auditoria
    await createAuditLog({
      adminUserId: req.user.id,
      adminName: req.user.name,
      action: 'role_change',
      targetUserId: userId,
      targetUserName: updatedUser.name,
      details: `Rol cambiado de "${updatedUser.role === 'admin' ? 'user' : 'admin'}" a "${role}"`,
      ipAddress: req.ip
    });

    res.json({
      message: `Perfil do usuÃ¡rio #${userId} alterado para "${role}" com sucesso!`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao alterar perfil do usuÃ¡rio:', error);
    res.status(500).json({ error: 'Erro ao alterar perfil do usuÃ¡rio.' });
  }
});

// 10. Redefinir Senha do UsuÃ¡rio pelo Administrador
app.post('/api/admin/users/:id/reset-password', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'A nova senha deve conter pelo menos 6 caracteres.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(userId, passwordHash);

    // Registrar log de auditoria
    const { data: targetUser } = await supabase.from('users').select('name').eq('id', userId).single();
    await createAuditLog({
      adminUserId: req.user.id,
      adminName: req.user.name,
      action: 'password_reset',
      targetUserId: userId,
      targetUserName: targetUser?.name || `Usuario #${userId}`,
      details: 'Contraseña redefinida por administrador',
      ipAddress: req.ip
    });

    res.json({ message: `Senha do usuário #${userId} redefinida com sucesso!` });
  } catch (error) {
    console.error('Erro ao redefinir senha pelo admin:', error);
    res.status(500).json({ error: 'Erro interno ao redefinir a senha do usuÃ¡rio.' });
  }
});

// 11. RedefiniÃ§Ã£o de Senha pelo PrÃ³prio UsuÃ¡rio (RecuperaÃ§Ã£o no Login)
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Informe o e-mail e a nova senha.' });
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Nenhuma conta encontrada com o e-mail informado.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(user.id, passwordHash);

    res.json({ message: 'Sua senha foi redefinida com sucesso! VocÃª jÃ¡ pode acessar sua conta.' });
  } catch (error) {
    console.error('Erro na redefiniÃ§Ã£o de senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir a senha.' });
  }
});

// ----------------------------------------------------
// ROTAS DE CARTEIRA DIGITAL E SAQUES PIX (WALLET)
// ----------------------------------------------------

// 12. Obter Carteira Digital do UsuÃ¡rio
app.get('/api/user/wallet', [authenticateToken, requireActiveAccount], async (req, res) => {
  try {
    const wallet = await getUserWallet(req.user.id);
    res.json({ wallet });
  } catch (error) {
    console.error('Erro ao buscar carteira digital:', error);
    res.status(500).json({ error: 'Erro ao carregar saldo da carteira.' });
  }
});

// 13. Solicitar Saque PIX
app.post('/api/user/withdraw', [authenticateToken, requireActiveAccount], async (req, res) => {
  try {
    const { amount, pixKey } = req.body;

    if (!amount || !pixKey) {
      return res.status(400).json({ error: 'Informe o valor do saque e a chave PIX.' });
    }

    const withdrawal = await requestWithdrawal(req.user.id, amount, pixKey);
    res.status(201).json({
      message: 'SolicitaÃ§Ã£o de saque PIX realizada com sucesso!',
      withdrawal
    });
  } catch (error) {
    console.error('Erro ao solicitar saque PIX:', error);
    res.status(400).json({ error: error.message || 'Erro ao processar solicitaÃ§Ã£o de saque.' });
  }
});

// 14. Listar Todos os Saques Pendentes e Processados (Admin)
app.get('/api/admin/withdrawals', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const withdrawals = await getAllWithdrawals();
    res.json({ withdrawals });
  } catch (error) {
    console.error('Erro ao listar saques para admin:', error);
    res.status(500).json({ error: 'Erro ao carregar solicitaÃ§Ãµes de saque.' });
  }
});

// 15. Processar Saque PIX (Aprovar ou Rejeitar)
app.patch('/api/admin/withdrawals/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.id, 10);
    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'AÃ§Ã£o invÃ¡lida. Escolha "approve" ou "reject".' });
    }

    const result = await processWithdrawal(withdrawalId, action);
    res.json(result);

    // Enviar email de notificação sobre status do saque (async)
    if (result.withdrawal) {
      const w = result.withdrawal;
      findUserByIdentifier(w.user_id?.toString()).then(user => {
        if (user) {
          sendWithdrawStatusEmail(user, w, action === 'approve' ? 'approved' : 'rejected').catch(
            err => console.error('[Email] Erro notificação withdraw:', err.message)
          );
        }
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Erro ao processar saque:', error);
    res.status(400).json({ error: error.message || 'Erro ao processar saque.' });
  }
});

// 16. Alterar Status de AtivaÃ§Ã£o Mensal do Afiliado (Admin)
app.patch('/api/admin/users/:id/active', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { isActive } = req.body;

    const updated = await setUserActiveStatus(userId, Boolean(isActive));

    // Registrar log de auditoria
    await createAuditLog({
      adminUserId: req.user.id,
      adminName: req.user.name,
      action: isActive ? 'account_activated' : 'account_deactivated',
      targetUserId: userId,
      targetUserName: updated.name,
      details: `Conta ${isActive ? 'ativada' : 'desativada'} pelo administrador`,
      ipAddress: req.ip
    });

    res.json({
      message: `Status de ativação do usuário #${userId} alterado para "${updated.is_active ? 'ATIVO' : 'INATIVO'}"!`,
      user: updated
    });
  } catch (error) {
    console.error('Erro ao alterar ativação do usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar ativação mensal.' });
  }
});

// ----------------------------------------------------
// ROTAS DO MÓDULO LMS (CURSOS, AULAS E ÁREA DE MEMBROS)
// ----------------------------------------------------

// Logs de Auditoria (Admin)
app.get('/api/admin/audit-logs', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const logs = await getAuditLogs(100);
    res.json({ logs });
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error.message);
    res.status(500).json({ error: 'Erro ao carregar logs.' });
  }
});

// 17. Listar Cursos Liberados para o Afiliado
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await getCourses(false);
    res.json({ courses });
  } catch (error) {
    console.error('Erro ao listar cursos LMS:', error);
    res.status(500).json({ error: 'Erro ao carregar catÃ¡logo de cursos.' });
  }
});

// 18. Obter Estrutura Completa do Curso e Aulas (Com Trava de AtivaÃ§Ã£o)
app.get('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const currentUser = await findUserByEmail(req.user.email);
    const course = await getCourseDetails(courseId);
    const completedLessons = await getUserCompletedLessons(req.user.id);

    const isActiveUser = currentUser && currentUser.is_active !== false;

    // Se o usuÃ¡rio estiver INATIVO, bloqueia os links de vÃ­deo
    if (!isActiveUser) {
      course.modules.forEach(m => {
        m.lessons.forEach(l => {
          l.video_url = null; // Remove link do vÃ­deo para usuÃ¡rios inativos
        });
      });
    }

    res.json({
      course,
      completed_lessons: completedLessons,
      is_active_user: isActiveUser
    });
  } catch (error) {
    console.error('Erro ao carregar detalhes do curso LMS:', error);
    res.status(404).json({ error: error.message || 'Curso nÃ£o encontrado.' });
  }
});

// 19. Marcar / Desmarcar Aula como ConcluÃ­da
app.post('/api/user/lessons/:id/complete', authenticateToken, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const result = await toggleLessonProgress(req.user.id, lessonId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao salvar progresso da aula:', error);
    res.status(500).json({ error: 'Erro ao atualizar conclusÃ£o da aula.' });
  }
});

// --- ROTAS DE GESTÃƒO DO ADMIN (CRUD DE CURSOS, MÃ“DULOS E AULAS) ---

// 20. Listar Todos os Cursos (Admin)
app.get('/api/admin/courses', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const courses = await getCourses(true);
    res.json({ courses });
  } catch (error) {
    console.error('Erro ao listar cursos para admin:', error);
    res.status(500).json({ error: 'Erro ao carregar cursos para gestÃ£o.' });
  }
});

// 21. Criar Novo Curso (Admin)
app.post('/api/admin/courses', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { title, description, thumbnail_url, is_published } = req.body;
    if (!title) return res.status(400).json({ error: 'O tÃ­tulo do curso Ã© obrigatÃ³rio.' });

    const newCourse = await createCourse({ title, description, thumbnail_url, is_published });
    res.status(201).json({ message: 'Curso criado com sucesso!', course: newCourse });
  } catch (error) {
    console.error('Erro ao criar curso:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar curso.' });
  }
});

// 22. Editar Curso (Admin)
app.put('/api/admin/courses/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const { title, description, thumbnail_url, is_published } = req.body;
    const updated = await updateCourse(courseId, { title, description, thumbnail_url, is_published });
    res.json({ message: 'Curso atualizado com sucesso!', course: updated });
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar curso.' });
  }
});

// 23. Excluir Curso (Admin)
app.delete('/api/admin/courses/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    await deleteCourse(courseId);
    res.json({ message: 'Curso excluÃ­do com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir curso:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir curso.' });
  }
});

// 24. Criar MÃ³dulo no Curso (Admin)
app.post('/api/admin/modules', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { course_id, title, order_index } = req.body;
    if (!course_id || !title) return res.status(400).json({ error: 'Curso e tÃ­tulo do mÃ³dulo sÃ£o obrigatÃ³rios.' });

    const newModule = await createModule({ course_id, title, order_index: parseInt(order_index, 10) || 1 });
    res.status(201).json({ message: 'MÃ³dulo adicionado com sucesso!', module: newModule });
  } catch (error) {
    console.error('Erro ao criar mÃ³dulo:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar mÃ³dulo.' });
  }
});

// 25. Excluir MÃ³dulo (Admin)
app.delete('/api/admin/modules/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id, 10);
    await deleteModule(moduleId);
    res.json({ message: 'MÃ³dulo excluÃ­do com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir mÃ³dulo:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir mÃ³dulo.' });
  }
});

// 26. Criar Aula no MÃ³dulo (Admin)
app.post('/api/admin/lessons', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    console.log('DEBUG: Recebendo requisiÃ§Ã£o POST /api/admin/lessons');
    console.log('DEBUG: body:', req.body);
    const { module_id, title, description, video_url, duration, order_index } = req.body;
    if (!module_id || !title || !video_url) {
      console.log('ERRO: ValidaÃ§Ã£o falhou. body:', req.body);
      return res.status(400).json({ error: 'MÃ³dulo, tÃ­tulo e link do vÃ­deo sÃ£o obrigatÃ³rios.' });
    }

    const newLesson = await createLesson({
      module_id: parseInt(module_id, 10),
      title,
      description,
      video_url,
      duration: duration || '10:00',
      order_index: parseInt(order_index, 10) || 1
    });

    res.status(201).json({ message: 'Aula cadastrada com sucesso!', lesson: newLesson });
  } catch (error) {
    console.error('Erro ao criar aula:', error);
    res.status(500).json({ error: error.message || 'Erro ao cadastrar aula.' });
  }
});

// 27. Excluir Aula (Admin)
app.delete('/api/admin/lessons/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    await deleteLesson(lessonId);
    res.json({ message: 'Aula excluÃ­da com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir aula:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir aula.' });
  }
});

// 28. Criar Quiz (Admin)
app.post('/api/admin/quizzes', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { module_id, title, passing_score } = req.body;
    const quiz = await createQuiz({ module_id, title, passing_score });
    res.status(201).json({ message: 'Quiz criado!', quiz });
  } catch (error) {
    console.error('Erro ao criar quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// 29. Adicionar Pergunta ao Quiz (Admin)
app.post('/api/admin/quizzes/:id/questions', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { question_text, correct_option_index, options } = req.body;
    const question = await addQuestion({ quiz_id: req.params.id, question_text, correct_option_index, options });
    res.status(201).json({ message: 'Pergunta adicionada!', question });
  } catch (error) {
    console.error('Erro ao adicionar pergunta:', error);
    res.status(500).json({ error: error.message });
  }
});

// 31. Listar Quizzes de um MÃ³dulo
app.get('/api/modules/:id/quizzes', authenticateToken, async (req, res) => {
  try {
    const quizzes = await getQuizzesByModule(req.params.id);
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 32. Deletar Quiz (Admin)
app.delete('/api/admin/quizzes/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    await deleteQuiz(req.params.id);
    res.json({ message: 'Quiz excluÃ­do!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 33. Deletar Pergunta (Admin)
app.delete('/api/admin/questions/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    await deleteQuestion(req.params.id);
    res.json({ message: 'Pergunta excluÃ­da!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 34. Submeter Quiz
app.post('/api/quizzes/:id/submit', authenticateToken, async (req, res) => {
  try {
    const attempt = await submitQuizAttempt(req.user.id, req.params.id, req.body.answers);
    res.json({ attempt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 36. Verificar ConclusÃ£o e Gerar Dados do Certificado
app.get('/api/user/courses/:id/certificate', [authenticateToken, requireActiveAccount], async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const user = await findUserByEmail(req.user.email);
    const isCompleted = await checkCourseCompletion(userId, courseId);

    if (!isCompleted) {
      return res.status(403).json({ error: 'Curso ainda nÃ£o concluÃ­do.' });
    }

    const courseDetails = await getCourseDetails(courseId);

    res.json({
      certificate: {
        student_name: user.name,
        course_title: courseDetails.title,
        date: new Date().toLocaleDateString('pt-BR'),
        verifiable_hash: Buffer.from(`${user.email}-${courseId}-${new Date().toISOString()}`).toString('base64').slice(0, 16)
      }
    });
  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    res.status(500).json({ error: 'Erro ao gerar certificado.' });
  }
});




// ----------------------------------------------------
// ROTAS DE CICLOS PROGRESSIVOS E UPGRADES
// ----------------------------------------------------

// 37. Listar todos os ciclos
app.get('/api/cycles', authenticateToken, async (req, res) => {
  try {
    const cycles = await getAllCycles();
    res.json({ cycles });
  } catch (error) {
    console.error('Erro ao listar ciclos:', error);
    res.status(500).json({ error: 'Erro ao carregar ciclos.' });
  }
});

// 38. Progresso de ciclos do usuÃ¡rio
app.get('/api/user/cycles', [authenticateToken, requireActiveAccount], async (req, res) => {
  try {
    const progress = await getUserCycleProgress(req.user.id);
    const { data: user } = await supabase
      .from('users')
      .select('current_cycle_id, current_cycle')
      .eq('id', req.user.id)
      .single();

    const currentCycle = user ? await getCycleById(user.current_cycle_id || 1) : null;
    const nextCycle = currentCycle ? await getCycleById(currentCycle.id + 1) : null;

    res.json({
      current_cycle: currentCycle,
      next_cycle: nextCycle,
      progress
    });
  } catch (error) {
    console.error('Erro ao buscar ciclos do usuÃ¡rio:', error);
    res.status(500).json({ error: 'Erro ao carregar progresso de ciclos.' });
  }
});

// 39. Solicitar upgrade de ciclo
app.post('/api/user/upgrade', [authenticateToken, requireActiveAccount], async (req, res) => {
  try {
    const { cycleId } = req.body;
    if (!cycleId) return res.status(400).json({ error: 'Informe o ciclo alvo.' });

    const result = await processUpgrade(req.user.id, cycleId);
    res.json({ message: `Upgrade para ${result.cycle.display_name} realizado com sucesso!`, cycle: result.cycle });
  } catch (error) {
    console.error('Erro ao processar upgrade:', error);
    res.status(400).json({ error: error.message || 'Erro ao processar upgrade.' });
  }
});

// 40. Extrato de transaÃ§Ãµes do usuÃ¡rio
app.get('/api/user/transactions', [authenticateToken, requireActiveAccount], async (req, res) => {
  try {
    const transactions = await getUserTransactions(req.user.id, 50);
    res.json({ transactions });
  } catch (error) {
    console.error('Erro ao buscar transaÃ§Ãµes:', error);
    res.status(500).json({ error: 'Erro ao carregar extrato.' });
  }
});

// 41. Envios do usuÃ¡rio
app.get('/api/user/shipments', [authenticateToken, requireActiveAccount], async (req, res) => {
  try {
    const shipments = await getUserShipments(req.user.id);
    res.json({ shipments });
  } catch (error) {
    console.error('Erro ao buscar envios:', error);
    res.status(500).json({ error: 'Erro ao carregar envios.' });
  }
});

// 42. Dashboard expandido do usuÃ¡rio
app.get('/api/user/dashboard-full', [authenticateToken, requireActiveAccount], async (req, res) => {
  try {
    const data = await getUserDashboardData(req.user.id);
    if (!data) return res.status(404).json({ error: 'UsuÃ¡rio nÃ£o encontrado.' });
    res.json(data);
  } catch (error) {
    console.error('Erro ao carregar dashboard completo:', error);
    res.status(500).json({ error: 'Erro ao carregar dashboard.' });
  }
});

// --- ROTAS ADMIN DE CICLOS ---

// 43. Listar todos os ciclos (admin)
app.get('/api/admin/cycles', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const cycles = await getAllCycles();
    res.json({ cycles });
  } catch (error) {
    console.error('Erro ao listar ciclos admin:', error);
    res.status(500).json({ error: 'Erro ao carregar ciclos.' });
  }
});

// 43b. Atualizar todos os ciclos em massa (DEVE vir ANTES de /cycles/:id)
app.put('/api/admin/cycles/bulk', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { cycles } = req.body;
    if (!Array.isArray(cycles)) return res.status(400).json({ error: 'Formato inválido.' });

    for (const c of cycles) {
      if (!c.id) continue;
      const updates = {};
      if (c.name !== undefined) updates.name = c.name;
      if (c.display_name !== undefined) updates.display_name = c.display_name;
      if (c.price !== undefined) updates.price = c.price;
      if (c.bonus_per_referral !== undefined) updates.bonus_per_referral = c.bonus_per_referral;
      if (c.refund_amount !== undefined) updates.refund_amount = c.refund_amount;
      if (c.description !== undefined) updates.description = c.description;
      if (Object.keys(updates).length > 0) {
        await supabase.from('cycles').update(updates).eq('id', c.id);
      }
    }
    res.json({ message: 'Configurações atualizadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações.' });
  }
});

// 44. Atualizar ciclo individual (admin)
app.put('/api/admin/cycles/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const cycleId = parseInt(req.params.id, 10);
    const { price, bonus_per_referral, refund_amount, description, is_active } = req.body;
    const updates = {};
    if (price !== undefined) updates.price = price;
    if (bonus_per_referral !== undefined) updates.bonus_per_referral = bonus_per_referral;
    if (refund_amount !== undefined) updates.refund_amount = refund_amount;
    if (description !== undefined) updates.description = description;
    if (is_active !== undefined) updates.is_active = is_active;

    const updated = await updateCycle(cycleId, updates);
    res.json({ message: 'Ciclo atualizado com sucesso!', cycle: updated });
  } catch (error) {
    console.error('Erro ao atualizar ciclo:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar ciclo.' });
  }
});

// 45. Todas as transaÃ§Ãµes (admin)
app.get('/api/admin/transactions', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const transactions = await getAllTransactions(200);
    res.json({ transactions });
  } catch (error) {
    console.error('Erro ao listar transaÃ§Ãµes admin:', error);
    res.status(500).json({ error: 'Erro ao carregar transaÃ§Ãµes.' });
  }
});

// 46. Todos os envios (admin)
app.get('/api/admin/shipments', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const shipments = await getAllShipments();
    res.json({ shipments });
  } catch (error) {
    console.error('Erro ao listar envios admin:', error);
    res.status(500).json({ error: 'Erro ao carregar envios.' });
  }
});

// 47. Atualizar status de envio (admin)
app.patch('/api/admin/shipments/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const shipmentId = parseInt(req.params.id, 10);
    const { status, tracking_code } = req.body;
    if (!status || !['pending', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'Status invÃ¡lido.' });
    }
    const updated = await updateShipmentStatus(shipmentId, status, tracking_code);
    res.json({ message: 'Envio atualizado!', shipment: updated });
  } catch (error) {
    console.error('Erro ao atualizar envio:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar envio.' });
  }
});

// ----------------------------------------------------
// WEBHOOK HOTMART â€” Pagamento Aprovado
// ----------------------------------------------------
app.post('/api/webhooks/hotmart', async (req, res) => {
  try {
    // 1. Validar assinatura HMAC-SHA256
    const hotmartSecret = process.env.HOTMART_SECRET;
    if (hotmartSecret && req.headers['x-hotmart-hmac-sha256']) {
      const hmac = crypto.createHmac('sha256', hotmartSecret);
      hmac.update(req.rawBody || JSON.stringify(req.body));
      const digest = hmac.digest('base64');

      if (digest !== req.headers['x-hotmart-hmac-sha256']) {
        console.warn('âš ï¸ [Hotmart Webhook] Assinatura HMAC invÃ¡lida. Rejeitando.');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // 2. Extrair dados do payload
    const { event, data } = req.body;

    if (!event || !data) {
      return res.status(400).json({ error: 'Payload invÃ¡lido: event e data sÃ£o obrigatÃ³rios.' });
    }

    console.log(`ðŸ“¬ [Hotmart Webhook] Evento recebido: ${event}`);

    // 3. Processar apenas pagamento aprovado
    if (event !== 'PURCHASE_APPROVED') {
      console.log(`â„¹ï¸ [Hotmart Webhook] Evento ignorado: ${event}`);
      return res.status(200).json({ message: 'Evento ignorado.' });
    }

    const buyerEmail = data.buyer?.email;
    const buyerName = data.buyer?.name;
    const productId = data.product?.id;

    if (!buyerEmail || !productId) {
      console.error('âŒ [Hotmart Webhook] Dados incompletos:', { buyerEmail, productId });
      return res.status(400).json({ error: 'Dados do comprador ou produto incompletos.' });
    }

    // 4. Processar a compra
    const result = await processHotmartPurchase({
      buyerEmail: buyerEmail.toLowerCase().trim(),
      buyerName,
      productId: String(productId)
    });

    if (!result.success) {
      console.error(`âŒ [Hotmart Webhook] Falha ao processar: ${result.reason}`);
      return res.status(200).json({ message: 'Webhook received but not processed.', reason: result.reason });
    }

    console.log(`âœ… [Hotmart Webhook] Compra processada: ${buyerEmail} â†’ Ciclo ${result.cycle}`);
    return res.status(200).json({ message: 'Purchase processed successfully.', cycle: result.cycle });

  } catch (error) {
    console.error('âŒ [Hotmart Webhook] Erro interno:', error);
    return res.status(200).json({ message: 'Webhook received with error.' });
  }
});

// ----------------------------------------------------
// ADMIN: EXPIRAÇÃO DE CONTAS INATIVAS
// ----------------------------------------------------
app.post('/api/admin/expire-accounts', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { days } = req.body;
    const result = await deactivateInactiveAccounts(days || 90);
    res.json({ message: `${result.deactivated} contas expiradas.`, ...result });
  } catch (error) {
    console.error('Erro ao expirar contas:', error);
    res.status(500).json({ error: 'Erro ao processar expiração de contas.' });
  }
});

// ----------------------------------------------------
// ADMIN: DASHBOARD COM MÉTRICAS
// ----------------------------------------------------
app.get('/api/admin/metrics', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { data: allUsers, error: errU } = await supabase.from('users').select('id, created_at, role, is_active, account_status, registration_fee, fee_refunded');
    if (errU) console.error('[Metrics] users error:', errU.message);

    const { data: allTransactions, error: errT } = await supabase.from('transactions').select('id, type, amount, created_at, status');
    if (errT) console.error('[Metrics] transactions error:', errT.message);

    const { data: allWithdrawals, error: errW } = await supabase.from('withdrawals').select('id, amount, status, created_at');
    if (errW) console.error('[Metrics] withdrawals error:', errW.message);

    const { data: allUserCycles, error: errUC } = await supabase.from('user_cycles').select('id, cycle_id, created_at');
    if (errUC) console.error('[Metrics] user_cycles error:', errUC.message);

    const { data: allCourses, error: errC } = await supabase.from('courses').select('id');
    if (errC) console.error('[Metrics] courses error:', errC.message);

    const users = allUsers || [];
    const txs = allTransactions || [];
    const withdrawals = allWithdrawals || [];
    const userCycles = allUserCycles || [];

    const totalUsers = users.filter(u => u.role === 'user').length;
    const activeUsers = users.filter(u => u.is_active !== false && u.role === 'user').length;
    const pendingUsers = users.filter(u => u.account_status === 'pending').length;
    const refundedUsers = users.filter(u => u.fee_refunded).length;

    const totalRevenue = txs.filter(t => t.type === 'cycle_purchase' && t.status === 'completed').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const totalCommissions = txs.filter(t => t.type === 'direct_commission' && t.status === 'completed').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const totalRefunds = txs.filter(t => t.type === 'refund' && t.status === 'completed').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + parseFloat(w.amount || 0), 0);

    const now = new Date();
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const newUsers = users.filter(u => { const cd = new Date(u.created_at); return cd >= d && cd < nextMonth && u.role === 'user'; }).length;
      const revenue = txs.filter(t => { const cd = new Date(t.created_at); return cd >= d && cd < nextMonth && t.type === 'cycle_purchase' && t.status === 'completed'; }).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
      const cyclesCompleted = userCycles.filter(uc => { const cd = new Date(uc.created_at); return cd >= d && cd < nextMonth; }).length;
      monthlyGrowth.push({ month: label, newUsers, revenue: Math.round(revenue), cyclesCompleted });
    }

    let cycles = [];
    try { cycles = await getAllCycles(); } catch (e) { console.error('[Metrics] getAllCycles error:', e.message); }
    const cycleDistribution = cycles.map(c => ({
      name: c.display_name,
      count: userCycles.filter(uc => uc.cycle_id === c.id).length,
      price: c.price
    }));

    console.log('[Metrics] OK - users:', users.length, 'txs:', txs.length, 'withdrawals:', withdrawals.length);

    res.json({
      overview: { totalUsers, activeUsers, pendingUsers, refundedUsers, totalCourses: (allCourses || []).length },
      financial: { totalRevenue, totalCommissions, totalRefunds, pendingWithdrawals },
      monthlyGrowth,
      cycleDistribution
    });
  } catch (error) {
    console.error('Erro ao carregar métricas:', error);
    res.status(500).json({ error: 'Erro ao carregar métricas: ' + error.message });
  }
});

// ----------------------------------------------------
// ADMIN: RELATÓRIO DE COMISSÕES
// ----------------------------------------------------
app.get('/api/admin/commissions', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { data: users } = await supabase.from('users').select('id, name, email, referral_code, sponsor_id').eq('role', 'user');
    const { data: txs } = await supabase.from('transactions').select('id, user_id, to_user_id, type, amount, created_at, description, status').in('type', ['direct_commission', 'refund']);

    const commissionReport = (users || []).map(u => {
      const earned = (txs || []).filter(t => t.to_user_id === u.id && t.status === 'completed')
        .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
      const referralCount = (users || []).filter(us => us.sponsor_id === u.id).length;
      return { id: u.id, name: u.name, email: u.email, referral_code: u.referral_code, referralCount, totalEarned: Math.round(earned * 100) / 100 };
    }).sort((a, b) => b.totalEarned - a.totalEarned);

    res.json({ commissions: commissionReport });
  } catch (error) {
    console.error('Erro ao gerar relatório de comissões:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório.' });
  }
});

// ----------------------------------------------------
// ADMIN: ENVIO EM MASSA
// ----------------------------------------------------
app.post('/api/admin/broadcast', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ error: 'Assunto e mensagem são obrigatórios.' });

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(400).json({ error: 'SMTP não configurado no servidor. Configure SMTP_USER e SMTP_PASS no .env para enviar emails.' });
    }

    const { data: users } = await supabase.from('users').select('email, name').eq('is_active', true).eq('role', 'user');
    if (!users || users.length === 0) return res.json({ message: 'Nenhum usuário ativo encontrado.', sent: 0 });

    const { sendEmail } = require('./email');
    let sent = 0;
    let failed = 0;
    for (const user of users) {
      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:25px;border-radius:12px 12px 0 0;text-align:center;"><h1 style="color:white;margin:0;font-size:20px;">📢 Comunicado Epi Matriz 3x3</h1></div><div style="background:#1e1e2e;padding:25px;border-radius:0 0 12px 12px;color:#e2e8f0;"><p>Olá <strong>${user.name}</strong>,</p><div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;margin:15px 0;white-space:pre-wrap;">${message}</div><hr style="border-color:rgba(255,255,255,0.1);margin:20px 0;"><p style="font-size:12px;color:#94a3b8;">Epi Matriz 3x3 — Comunicado da Administração</p></div></div>`;
      try {
        const ok = await sendEmail(user.email, subject, html);
        if (ok) sent++; else failed++;
      } catch (e) { failed++; }
    }
    res.json({ message: `Email enviado para ${sent} de ${users.length} afiliados${failed > 0 ? ` (${failed} falharam)` : ''}.`, sent, total: users.length, failed });
  } catch (error) {
    console.error('Erro no broadcast:', error);
    res.status(500).json({ error: 'Erro ao enviar emails: ' + error.message });
  }
});

// ----------------------------------------------------
// ADMIN: BACKUP / EXPORTAÇÃO
// ----------------------------------------------------
app.get('/api/admin/backup', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const [users, transactions, withdrawals, cycles, userCycles, courses, products, shipments, wallets] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('transactions').select('*'),
      supabase.from('withdrawals').select('*'),
      supabase.from('cycles').select('*'),
      supabase.from('user_cycles').select('*'),
      supabase.from('courses').select('*'),
      supabase.from('products').select('*'),
      supabase.from('shipments').select('*'),
      supabase.from('wallets').select('*')
    ]);

    const backup = {
      exported_at: new Date().toISOString(),
      tables: {
        users: users.data || [],
        transactions: transactions.data || [],
        withdrawals: withdrawals.data || [],
        cycles: cycles.data || [],
        user_cycles: userCycles.data || [],
        courses: courses.data || [],
        products: products.data || [],
        shipments: shipments.data || [],
        wallets: wallets.data || []
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="epi-backup-${new Date().toISOString().slice(0,10)}.json"`);
    res.json(backup);
  } catch (error) {
    console.error('Erro ao gerar backup:', error);
    res.status(500).json({ error: 'Erro ao gerar backup.' });
  }
});

// ----------------------------------------------------
// GESTIÓN DE PRODUCTOS FÍSICOS (CRUD Admin)
// ----------------------------------------------------

// Listar todos los productos
app.get('/api/admin/products', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*, cycle:cycles(name, display_name)')
      .order('id', { ascending: true });

    if (error) throw new Error(error.message);
    res.json({ products: products || [] });
  } catch (error) {
    console.error('Erro ao listar produtos:', error.message);
    res.status(500).json({ error: 'Erro ao carregar produtos.' });
  }
});

// Criar produto físico
app.post('/api/admin/products', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { cycle_id, name, description, sku, stock_quantity } = req.body;

    if (!cycle_id || !name) {
      return res.status(400).json({ error: 'Ciclo e nome do produto são obrigatórios.' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        cycle_id,
        name,
        description: description || '',
        sku: sku || '',
        stock_quantity: stock_quantity || 0,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.status(201).json({ message: 'Produto criado com sucesso!', product: data });
  } catch (error) {
    console.error('Erro ao criar produto:', error.message);
    res.status(500).json({ error: 'Erro ao criar produto.' });
  }
});

// Atualizar produto físico
app.put('/api/admin/products/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { cycle_id, name, description, sku, stock_quantity, is_active } = req.body;

    const updates = {};
    if (cycle_id !== undefined) updates.cycle_id = cycle_id;
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (sku !== undefined) updates.sku = sku;
    if (stock_quantity !== undefined) updates.stock_quantity = stock_quantity;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.json({ message: 'Produto atualizado com sucesso!', product: data });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

// Excluir produto físico
app.delete('/api/admin/products/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(error.message);

    res.json({ message: 'Produto excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error.message);
    res.status(500).json({ error: 'Erro ao excluir produto.' });
  }
});

// ----------------------------------------------------
// CATCH-ALL: Serve o React app para qualquer rota
// ----------------------------------------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});


// ----------------------------------------------------
// HANDLER GLOBAL DE ERROS (sempre retorna JSON)
// ----------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Erro nÃ£o tratado:', err);
  res.status(500).json({ error: 'Erro interno no servidor. Tente novamente mais tarde.' });
});

// Iniciar Servidor
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

app.listen(PORT, async () => {
  console.log("Servidor Matriz 3x3 Epi rodando na porta " + PORT);
  console.log("API endpoint: http://localhost:" + PORT + "/api");
  try {
    await initDb();
    await seedCycles();
    console.log("Banco de dados inicializado com sucesso!");
  } catch (err) {
    console.error("Banco de dados indisponivel. Servidor rodando sem DB:", err.message);
  }
});
