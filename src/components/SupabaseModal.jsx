import React, { useState } from 'react';
import { X, Database, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

const SUPABASE_SQL = `-- ==========================================================
-- BANCO DE DADOS SUPABASE / POSTGRESQL - PROJETO Epi 3x3
-- Ladder Shield Prosperity Circle (Matriz Forçada Fechada Base 3)
-- ==========================================================

-- 1. Tabela de Usuários Epi
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    referral_code VARCHAR(50) NOT NULL UNIQUE,
    sponsor_id INT REFERENCES public.users(id) ON DELETE SET NULL,     -- Patrocinador Original (Quem Convidou)
    placement_id INT REFERENCES public.users(id) ON DELETE SET NULL,   -- Nó de Posicionamento na Matriz 3x3 (Derrame)
    position INT DEFAULT 1,                                            -- Posicionamento perna (1=Esq, 2=Centro, 3=Dir)
    role VARCHAR(20) DEFAULT 'user',
    registration_fee NUMERIC(10,2) DEFAULT 60.00,                      -- Taxa de Inscrição ($US 60)
    fee_refunded BOOLEAN DEFAULT FALSE,                                 -- Liberado após 3 Maestros
    is_active BOOLEAN DEFAULT TRUE,                                     -- Trava de Ativação Mensal
    current_cycle VARCHAR(50) DEFAULT 'Socio Bronce',                  -- Ciclo Corporativo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Garantir que colunas existam em tabelas já criadas
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS placement_id INT REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS position INT DEFAULT 1;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS registration_fee NUMERIC(10,2) DEFAULT 60.00;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fee_refunded BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_cycle VARCHAR(50) DEFAULT 'Socio Bronce';

-- Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_users_sponsor_id ON public.users(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_users_placement_id ON public.users(placement_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

-- 2. Tabela de Carteira Digital (Wallet)
CREATE TABLE IF NOT EXISTS public.wallets (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    balance NUMERIC(10,2) DEFAULT 0.00,          -- Saldo Disponível para Saque
    pending_balance NUMERIC(10,2) DEFAULT 0.00,  -- Saldo em Solicitação de Saque
    total_earned NUMERIC(10,2) DEFAULT 0.00,     -- Total de Comissões Já Ganhas
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Solicitações de Saque (Withdrawals)
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    pix_key VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',         -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Tabela de Cursos (LMS)
CREATE TABLE IF NOT EXISTS public.courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Módulos do Curso
CREATE TABLE IF NOT EXISTS public.modules (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Aulas (Lessons)
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

-- 7. Tabela de Progresso de Aulas do Aluno
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- PERMISSÕES E DESABILITAR RLS PARA ACESSO DIRETO DA API NODE
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;

-- 8. Função Recursiva para Obter a Matriz Epi (3 Camadas: 3, 9, 27 = 39 pessoas)
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
            u.created_at
        FROM public.users u
        LEFT JOIN public.users s ON u.sponsor_id = s.id
        INNER JOIN matrix m ON u.placement_id = m.id
        WHERE m.layer < 3
    )
    SELECT * FROM matrix ORDER BY layer ASC, created_at DESC;
END;
$$ LANGUAGE plpgsql;`;

export default function SupabaseModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.3rem' }}>
            <Database size={24} style={{ color: 'var(--accent-emerald)' }} />
            Integração com Banco Supabase / PostgreSQL
          </h3>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          Copie e execute o script SQL abaixo no **SQL Editor** do Supabase para liberar as permissões RLS e criar todas as tabelas da Matriz Epi, Carteira Digital e Módulo de Cursos (LMS):
        </p>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Terminal size={16} /> Script Completo de Banco Supabase (schema.sql)
          </span>
          <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'SQL Copiado!' : 'Copiar Código SQL'}
          </button>
        </div>

        <pre className="code-block">
          {SUPABASE_SQL}
        </pre>

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button className="nav-btn nav-btn-primary" onClick={onClose}>
            Entendi, Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
