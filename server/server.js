const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
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
  seedCycles,
  checkMatrixCompletion,
  processHotmartPurchase,
  supabase
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'unilevel_secret_key_2026';

app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));
app.use(express.static(path.join(__dirname, '../dist')));

// Middleware JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
    req.user = user;
    next();
  });
}

// Middleware de Admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Acesso negado. Área exclusiva do Administrador Epi.' });
  }
}

// Helper para Gerar Código de Indicação
function generateReferralCode(name) {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName || 'Epi'}${randomNum}`;
}

// ----------------------------------------------------
// ROTAS DE AUTENTICAÇÃO E CADASTRO Epi
// ----------------------------------------------------

// 1. Validação de Patrocinador
app.get('/api/sponsor/validate/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const sponsor = await findUserByIdentifier(identifier);

    if (!sponsor) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Patrocinador Epi não encontrado. Verifique o código digitado.' 
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

// 2. Registro com Matriz Forçada 3x3 e Seleção de Perna (Derrame)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, sponsorIdentifier, targetLeg } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos (nome, e-mail e senha).' });
    }

    if (!sponsorIdentifier) {
      return res.status(400).json({ error: 'O código do Patrocinador Epi é obrigatório.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está registrado na plataforma Epi.' });
    }

    const sponsor = await findUserByIdentifier(sponsorIdentifier);
    if (!sponsor) {
      return res.status(400).json({ error: 'Patrocinador inválido. Não foi possível realizar o cadastro.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode(name);

    // Registro com alocação na perna escolhida (Esquerda, Centro, Direita ou Auto)
    const newUser = await createUserLspc({
      name,
      email,
      passwordHash,
      referralCode,
      sponsorId: sponsor.id,
      targetLeg: targetLeg || 'auto'
    });

    const userRole = 'user';
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Cadastro na Matriz Epi realizado com sucesso!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        referral_code: newUser.referralCode,
        sponsor_name: sponsor.name,
        role: userRole,
        registration_fee: 60.00,
        fee_refunded: false,
        current_cycle: 'Socio Bronce'
      }
    });
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
      return res.status(401).json({ error: 'E-mail não encontrado.' });
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
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(500).json({ error: 'Erro interno ao processar o login. Tente novamente.' });
  }
});

// ----------------------------------------------------
// ROTAS DO PAINEL DO USUÁRIO (DASHBOARD MATRIZ Epi)
// ----------------------------------------------------

// 4. Obter Estatísticas da Matriz 3x3 Fechada (39 Pessoas)
app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await findUserByEmail(req.user.email);

    if (!currentUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
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

// 5. Árvore da Matriz 3x3
app.get('/api/user/tree', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const tree = await getLspcTreeStructure(userId);
    res.json({ tree });
  } catch (error) {
    console.error('Erro ao carregar árvore Epi:', error);
    res.status(500).json({ error: 'Erro ao carregar estrutura da árvore.' });
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
    console.error('Erro ao listar usuários admin:', error);
    res.status(500).json({ error: 'Erro ao carregar lista de usuários.' });
  }
});

// 7. Exportação CSV da Matriz Epi
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

// 8. Cadastro Manual de Usuários pelo Administrador
app.post('/api/admin/register-user', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { name, email, password, sponsorIdentifier, targetLeg } = req.body;

    if (!name || !email || !password || !sponsorIdentifier) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios (nome, e-mail, senha e patrocinador).' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });
    }

    const sponsor = await findUserByIdentifier(sponsorIdentifier);
    if (!sponsor) {
      return res.status(400).json({ error: 'Patrocinador selecionado não foi encontrado.' });
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
    console.error('Erro ao cadastrar usuário pelo Admin:', error);
    res.status(500).json({ error: 'Erro interno ao processar o cadastro manual.' });
  }
});

// 9. Alterar Perfil/Role do Usuário (Admin / User)
app.patch('/api/admin/users/:id/role', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Perfil inválido. Deve ser "admin" ou "user".' });
    }

    if (userId === 1 || userId === req.user.id) {
      if (role === 'user') {
        return res.status(400).json({ error: 'Não é possível remover as permissões do Administrador Raiz principal.' });
      }
    }

    const updatedUser = await updateUserRole(userId, role);
    res.json({
      message: `Perfil do usuário #${userId} alterado para "${role}" com sucesso!`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao alterar perfil do usuário:', error);
    res.status(500).json({ error: 'Erro ao alterar perfil do usuário.' });
  }
});

