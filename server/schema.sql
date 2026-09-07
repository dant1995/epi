-- ==========================================================
-- BANCO DE DADOS SUPABASE / POSTGRESQL - PROJETO Epi 3x3
-- Matriz Forçada Fechada Base 3 — 5 Ciclos Progressivos
-- ==========================================================

-- 1. Tabela de Usuários Epi
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    referral_code VARCHAR(50) NOT NULL UNIQUE,
    sponsor_id INT REFERENCES public.users(id) ON DELETE SET NULL,
    placement_id INT REFERENCES public.users(id) ON DELETE SET NULL,
    position INT DEFAULT 1,
    role VARCHAR(20) DEFAULT 'user',
    registration_fee NUMERIC(10,2) DEFAULT 80.00,
    fee_refunded BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    current_cycle VARCHAR(50) DEFAULT 'Bronze',
    current_cycle_id INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS placement_id INT REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS position INT DEFAULT 1;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS registration_fee NUMERIC(10,2) DEFAULT 80.00;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fee_refunded BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_cycle VARCHAR(50) DEFAULT 'Bronze';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_cycle_id INT DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_users_sponsor_id ON public.users(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_users_placement_id ON public.users(placement_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

-- 2. Tabela de Ciclos Progressivos (5 níveis)
CREATE TABLE IF NOT EXISTS public.cycles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    description TEXT,
    product_type VARCHAR(20) DEFAULT 'digital',
    product_description TEXT,
    bonus_per_referral NUMERIC(10,2) DEFAULT 0,
    refund_amount NUMERIC(10,2) DEFAULT 0,
    order_index INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Ciclos do Usuário (progressão)
CREATE TABLE IF NOT EXISTS public.user_cycles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    cycle_id INT REFERENCES public.cycles(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'active',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, cycle_id)
);

-- 4. Tabela de Transações (ledger financeiro)
CREATE TABLE IF NOT EXISTS public.transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    cycle_id INT REFERENCES public.cycles(id),
    from_user_id INT REFERENCES public.users(id),
    to_user_id INT REFERENCES public.users(id),
    description TEXT,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Carteira Digital (Wallet)
CREATE TABLE IF NOT EXISTS public.wallets (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    balance NUMERIC(10,2) DEFAULT 0.00,
    pending_balance NUMERIC(10,2) DEFAULT 0.00,
    total_earned NUMERIC(10,2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Solicitações de Saque (Withdrawals)
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    pix_key VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 7. Tabela de Produtos Físicos
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    cycle_id INT REFERENCES public.cycles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(50),
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de Envios (Shipments)
CREATE TABLE IF NOT EXISTS public.shipments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    cycle_id INT REFERENCES public.cycles(id),
    product_id INT REFERENCES public.products(id),
    status VARCHAR(20) DEFAULT 'pending',
    tracking_code VARCHAR(100),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabela de Cursos (LMS)
CREATE TABLE IF NOT EXISTS public.courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    cycle_id INT REFERENCES public.cycles(id),
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabela de Módulos do Curso
CREATE TABLE IF NOT EXISTS public.modules (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tabela de Aulas (Lessons)
CREATE TABLE IF NOT EXISTS public.lessons (
    id SERIAL PRIMARY KEY,
    module_id INT REFERENCES public.modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    duration VARCHAR(50) DEFAULT '10:00',
    order_index INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tabela de Progresso de Aulas do Aluno
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- 13. Tabela de Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
    id SERIAL PRIMARY KEY,
    module_id INT REFERENCES public.modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score INT DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Tabela de Perguntas
CREATE TABLE IF NOT EXISTS public.questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    correct_option_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Tabela de Opções de Resposta
CREATE TABLE IF NOT EXISTS public.quiz_options (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL
);

-- 16. Tabela de Tentativas de Quiz
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    quiz_id INT REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score NUMERIC(5,2),
    passed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- DESABILITAR RLS PARA ACESSO DIRETO DA API NODE
-- ==========================================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cycles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;

-- ==========================================================
-- DADOS INICIAIS: 5 CICLOS PROGRESSIVOS
-- ==========================================================
INSERT INTO public.cycles (name, slug, display_name, price, description, product_type, product_description, bonus_per_referral, refund_amount, order_index)
VALUES
  ('Bronze', 'bronze', 'Socio Bronze', 80.00,
   'Curso Básico de Marketing Digital. Bônus de $US 20 por indicação direta. Reembolso de $US 60 ao completar 3 indicados.',
   'digital', 'Curso Básico de Marketing Digital',
   20.00, 60.00, 1),
  ('Prata', 'prata', 'Socio Prata', 100.00,
   'Módulo Intermediário/Avançado de Estratégias e Vendas.',
   'digital', 'Módulo Intermediário/Avançado de Estratégias e Vendas',
   0.00, 0.00, 2),
  ('Ouro', 'ouro', 'Socio Ouro', 500.00,
   'Kit Vitaminas/Suplementos + Módulo Master de Liderança. Liberação de produto físico.',
   'both', 'Kit de Vitaminas/Suplementos + Módulo Master de Liderança',
   0.00, 0.00, 3),
  ('Platino', 'platino', 'Socio Platino', 1000.00,
   'Linha Completa de Suplementos Avançados + Imersão Executiva Digital.',
   'both', 'Linha Completa de Suplementos + Imersão Executiva Digital',
   0.00, 0.00, 4),
  ('Diamante', 'diamante', 'Socio Diamante', 5000.00,
   'Kit Alta Performance + Conselho de Estratégia e Mentorias Vitalício.',
   'both', 'Kit Alta Performance + Conselho de Estratégia e Mentorias',
   0.00, 0.00, 5)
ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  bonus_per_referral = EXCLUDED.bonus_per_referral,
  refund_amount = EXCLUDED.refund_amount,
  description = EXCLUDED.description,
  product_type = EXCLUDED.product_type,
  product_description = EXCLUDED.product_description;

-- Produtos físicos iniciais
INSERT INTO public.products (cycle_id, name, description, sku, stock_quantity)
VALUES
  (3, 'Kit Vitaminas Exclusivas Epi', '复合维生素套装 — 30 dias de suplementação', 'EPI-VIT-001', 100),
  (4, 'Linha Completa Suplementos Epi', 'Whey Protein + Creatina + BCAA + Vitaminas', 'EPI-SUP-001', 50),
  (5, 'Kit Alta Performance Epi', 'Suplementos Premium + Equipamentos + Acesso VIP', 'EPI-HPC-001', 20)
ON CONFLICT DO NOTHING;

-- ==========================================================
-- FUNÇÃO RECURSIVA: Obter a Matriz Epi (3 Camadas)
-- ==========================================================
CREATE OR REPLACE FUNCTION public.get_epi_matrix(root_user_id INT)
RETURNS TABLE (
    id INT,
    name VARCHAR(255),
    email VARCHAR(255),
    referral_code VARCHAR(50),
    sponsor_id INT,
    sponsor_name VARCHAR(255),
    placement_id INT,
    placement_name VARCHAR(255),
    layer INT,
    is_spillover BOOLEAN,
    current_cycle VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE matrix AS (
        SELECT
            u.id,
            u.name,
            u.email,
            u.referral_code,
            u.sponsor_id,
            s.name AS sponsor_name,
            u.placement_id,
            p.name AS placement_name,
            1 AS layer,
            (u.sponsor_id <> root_user_id) AS is_spillover,
            u.current_cycle,
            u.created_at
        FROM public.users u
        LEFT JOIN public.users s ON u.sponsor_id = s.id
        LEFT JOIN public.users p ON u.placement_id = p.id
        WHERE u.placement_id = root_user_id

        UNION ALL

        SELECT
            u.id,
            u.name,
            u.email,
            u.referral_code,
            u.sponsor_id,
            s.name AS sponsor_name,
            u.placement_id,
            m.name AS placement_name,
            m.layer + 1 AS layer,
            (u.sponsor_id <> root_user_id) AS is_spillover,
            u.current_cycle,
            u.created_at
        FROM public.users u
        LEFT JOIN public.users s ON u.sponsor_id = s.id
        INNER JOIN matrix m ON u.placement_id = m.id
        WHERE m.layer < 3
    )
    SELECT * FROM matrix ORDER BY layer ASC, created_at DESC;
END;
$$ LANGUAGE plpgsql;
