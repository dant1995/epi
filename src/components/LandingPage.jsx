import React, { useState, useEffect } from "react";
import {
  Crown, Shield, Award, Gem, Star, Zap, TrendingUp,
  Users, ArrowRight, CheckCircle2, DollarSign, Package,
  ChevronRight, Globe, Lock, Sparkles, Layers, RefreshCw
} from "lucide-react";

const HOTMART_LINKS = {
  bronze: "https://pay.hotmart.com/K107501131C?bid=1788914299750",
  plata: "https://pay.hotmart.com/I107531826E",
  oro: "https://pay.hotmart.com/F107532075Y",
  platino: "https://pay.hotmart.com/A107532217R",
  diamante: "https://pay.hotmart.com/L107532252A",
};

const cycles = [
  {
    name: "Bronze", displayName: "Socio Bronze", price: 80,
    color: "#cd7f32", gradient: "linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)",
    product: "Curso Básico de Marketing Digital",
    bonus: null, refund: "$US 60 al completar 3 Maestros",
    physical: false, popular: false,
    icon: <Award size={28} />
  },
  {
    name: "Plata", displayName: "Socio Plata", price: 100,
    color: "#cbd5e1", gradient: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)",
    product: "Módulo Intermediario/Avanzado de Estrategias y Ventas",
    bonus: "Acceso a contenido exclusivo", refund: null,
    physical: false, popular: false,
    icon: <Star size={28} />
  },
  {
    name: "Oro", displayName: "Socio Oro", price: 500,
    color: "#fbbf24", gradient: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
    product: "Kit Vitaminas/Suplementos + Módulo Master de Liderazgo",
    bonus: "Producto físico incluido", refund: null,
    physical: true, popular: true,
    icon: <Gem size={28} />
  },
  {
    name: "Platino", displayName: "Socio Platino", price: 1000,
    color: "#38bdf8", gradient: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
    product: "Línea Completa de Suplementos + Inmersión Ejecutiva Digital",
    bonus: "Acceso VIP ilimitado", refund: null,
    physical: true, popular: false,
    icon: <Crown size={28} />
  },
  {
    name: "Diamante", displayName: "Socio Diamante", price: 5000,
    color: "#c084fc", gradient: "linear-gradient(135deg, #c084fc 0%, #9333ea 100%)",
    product: "Kit Alta Performance + Consejo de Estrategia y Mentorías Vitalicias",
    bonus: "Mentoría vitalicia", refund: null,
    physical: true, popular: false,
    icon: <Sparkles size={28} />
  }
];