// 10. Redefinir Senha do Usuário pelo Administrador
app.post('/api/admin/users/:id/reset-password', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'A nova senha deve conter pelo menos 4 caracteres.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(userId, passwordHash);

    res.json({ message: `Senha do usuário #${userId} redefinida com sucesso!` });
  } catch (error) {
    console.error('Erro ao redefinir senha pelo admin:', error);
    res.status(500).json({ error: 'Erro interno ao redefinir a senha do usuário.' });
  }
});

// 11. Redefinição de Senha pelo Próprio Usuário (Recuperação no Login)
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Informe o e-mail e a nova senha.' });
    }

    if (newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 4 caracteres.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Nenhuma conta encontrada com o e-mail informado.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(user.id, passwordHash);

    res.json({ message: 'Sua senha foi redefinida com sucesso! Você já pode acessar sua conta.' });
  } catch (error) {
    console.error('Erro na redefinição de senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir a senha.' });
  }
});

// ----------------------------------------------------
// ROTAS DE CARTEIRA DIGITAL E SAQUES PIX (WALLET)
// ----------------------------------------------------

// 12. Obter Carteira Digital do Usuário
app.get('/api/user/wallet', authenticateToken, async (req, res) => {
  try {
    const wallet = await getUserWallet(req.user.id);
    res.json({ wallet });
  } catch (error) {
    console.error('Erro ao buscar carteira digital:', error);
    res.status(500).json({ error: 'Erro ao carregar saldo da carteira.' });
  }
});

// 13. Solicitar Saque PIX
app.post('/api/user/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount, pixKey } = req.body;

    if (!amount || !pixKey) {
      return res.status(400).json({ error: 'Informe o valor do saque e a chave PIX.' });
    }

    const withdrawal = await requestWithdrawal(req.user.id, amount, pixKey);
    res.status(201).json({
      message: 'Solicitação de saque PIX realizada com sucesso!',
      withdrawal
    });
  } catch (error) {
    console.error('Erro ao solicitar saque PIX:', error);
    res.status(400).json({ error: error.message || 'Erro ao processar solicitação de saque.' });
  }
});

// 14. Listar Todos os Saques Pendentes e Processados (Admin)
app.get('/api/admin/withdrawals', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const withdrawals = await getAllWithdrawals();
    res.json({ withdrawals });
  } catch (error) {
    console.error('Erro ao listar saques para admin:', error);
    res.status(500).json({ error: 'Erro ao carregar solicitações de saque.' });
  }
});

// 15. Processar Saque PIX (Aprovar ou Rejeitar)
app.patch('/api/admin/withdrawals/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.id, 10);
    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Ação inválida. Escolha "approve" ou "reject".' });
    }

    const result = await processWithdrawal(withdrawalId, action);
    res.json(result);
  } catch (error) {
    console.error('Erro ao processar saque:', error);
    res.status(400).json({ error: error.message || 'Erro ao processar saque.' });
  }
});

// 16. Alterar Status de Ativação Mensal do Afiliado (Admin)
app.patch('/api/admin/users/:id/active', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { isActive } = req.body;

    const updated = await setUserActiveStatus(userId, Boolean(isActive));
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

// 17. Listar Cursos Liberados para o Afiliado
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await getCourses(false);
    res.json({ courses });
  } catch (error) {
    console.error('Erro ao listar cursos LMS:', error);
    res.status(500).json({ error: 'Erro ao carregar catálogo de cursos.' });
  }
});

