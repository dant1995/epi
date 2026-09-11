import React from 'react';
import { 
  Crown, Shield, Award, Gem, Star, Zap, TrendingUp, 
  Users, ArrowRight, CheckCircle2, DollarSign, Package,
  ChevronRight, Globe, Lock, Sparkles, Layers
} from 'lucide-react';

const cycles = [
  {
    name: 'Bronze',
    displayName: 'Socio Bronze',
    price: 80,
    icon: <Award size={28} />,
    color: '#cd7f32',
    gradient: 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)',
    product: 'Curso Básico de Marketing Digital',
    bonus: '$20 por referencia directa',
    refund: '$60 al completar 3 referidos',
    physical: false,
    popular: false
  },
  {
    name: 'Prata',
    displayName: 'Socio Prata',
    price: 100,
    icon: <Star size={28} />,
    color: '#cbd5e1',
    gradient: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
    product: 'Módulo Intermediario/Avanzado de Estrategias y Ventas',
    bonus: 'Acceso a contenido exclusivo',
    refund: null,
    physical: false,
    popular: false
  },
  {
    name: 'Ouro',
    displayName: 'Socio Ouro',
    price: 500,
    icon: <Gem size={28} />,
    color: '#fbbf24',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    product: 'Kit Vitaminas/Suplementos + Módulo Master de Liderazgo',
    bonus: 'Producto físico incluido',
    refund: null,
    physical: true,
    popular: true
  },
  {
    name: 'Platino',
    displayName: 'Socio Platino',
    price: 1000,
    icon: <Crown size={28} />,
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
    product: 'Línea Completa de Suplementos + Inmersión Ejecutiva Digital',
    bonus: 'Acceso VIP ilimitado',
    refund: null,
    physical: true,
    popular: false
  },
  {
    name: 'Diamante',
    displayName: 'Socio Diamante',
    price: 5000,
    icon: <Sparkles size={28} />,
    color: '#c084fc',
    gradient: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)',
    product: 'Kit Alta Performance + Consejo de Estrategia y Mentorías Vitalicio',
    bonus: 'Mentoría vitalicia',
    refund: null,
    physical: true,
    popular: false
  }
];

const steps = [
  {
    icon: <Users size={32} />,
    title: 'Regístrate y Elige tu Ciclo',
    description: 'Crea tu cuenta gratuita y selecciona el ciclo Bronze ($80) para comenzar. Recibes acceso inmediato al Curso Básico de Marketing Digital.'
  },
  {
    icon: <Layers size={32} />,
    title: 'Construye tu Matriz 3x3',
    description: 'Invita a 3 personas directamente. El sistema de derrame automático completa las capas siguientes (3 + 9 + 27 = 39 miembros).'
  },
  {
    icon: <DollarSign size={32} />,
    title: 'Genera Comisiones y Cashback',
    description: 'Gana comisiones por cada referido directo. Al completar tu matriz, recibe reembolso automático en tu billetera digital.'
  },
  {
    icon: <TrendingUp size={32} />,
    title: 'Escala y Upgrade tus Ciclos',
    description: 'Reinvierte tus ganancias para subir a Prata, Ouro, Platino o Diamante. Los ciclos superiores incluyen productos físicos y beneficios exclusivos.'
  }
];

const HOTMART_LINKS = {
  bronze: "https://pay.hotmart.com/K107501131C?bid=1788914299750",
  prata: "https://pay.hotmart.com/I107531826E",
  ouro: "https://pay.hotmart.com/F107532075Y",
  platino: "https://pay.hotmart.com/A107532217R",
  diamante: "https://pay.hotmart.com/L107532252A",
};

