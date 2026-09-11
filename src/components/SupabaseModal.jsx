import React, { useState } from 'react';
import { X, Database, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

const SUPABASE_SQL = `-- ==========================================================
-- BASE DE DATOS SUPABASE / POSTGRESQL - PROYECTO Epi 3x3
-- Ladder Shield Prosperity Circle (Matriz Forzada Cerrada Base 3)
-- ==========================================================

-- 1. Tabla de Usuarios Epi
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    referral_code VARCHAR(50) NOT NULL UNIQUE,
    sponsor_id INT REFERENCES public.users(id) ON DELETE SET NULL,     -- Patrocinador Original (Quien Invitó)
    placement_id INT REFERENCES public.users(id) ON DELETE SET NULL,   -- Nodo de Posicionamiento en la Matriz 3x3 (Derrame)
    position INT DEFAULT 1,                                            -- Posicionamiento pierna (1=Izq, 2=Centro, 3=Der)
    role VARCHAR(20) DEFAULT 'user',
    registration_fee NUMERIC(10,2) DEFAULT 60.00,                      -- Tarifa de Inscripción ($US 60)
    fee_refunded BOOLEAN DEFAULT FALSE,                                 -- Liberado después de 3 Maestros
    is_active BOOLEAN DEFAULT TRUE,                                     -- Traba de Activación Mensual
    current_cycle VARCHAR(50) DEFAULT 'Socio Bronce',                  -- Ciclo Corporativo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Garantizar que columnas existan en tablas ya creadas
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS placement_id INT REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS position INT DEFAULT 1;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS registration_fee NUMERIC(10,2) DEFAULT 60.00;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fee_refunded BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_cycle VARCHAR(50) DEFAULT 'Socio Bronce';

-- Índices de Alto Rendimiento
CREATE INDEX IF NOT EXISTS idx_users_sponsor_id ON public.users(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_users_placement_id ON public.users(placement_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

-- 2. Tabla de Billetera Digital (Wallet)
CREATE TABLE IF NOT EXISTS public.wallets (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    balance NUMERIC(10,2) DEFAULT 0.00,          -- Saldo Disponible para Retiro
    pending_balance NUMERIC(10,2) DEFAULT 0.00,  -- Saldo en Solicitud de Retiro
    total_earned NUMERIC(10,2) DEFAULT 0.00,     -- Total de Comisiones Ya Ganadas
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Solicitudes de Retiro (Withdrawals)
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    pix_key VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',         -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Tabla de Cursos (LMS)
CREATE TABLE IF NOT EXISTS public.courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Módulos del Curso
CREATE TABLE IF NOT EXISTS public.modules (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Clases (Lessons)
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

-- 7. Tabla de Progreso de Clases del Alumno
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- PERMISOS Y DESHABILITAR RLS PARA ACCESO DIRECTO DE LA API NODE
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;

-- 8. Función Recursiva para Obtener la Matriz Epi (3 Capas: 3, 9, 27 = 39 personas)
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
            Integración con Base de Datos Supabase / PostgreSQL
          </h3>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          Copie y ejecute el script SQL a continuación en el **SQL Editor** de Supabase para liberar los permisos RLS y crear todas las tablas de la Matriz Epi, Billetera Digital y Módulo de Cursos (LMS):
        </p>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Terminal size={16} /> Script Completo de Base de Datos Supabase (schema.sql)
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
            Entendido, Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