// 18. Obter Estrutura Completa do Curso e Aulas (Com Trava de Ativação)
app.get('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const currentUser = await findUserByEmail(req.user.email);
    const course = await getCourseDetails(courseId);
    const completedLessons = await getUserCompletedLessons(req.user.id);

    const isActiveUser = currentUser && currentUser.is_active !== false;

    // Se o usuário estiver INATIVO, bloqueia os links de vídeo
    if (!isActiveUser) {
      course.modules.forEach(m => {
        m.lessons.forEach(l => {
          l.video_url = null; // Remove link do vídeo para usuários inativos
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
    res.status(404).json({ error: error.message || 'Curso não encontrado.' });
  }
});

// 19. Marcar / Desmarcar Aula como Concluída
app.post('/api/user/lessons/:id/complete', authenticateToken, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const result = await toggleLessonProgress(req.user.id, lessonId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao salvar progresso da aula:', error);
    res.status(500).json({ error: 'Erro ao atualizar conclusão da aula.' });
  }
});

// --- ROTAS DE GESTÃO DO ADMIN (CRUD DE CURSOS, MÓDULOS E AULAS) ---

// 20. Listar Todos os Cursos (Admin)
app.get('/api/admin/courses', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const courses = await getCourses(true);
    res.json({ courses });
  } catch (error) {
    console.error('Erro ao listar cursos para admin:', error);
    res.status(500).json({ error: 'Erro ao carregar cursos para gestão.' });
  }
});

// 21. Criar Novo Curso (Admin)
app.post('/api/admin/courses', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { title, description, thumbnail_url, is_published } = req.body;
    if (!title) return res.status(400).json({ error: 'O título do curso é obrigatório.' });

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
    res.json({ message: 'Curso excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir curso:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir curso.' });
  }
});

// 24. Criar Módulo no Curso (Admin)
app.post('/api/admin/modules', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { course_id, title, order_index } = req.body;
    if (!course_id || !title) return res.status(400).json({ error: 'Curso e título do módulo são obrigatórios.' });

    const newModule = await createModule({ course_id, title, order_index: parseInt(order_index, 10) || 1 });
    res.status(201).json({ message: 'Módulo adicionado com sucesso!', module: newModule });
  } catch (error) {
    console.error('Erro ao criar módulo:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar módulo.' });
  }
});

// 25. Excluir Módulo (Admin)
app.delete('/api/admin/modules/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id, 10);
    await deleteModule(moduleId);
    res.json({ message: 'Módulo excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir módulo:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir módulo.' });
  }
});