export default function LandingPage({ onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>

      {/* ========== HEADER ========== */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(11, 15, 25, 0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0.9rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo-epi.jpeg" alt="EPI" style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }} />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>EPI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => onNavigate('login')}
            style={{
              padding: '0.55rem 1.2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem',
              background: 'transparent', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = '#cbd5e1'; }}
          >
            Entrar
          </button>
          <button
            onClick={() => onNavigate('register')}
            style={{
              padding: '0.55rem 1.2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
              border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
          >
            Registrarse
          </button>
        </div>
      </header>

      {/* ========== BANNER ========== */}
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <img
          src="/benner.png"
          alt="EPI - Elevation Prosperity International"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            maxHeight: '350px',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* ========== HERO ========== */}
      <section style={{
        padding: '5rem 2rem 4rem', textAlign: 'center', position: 'relative',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '9999px', padding: '0.45rem 1rem', fontSize: '0.82rem',
            color: '#a5b4fc', fontWeight: 600, marginBottom: '1.5rem'
          }}>
            <Globe size={14} /> Plataforma Global de Marketing Multinivel
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1,
            color: '#fff', marginBottom: '1.2rem', letterSpacing: '-1px'
          }}>
            Escala tu{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Libertad Financiera
            </span>
            {' '}con la Matriz EPI 3x3
          </h1>

          <p style={{
            fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.7,
            maxWidth: '650px', margin: '0 auto 2rem'
          }}>
            Sistema automatizado de 5 ciclos progresivos. 
            Construye tu red de <strong style={{ color: '#cbd5e1' }}>39 afiliados</strong> en una Matriz Forzada Cerrada 
            y genera ganancias recurrentes bajo la estructura de{' '}
            <strong style={{ color: '#cbd5e1' }}>Lojascapel LLC</strong>.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#ciclos"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.85rem 2rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
                textDecoration: 'none', boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
              Ver Planes <ChevronRight size={18} />
            </a>
            <a
              href="#como-funciona"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.85rem 2rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
                background: 'rgba(255,255,255,0.05)', color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.color = '#fff'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = '#cbd5e1'; }}
            >
              Como Funciona <ArrowRight size={18} />
            </a>
          </div>

          {/* Video */}
          <div style={{
            marginTop: '3rem',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '720px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              border: '1px solid rgba(99,102,241,0.2)'
            }}>
              <iframe
                src="https://www.youtube.com/embed/LEhbHKXZHtg"
                title="Video explicativo"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '3.5rem',
            flexWrap: 'wrap'
          }}>
            {[
              { value: '5', label: 'Ciclos Progresivos' },
              { value: '39', label: 'Posiciones en la Matriz' },
              { value: '$60', label: 'Cashback en Bronze' },
              { value: '7', label: 'Días de Garantía' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6366f1' }}>{stat.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== GRID DE PLANOS ========== */}
      <section id="ciclos" style={{ padding: '4rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
            Elige tu Nivel de Inversión
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            5 ciclos progresivos con productos digitales, físicos o ambos. Comienza desde Bronze y escala hasta Diamante.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {cycles.map((cycle) => (
            <div key={cycle.name} style={{
              background: 'rgba(18, 26, 43, 0.7)',
              backdropFilter: 'blur(16px)',
              border: cycle.popular ? `2px solid ${cycle.color}` : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px',
              padding: '1.75rem 1.5rem',
              position: 'relative',
              display: 'flex', flexDirection: 'column',
              transition: 'all 0.3s ease',
              boxShadow: cycle.popular ? `0 0 30px ${cycle.color}22` : '0 10px 30px -10px rgba(0,0,0,0.5)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = cycle.color; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = cycle.popular ? cycle.color : 'rgba(255,255,255,0.08)'; }}
            >
              {cycle.popular && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: cycle.gradient, color: cycle.name === 'Ouro' ? '#000' : '#fff',
                  padding: '0.3rem 1rem', borderRadius: '9999px', fontSize: '0.72rem',
                  fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  Más Popular
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: `${cycle.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: cycle.color, marginBottom: '0.75rem'
                }}>
                  {cycle.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>{cycle.displayName}</h3>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: cycle.color }}>$US {cycle.price.toLocaleString('en-US')}</span>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                {cycle.product}
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#34d399', marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={14} /> {cycle.bonus}
                </div>
                {cycle.refund && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#60a5fa', marginBottom: '0.35rem' }}>
                    <CheckCircle2 size={14} /> {cycle.refund}
                  </div>
                )}
                {cycle.physical && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#fbbf24', marginBottom: '0.35rem' }}>
                    <Package size={14} /> Producto físico incluido
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                  <Shield size={14} /> Garantía de 7 días
                </div>
              </div>

              <a
                href={HOTMART_LINKS[cycle.name.toLowerCase()]}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', textAlign: 'center', padding: '0.75rem',
                  borderRadius: '12px', fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none',
                  background: cycle.popular ? cycle.gradient : `${cycle.color}15`,
                  color: cycle.popular ? (cycle.name === 'Ouro' ? '#000' : '#fff') : cycle.color,
                  border: cycle.popular ? 'none' : `1px solid ${cycle.color}40`,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
              >
                Suscribirse Ahora
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ========== COMO FUNCIONA ========== */}
      <section id="como-funciona" style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.04) 50%, transparent 100%)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
              Como Funciona la Matriz EPI
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              Sistema automatizado de derrame que maximiza tus ganancias con cada nuevo afiliado que ingresa a tu red.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                background: 'rgba(18, 26, 43, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px',
                padding: '1.75rem 1.5rem',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  position: 'absolute', top: '-1px', right: '1.5rem',
                  fontSize: '3.5rem', fontWeight: 900, color: 'rgba(99,102,241,0.08)',
                  lineHeight: 1
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#818cf8', marginBottom: '1rem'
                }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.6rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.65 }}>{step.description}</p>
              </div>
            ))}
          </div>

          {/* Matrix visual */}
          <div style={{
            marginTop: '3rem', background: 'rgba(18, 26, 43, 0.7)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px',
            padding: '2rem', textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>
              Estructura de la Matriz Forzada 3x3
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                padding: '0.6rem 2rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
                fontWeight: 700, fontSize: '0.95rem'
              }}>
                Tu (Raíz)
              </div>
              <div style={{ color: '#64748b', fontSize: '1.5rem' }}>|</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Maestro 1', 'Maestro 2', 'Maestro 3'].map((m, i) => (
                  <div key={i} style={{
                    padding: '0.5rem 1.5rem', borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399', fontWeight: 700, fontSize: '0.85rem'
                  }}>
                    {m}
                  </div>
                ))}
              </div>
              <div style={{ color: '#64748b', fontSize: '1.5rem' }}>|</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} style={{
                    padding: '0.4rem 0.8rem', borderRadius: '8px',
                    background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)',
                    color: '#67e8f9', fontWeight: 600, fontSize: '0.75rem'
                  }}>
                    Líder {i + 1}
                  </div>
                ))}
              </div>
              <div style={{ color: '#64748b', fontSize: '1.5rem' }}>|</div>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '700px' }}>
                {Array.from({ length: 27 }, (_, i) => (
                  <div key={i} style={{
                    padding: '0.25rem 0.5rem', borderRadius: '6px',
                    background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24', fontWeight: 600, fontSize: '0.65rem'
                  }}>
                    Ayudante {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
              3 + 9 + 27 = <strong style={{ color: '#fff' }}>39 posiciones</strong> por ciclo completado
            </p>
          </div>
        </div>
      </section>

      {/* ========== BENEFICIOS ========== */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
              ¿Por qué EPI?
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem'
        }}>
          {[
            { icon: <Zap size={22} />, title: 'Activación Instantánea', desc: 'Accede a tus cursos y plataforma en segundos después del pago.' },
            { icon: <Lock size={22} />, title: 'Garantía de 7 Días', desc: 'Reembolso completo si no estás satisfecho dentro de los primeros 7 días.' },
            { icon: <Globe size={22} />, title: 'Operación Global', desc: 'Plataforma accesible desde cualquier país. Pagos vía Hotmart international.' },
            { icon: <TrendingUp size={22} />, title: 'Escalabilidad Real', desc: 'De $80 a $5,000. Crece a tu ritmo con ganancias comprobadas.' },
            { icon: <Package size={22} />, title: 'Productos Físicos', desc: 'Ciclos Ouro+ incluyen vitaminas y suplementos de alta calidad.' },
            { icon: <Users size={22} />, title: 'Comunidad Activa', desc: 'Red de afiliados comprometidos con tu éxito y crecimiento.' }
          ].map((b, i) => (
            <div key={i} style={{
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
              background: 'rgba(18, 26, 43, 0.5)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '1.25rem'
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#818cf8'
              }}>
                {b.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>{b.title}</h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section style={{
        padding: '4rem 2rem', textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 60%)'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>
            Comienza tu Camino hacia la Libertad Financiera
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            Únete a miles de afiliados que ya están construyendo su red con la Matriz EPI 3x3. 
            Tu futuro financiero comienza con un solo paso.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#ciclos"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem 2.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
                textDecoration: 'none', boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
              Suscribirse Ahora <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{
        background: 'rgba(11, 15, 25, 0.95)', borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem', textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <img src="/logo-epi.jpeg" alt="EPI" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>EPI</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            Plataforma de Marketing Multinivel operada por Lojascapel LLC.
          </p>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
            &copy; 2026 EPI. Todos los derechos reservados.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#ciclos" style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'none' }}>Planes</a>
            <a href="#como-funciona" style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'none' }}>Como Funciona</a>
            <button
              onClick={() => onNavigate('terms')}
              style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}
            >
              Términos y Condiciones
            </button>
            <button
              onClick={() => onNavigate('login')}
              style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}
            >
              Acceder
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