export default function LandingPage({ onNavigate }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return (
    <div style={{ minHeight: "100vh", overflow: "hidden" }}>

      {/* HEADER */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(11,15,25,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0.9rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img src="/logo-epi.jpeg" alt="EPI" style={{ width: "42px", height: "42px", borderRadius: "10px", objectFit: "cover" }} />
          <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>EPI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => onNavigate("login")} style={{
            padding: "0.55rem 1.2rem", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem",
            background: "transparent", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer"
          }} onMouseEnter={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.color = "#fff"; }}
          onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.color = "#cbd5e1"; }}>
            Entrar
          </button>
          <button onClick={() => onNavigate("register")} style={{
            padding: "0.55rem 1.2rem", borderRadius: "10px", fontWeight: 700, fontSize: "0.88rem",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none", cursor: "pointer",
            boxShadow: "0 4px 12px rgba(99,102,241,0.35)"
          }} onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
          onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
            Registrarse
          </button>
        </div>
      </header>

      {/* BANNER */}
      <div style={{ width: "100%", overflow: "hidden", maxHeight: isDesktop ? "50vh" : "40vh" }}>
        <img src="/banner.png" alt="EPI" style={{ width: "100%", height: "100%", maxHeight: isDesktop ? "50vh" : "40vh", objectFit: "cover", objectPosition: "center", display: "block" }} />
      </div>

      {/* VIDEO */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: isDesktop ? "1.5rem 1rem" : "1rem" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: isDesktop ? "560px" : "100%", aspectRatio: "16/9", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <iframe src="https://www.youtube.com/embed/LEhbHKXZHtg" title="Video explicativo" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      </div>

      {/* HERO */}
      <section style={{ padding: "5rem 2rem 4rem", textAlign: "center", position: "relative", background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "9999px", padding: "0.45rem 1rem", fontSize: "0.82rem", color: "#a5b4fc", fontWeight: 600, marginBottom: "1.5rem" }}>
            <Globe size={14} /> Plataforma Global de Marketing Multinivel
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, color: "#fff", marginBottom: "1.2rem", letterSpacing: "-1px" }}>
            Escala tu{" "}<span style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Libertad Financiera</span>{" "}con la Matriz EPI 3x3
          </h1>
          <p style={{ fontSize: "1.15rem", color: "#94a3b8", lineHeight: 1.7, maxWidth: "650px", margin: "0 auto 2rem" }}>
            Sistema automatizado de 5 ciclos progresivos. Construye tu red de <strong style={{ color: "#cbd5e1" }}>39 afiliados</strong> en una Matriz Forzada Cerrada y genera ganancias recurrentes bajo la estructura de <strong style={{ color: "#cbd5e1" }}>EPI Digital</strong>.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#ciclos" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 700, fontSize: "1rem", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", textDecoration: "none", boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}
              onMouseEnter={e => e.target.style.transform = "translateY(-2px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
              Ver Planes <ChevronRight size={18} />
            </a>
            <a href="#epi-plan" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.85rem 2rem", borderRadius: "12px", fontWeight: 700, fontSize: "1rem", background: "rgba(255,255,255,0.05)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none" }}
              onMouseEnter={e => { e.target.style.borderColor = "rgba(99,102,241,0.4)"; e.target.style.color = "#fff"; }} onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.color = "#cbd5e1"; }}>
              Como Funciona <ArrowRight size={18} />
            </a>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "3rem", marginTop: "3.5rem", flexWrap: "wrap" }}>
            {[{ value: "5", label: "Ciclos Progresivos" }, { value: "39", label: "Posiciones en la Matriz" }, { value: "$60", label: "Cashback en Bronze" }, { value: "7", label: "Días de Garantía" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#6366f1" }}>{s.value}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GRID DE CICLOS */}
      <section id="ciclos" style={{ padding: "4rem 2rem", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", marginBottom: "0.75rem" }}>Elige tu Nivel de Inversión</h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto" }}>5 ciclos progresivos con productos digitales, físicos o ambos. Comienza desde Bronze ($US 80) y escala hasta Diamante ($US 5,000).</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
          {cycles.map((c) => (
            <div key={c.name} style={{
              background: "rgba(18,26,43,0.7)", backdropFilter: "blur(16px)",
              border: c.popular ? `2px solid ${c.color}` : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px", padding: "1.75rem 1.5rem", position: "relative",
              display: "flex", flexDirection: "column", transition: "all 0.3s ease",
              boxShadow: c.popular ? `0 0 30px ${c.color}22` : "0 10px 30px -10px rgba(0,0,0,0.5)"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = c.color; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = c.popular ? c.color : "rgba(255,255,255,0.08)"; }}>
              {c.popular && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: c.gradient, color: c.name === "Oro" ? "#000" : "#fff", padding: "0.3rem 1rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Más Popular</div>}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, marginBottom: "0.75rem" }}>{c.icon}</div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fff", margin: 0 }}>{c.displayName}</h3>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 900, color: c.color }}>$US {c.price.toLocaleString("en-US")}</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: "1.25rem", flex: 1 }}>{c.product}</p>
              <div style={{ marginBottom: "1.25rem" }}>
                {c.bonus && <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#34d399", marginBottom: "0.35rem" }}><CheckCircle2 size={14} /> {c.bonus}</div>}
                {c.refund && <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#60a5fa", marginBottom: "0.35rem" }}><CheckCircle2 size={14} /> {c.refund}</div>}
                {c.physical && <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#fbbf24", marginBottom: "0.35rem" }}><Package size={14} /> Producto físico incluido</div>}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#94a3b8" }}><Shield size={14} /> Garantía de 7 días</div>
              </div>
              <a href={HOTMART_LINKS[c.name.toLowerCase()]} target="_blank" rel="noopener noreferrer" style={{
                display: "block", textAlign: "center", padding: "0.75rem", borderRadius: "12px", fontWeight: 700, fontSize: "0.92rem", textDecoration: "none",
                background: c.popular ? c.gradient : `${c.color}15`,
                color: c.popular ? (c.name === "Oro" ? "#000" : "#fff") : c.color,
                border: c.popular ? "none" : `1px solid ${c.color}40`
              }} onMouseEnter={e => e.target.style.transform = "translateY(-1px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
                Suscribirse Ahora
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{ padding: "4rem 2rem", background: "linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.04) 50%, transparent 100%)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", marginBottom: "0.75rem" }}>Como Funciona la Matriz EPI</h2>
            <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto" }}>Sistema automatizado de derrame que maximiza tus ganancias con cada nuevo afiliado que ingresa a tu red.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {[
              { icon: <Users size={32} />, title: "Regístrate y Elige tu Ciclo", desc: "Crea tu cuenta gratuita y selecciona el ciclo Bronze ($US 80) para comenzar. Recibes acceso inmediato al Curso Básico de Marketing Digital." },
              { icon: <Layers size={32} />, title: "Construye tu Matriz 3x3", desc: "Invita a 3 personas directamente (Maestros). El sistema de derrame completa las capas siguientes: 9 Líderes + 27 Ayudantes = 39 posiciones." },
              { icon: <DollarSign size={32} />, title: "Genera Comisiones y Cashback", desc: "Al completar tu 1ª capa de 3 Maestros en el ciclo Bronze, recibe $US 60 de cashback en tu billetera digital." },
              { icon: <TrendingUp size={32} />, title: "Escala y Upgrade tus Ciclos", desc: "Reinvierte tus ganancias para subir a Plata, Oro, Platino o Diamante. Los ciclos superiores incluyen productos físicos premium." }
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(18,26,43,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "1.75rem 1.5rem", position: "relative", transition: "all 0.3s ease" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ position: "absolute", top: "-1px", right: "1.5rem", fontSize: "3.5rem", fontWeight: 900, color: "rgba(99,102,241,0.08)", lineHeight: 1 }}>{String(i+1).padStart(2,"0")}</div>
                <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8", marginBottom: "1rem" }}>{s.icon}</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", marginBottom: "0.6rem" }}>{s.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "3rem", background: "rgba(18,26,43,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "2rem", textAlign: "center" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", marginBottom: "1.5rem" }}>Estructura de la Matriz Forzada 3x3</h3>
            <img src="/estructura.png" alt="Estructura 3x3" style={{ width: "100%", height: "auto", borderRadius: "12px" }} />
            <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#64748b" }}>3 + 9 + 27 = <strong style={{ color: "#fff" }}>39 posiciones</strong> por ciclo completado</p>
          </div>
        </div>
      </section>

      {/* POR QUE EPI */}
      <section style={{ padding: "4rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", marginBottom: "0.75rem" }}>¿Por qué EPI?</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {[
            { icon: <Zap size={22} />, title: "Activación Instantánea", desc: "Accede a tus cursos y plataforma en segundos después del pago." },
            { icon: <Lock size={22} />, title: "Garantía de 7 Días", desc: "Reembolso total si no estás satisfecho dentro de los primeros 7 días calendario." },
            { icon: <Globe size={22} />, title: "Operación Global", desc: "Plataforma accesible desde cualquier país. Pagos vía Hotmart international." },
            { icon: <TrendingUp size={22} />, title: "Escalabilidad Real", desc: "De $US 80 a $US 5,000. Crece a tu ritmo con ganancias comprobadas." },
            { icon: <Package size={22} />, title: "Productos Físicos", desc: "Ciclos Oro, Platino y Diamante incluyen vitaminas y suplementos de alta calidad." },
            { icon: <Users size={22} />, title: "Comunidad Activa", desc: "Red de afiliados comprometidos con tu éxito y crecimiento." }
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", background: "rgba(18,26,43,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "1.25rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8" }}>{b.icon}</div>
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "0.3rem" }}>{b.title}</h4>
                <p style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5 }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "4rem 2rem", textAlign: "center", background: "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 60%)" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", marginBottom: "1rem" }}>Comienza tu Camino hacia la Libertad Financiera</h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", marginBottom: "2rem", lineHeight: 1.7 }}>Únete a miles de afiliados que ya están construyendo su red con la Matriz EPI 3x3.</p>
          <a href="#ciclos" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.9rem 2.5rem", borderRadius: "12px", fontWeight: 700, fontSize: "1.05rem", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", textDecoration: "none", boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}
            onMouseEnter={e => e.target.style.transform = "translateY(-2px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
            Suscribirse Ahora <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* PLAN EPI DIGITAL - DETALHADO */}
      <section id="epi-plan" style={{ padding: "5rem 2rem", background: "linear-gradient(180deg, transparent 0%, rgba(6,182,212,0.04) 30%, rgba(99,102,241,0.06) 70%, transparent 100%)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.35)", borderRadius: "9999px", padding: "0.4rem 1.1rem", fontSize: "0.8rem", color: "#a5b4fc", fontWeight: 700, marginBottom: "1.25rem", letterSpacing: "1px", textTransform: "uppercase" }}>
              <Sparkles size={13} /> Plataforma Global de Marketing Multinivel
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#fff", marginBottom: "0.75rem", letterSpacing: "-0.5px" }}>
              Como Funciona{" "}<span style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>el Plan EPI Digital</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "700px", margin: "0 auto", lineHeight: 1.7 }}>
              Sistema de <strong style={{ color: "#e2e8f0" }}>Matriz Forzada Cerrada 3×3</strong> con 5 ciclos progresivos. Cada ciclo otorga acceso a productos digitales, físicos o ambos, con bonificaciones claras desde el primer nivel.
            </p>
          </div>

          {/* Bloco 1: Estructura */}
          <div style={{ background: "rgba(18,26,43,0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "20px", padding: "2.5rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8" }}><Layers size={20} /></div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: 0 }}>Estructura de la Matriz 3×3</h3>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Cada socio incorpora <strong style={{ color: "#e2e8f0" }}>3 personas directamente</strong> (Maestros). Cada Maestro incorpora otras 3 (Líderes), y cada Líder otras 3 (Ayudantes). La plataforma se completa con <strong style={{ color: "#6366f1" }}>39 personas + el socio principal = 40 en total</strong>.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "1rem" }}>
              {[
                { emoji: "🧑‍💼", rol: "Socio Principal", count: "1", color: "#6366f1", sub: "Tú" },
                { emoji: "🥇", rol: "Maestros", count: "3", color: "#10b981", sub: "1ª capa — indicados directos" },
                { emoji: "🥈", rol: "Líderes", count: "9", color: "#06b6d4", sub: "2ª capa" },
                { emoji: "🥉", rol: "Ayudantes", count: "27", color: "#8b5cf6", sub: "3ª capa" },
              ].map((item, i) => (
                <div key={i} style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${item.color}28`, borderRadius: "14px", padding: "1.1rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.6rem", marginBottom: "0.3rem" }}>{item.emoji}</div>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.count}</div>
                  <div style={{ fontSize: "0.82rem", color: "#e2e8f0", fontWeight: 700, marginTop: "0.3rem" }}>{item.rol}</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.2rem" }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloco 2: Ciclos y Precios */}
          <div style={{ background: "rgba(18,26,43,0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2.5rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(251,191,36,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Award size={20} style={{ color: "#fbbf24" }} /></div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: 0 }}>1. Descripción de los Ciclos Progresivos</h3>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              La plataforma EPI ofrece un sistema de marketing multinivel basado en una <strong style={{ color: "#e2e8f0" }}>Matriz Forzada Cerrada 3×3</strong> con 5 ciclos progresivos. Cada ciclo otorga acceso a productos digitales, físicos o ambos, según el nivel adquirido.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { emoji: "🥉", nome: "Bronze", preco: "$US 80", color: "#f97316", produto: "Curso Básico de Marketing Digital", tipo: "Digital", fisico: false, extra: "Cashback $US 60 al completar los 3 Maestros", requisito: "Completar una plataforma de 39 personas.", total: "$US 1,260", beneficios: ["$US 500 en efectivo", "$US 200 en regalos y kit de Socio Bronce", "$US 500 de inversión en acciones para el socio", "$US 60 de devolución de la inscripción"] },
                { emoji: "🥈", nome: "Plata", preco: "$US 100", color: "#e2e8f0", produto: "Módulo Intermediario/Avanzado de Estrategias y Ventas", tipo: "Digital", fisico: false, extra: null, requisito: "Tener 27 socios Bronce en la plataforma.", total: "$US 9,500", beneficios: ["$US 5,000 en efectivo", "$US 4,000 de inversión en acciones para el socio", "$US 500 en regalos y kit de Socio Plata"] },
                { emoji: "🥇", nome: "Oro", preco: "$US 500", color: "#fbbf24", produto: "Kit Vitaminas/Suplementos + Módulo Master de Liderazgo", tipo: "Digital + Físico", fisico: true, extra: null, requisito: "Tener 27 socios Plata en la plataforma.", total: "$US 80,000", beneficios: ["$US 25,000 en efectivo", "$US 50,000 de inversión", "$US 5,000 en regalos y kit de Socio Oro"] },
                { emoji: "💎", nome: "Platino", preco: "$US 1,000", color: "#38bdf8", produto: "Línea Completa de Suplementos + Inmersión Ejecutiva Digital", tipo: "Digital + Físico", fisico: true, extra: null, requisito: "Tener 27 socios Oro en la plataforma.", total: "$US 850,000", beneficios: ["$US 300,000 en efectivo", "$US 500,000 de inversión", "$US 50,000 en regalos y kit de Socio Platino"] },
                { emoji: "👑", nome: "Diamante", preco: "$US 5,000", color: "#c084fc", produto: "Kit Alta Performance + Consejo de Estrategia y Mentorías Vitalicias", tipo: "Digital + Físico", fisico: true, extra: null, requisito: "Tener 27 socios Platino en la plataforma.", total: "$US 3,500,000", beneficios: ["$US 2,000,000 en efectivo", "$US 1,500,000 en regalos y kit de Socio Diamante", "Un vehículo Tesla del año", "Un viaje de una semana a Dubái con un acompañante, pagado por la compañía", "Un fin de semana en un resort, pagado por la compañía"] },
              ].map((c, i) => (
                <div key={i} style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${c.color}22`, borderRadius: "14px", padding: "1.25rem 1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${c.color}55`}
                onMouseLeave={e => e.currentTarget.style.borderColor = `${c.color}22`}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "160px" }}>
                    <span style={{ fontSize: "1.5rem" }}>{c.emoji}</span>
                    <div>
                      <div style={{ fontSize: "1rem", fontWeight: 900, color: c.color }}>{c.nome}</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#fff" }}>{c.preco}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontSize: "0.88rem", color: "#e2e8f0", fontWeight: 600, marginBottom: "0.4rem" }}>{c.produto}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "99px", background: c.fisico ? "rgba(139,92,246,0.15)" : "rgba(6,182,212,0.15)", color: c.fisico ? "#c084fc" : "#22d3ee", border: `1px solid ${c.fisico ? "rgba(139,92,246,0.3)" : "rgba(6,182,212,0.3)"}` }}>{c.tipo}</span>
                      {c.fisico && <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "99px", background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>📦 Producto físico incluido</span>}
                    </div>
                    {c.extra && (
                      <div style={{ marginTop: "0.6rem", padding: "0.5rem 0.75rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "8px", fontSize: "0.8rem", color: "#34d399", fontWeight: 600 }}>
                        ✅ {c.extra}
                      </div>
                    )}
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                        <strong style={{ color: "#e2e8f0" }}>Requisito:</strong> {c.requisito}
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: c.color, marginBottom: "0.5rem" }}>
                        Beneficios del Ciclo:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                        {c.beneficios.map((b, idx) => (
                          <li key={idx} style={{ marginBottom: "0.2rem" }}>{b}</li>
                        ))}
                      </ul>
                      <div style={{ marginTop: "0.75rem", display: "inline-block", background: `rgba(255,255,255,0.05)`, padding: "0.4rem 0.8rem", borderRadius: "6px", border: `1px solid ${c.color}40`, fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                        TOTAL INDICADO: <span style={{ color: c.color }}>{c.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloco 3: Bonificaciones */}
          <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.06))", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "20px", padding: "2rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><DollarSign size={20} style={{ color: "#10b981" }} /></div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: 0 }}>2. Sistema de Bonificaciones y Cashback</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "14px", padding: "1.25rem" }}>
                <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>💚</div>
                <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.4rem" }}>Cashback Bronze</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#34d399", marginBottom: "0.4rem" }}>$US 60.00</div>
                <p style={{ color: "#94a3b8", fontSize: "0.83rem", lineHeight: 1.6, margin: 0 }}>
                  Acreditado automáticamente en tu billetera digital al completar la <strong style={{ color: "#e2e8f0" }}>1ª capa de 3 Maestros</strong> (indicados directos) en el Ciclo Bronze.
                </p>
              </div>
            </div>
          </div>

          {/* Bloco 4: Reembolso + Productos Físicos */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ background: "rgba(18,26,43,0.85)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: "20px", padding: "2rem", backdropFilter: "blur(16px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0, background: "rgba(96,165,250,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><RefreshCw size={18} style={{ color: "#60a5fa" }} /></div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", margin: 0 }}>3. Política de Reembolso (7 Días)</h3>
              </div>
              <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: "12px", padding: "1rem", textAlign: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#60a5fa" }}>7 días</div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>calendario desde la fecha de compra</div>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>
                El usuario tiene derecho a solicitar el <strong style={{ color: "#e2e8f0" }}>reembolso total</strong> de su inversión dentro de los 7 días calendario posteriores a la fecha de compra de cualquier ciclo. Una vez superado el plazo, no se realizarán reembolsos. Las solicitudes deben realizarse a través del panel de usuario o contactando al soporte de la plataforma.
              </p>
            </div>
            <div style={{ background: "rgba(18,26,43,0.85)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "20px", padding: "2rem", backdropFilter: "blur(16px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={18} style={{ color: "#a855f7" }} /></div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", margin: 0 }}>4. Entrega de Productos Físicos</h3>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "1rem" }}>
                Los ciclos <strong style={{ color: "#fbbf24" }}>Oro ($US 500)</strong>, <strong style={{ color: "#38bdf8" }}>Platino ($US 1,000)</strong> y <strong style={{ color: "#c084fc" }}>Diamante ($US 5,000)</strong> incluyen productos físicos (suplementos, vitaminas y/o kits de alta performance).
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {["📦 El envío se gestiona de forma automática al confirmar la adquisición del ciclo", "📍 El usuario deberá proporcionar una dirección de envío válida en su perfil"].map((t, i) => (
                  <div key={i} style={{ padding: "0.6rem 0.75rem", background: "rgba(139,92,246,0.07)", borderRadius: "8px", border: "1px solid rgba(139,92,246,0.15)", fontSize: "0.82rem", color: "#c4b5fd" }}>{t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Bloco 5: Aceptación */}
          <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "16px", padding: "1.75rem 2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <Shield size={18} style={{ color: "#f59e0b", flexShrink: 0 }} />
              <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>5. Aceptación de los Términos — Información Legal</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>
              Al registrarse y/o adquirir cualquier ciclo en la plataforma EPI, el usuario declara haber leído, comprendido y aceptado íntegramente estos Términos y Condiciones. La empresa se reserva el derecho de modificar estas condiciones en cualquier momento, notificando a los usuarios registrados.
            </p>
            <p style={{ color: "#64748b", fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>
              ⚠️ <strong style={{ color: "#94a3b8" }}>Los pagos descritos no representan ingresos garantizados.</strong> Los resultados dependen del desempeño individual de cada socio y del cumplimiento de las condiciones oficiales de la plataforma EPI Digital.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "rgba(11,15,25,0.95)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <img src="/logo-epi.jpeg" alt="EPI" style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>EPI Digital</span>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "0.5rem", lineHeight: 1.6 }}>Plataforma de Marketing Multinivel operada por EPI Digital.</p>
          <p style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "1rem" }}>&copy; 2026 EPI Digital. Todos los derechos reservados.</p>
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#ciclos" style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none" }}>Planes</a>
            <a href="#como-funciona" style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none" }}>Como Funciona</a>
            <a href="#epi-plan" style={{ fontSize: "0.82rem", color: "#818cf8", textDecoration: "none", fontWeight: 600 }}>Plan EPI Digital</a>
            <button onClick={() => onNavigate("terms")} style={{ fontSize: "0.82rem", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>Términos y Condiciones</button>
            <button onClick={() => onNavigate("login")} style={{ fontSize: "0.82rem", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>Acceder</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