// 26. Criar Aula no Módulo (Admin)
app.post('/api/admin/lessons', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    console.log('DEBUG: Recebendo requisição POST /api/admin/lessons');
    console.log('DEBUG: body:', req.body);
    const { module_id, title, description, video_url, duration, order_index } = req.body;
    if (!module_id || !title || !video_url) {
      console.log('ERRO: Validação falhou. body:', req.body);
      return res.status(400).json({ error: 'Módulo, título e link do vídeo são obrigatórios.' });
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
    res.json({ message: 'Aula excluída com sucesso!' });
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

// 31. Listar Quizzes de um Módulo
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
    res.json({ message: 'Quiz excluído!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 33. Deletar Pergunta (Admin)
app.delete('/api/admin/questions/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    await deleteQuestion(req.params.id);
    res.json({ message: 'Pergunta excluída!' });
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

// 36. Verificar Conclusão e Gerar Dados do Certificado
app.get('/api/user/courses/:id/certificate', authenticateToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const user = await findUserByEmail(req.user.email);
    const isCompleted = await checkCourseCompletion(userId, courseId);

    if (!isCompleted) {
      return res.status(403).json({ error: 'Curso ainda não concluído.' });
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

// 38. Progresso de ciclos do usuário
app.get('/api/user/cycles', authenticateToken, async (req, res) => {
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
    console.error('Erro ao buscar ciclos do usuário:', error);
    res.status(500).json({ error: 'Erro ao carregar progresso de ciclos.' });
  }
});

// 39. Solicitar upgrade de ciclo
app.post('/api/user/upgrade', authenticateToken, async (req, res) => {
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

// 40. Extrato de transações do usuário
app.get('/api/user/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await getUserTransactions(req.user.id, 50);
    res.json({ transactions });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao carregar extrato.' });
  }
});

// 41. Envios do usuário
app.get('/api/user/shipments', authenticateToken, async (req, res) => {
  try {
    const shipments = await getUserShipments(req.user.id);
    res.json({ shipments });
  } catch (error) {
    console.error('Erro ao buscar envios:', error);
    res.status(500).json({ error: 'Erro ao carregar envios.' });
  }
});

// 42. Dashboard expandido do usuário
app.get('/api/user/dashboard-full', authenticateToken, async (req, res) => {
  try {
    const data = await getUserDashboardData(req.user.id);
    if (!data) return res.status(404).json({ error: 'Usuário não encontrado.' });
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

// 44. Atualizar ciclo (admin)
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

// 45. Todas as transações (admin)
app.get('/api/admin/transactions', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const transactions = await getAllTransactions(200);
    res.json({ transactions });
  } catch (error) {
    console.error('Erro ao listar transações admin:', error);
    res.status(500).json({ error: 'Erro ao carregar transações.' });
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
      return res.status(400).json({ error: 'Status inválido.' });
    }
    const updated = await updateShipmentStatus(shipmentId, status, tracking_code);
    res.json({ message: 'Envio atualizado!', shipment: updated });
  } catch (error) {
    console.error('Erro ao atualizar envio:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar envio.' });
  }
});

// ----------------------------------------------------
// WEBHOOK HOTMART — Pagamento Aprovado
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
        console.warn('⚠️ [Hotmart Webhook] Assinatura HMAC inválida. Rejeitando.');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // 2. Extrair dados do payload
    const { event, data } = req.body;

    if (!event || !data) {
      return res.status(400).json({ error: 'Payload inválido: event e data são obrigatórios.' });
    }

    console.log(`📬 [Hotmart Webhook] Evento recebido: ${event}`);

    // 3. Processar apenas pagamento aprovado
    if (event !== 'PURCHASE_APPROVED') {
      console.log(`ℹ️ [Hotmart Webhook] Evento ignorado: ${event}`);
      return res.status(200).json({ message: 'Evento ignorado.' });
    }

    const buyerEmail = data.buyer?.email;
    const buyerName = data.buyer?.name;
    const productId = data.product?.id;

    if (!buyerEmail || !productId) {
      console.error('❌ [Hotmart Webhook] Dados incompletos:', { buyerEmail, productId });
      return res.status(400).json({ error: 'Dados do comprador ou produto incompletos.' });
    }

    // 4. Processar a compra
    const result = await processHotmartPurchase({
      buyerEmail: buyerEmail.toLowerCase().trim(),
      buyerName,
      productId: String(productId)
    });

    if (!result.success) {
      console.error(`❌ [Hotmart Webhook] Falha ao processar: ${result.reason}`);
      return res.status(200).json({ message: 'Webhook received but not processed.', reason: result.reason });
    }

    console.log(`✅ [Hotmart Webhook] Compra processada: ${buyerEmail} → Ciclo ${result.cycle}`);
    return res.status(200).json({ message: 'Purchase processed successfully.', cycle: result.cycle });

  } catch (error) {
    console.error('❌ [Hotmart Webhook] Erro interno:', error);
    return res.status(200).json({ message: 'Webhook received with error.' });
  }
});

// ----------------------------------------------------
// HANDLER GLOBAL DE ERROS (sempre retorna JSON)
// ----------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno no servidor. Tente novamente mais tarde.' });
});

// Iniciar Servidor
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

initDb()
  .then(async () => {
    await seedCycles();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Matriz 3x3 Epi rodando na porta ${PORT}`);
      console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('Falha ao inicializar banco de dados:', err);
  });
