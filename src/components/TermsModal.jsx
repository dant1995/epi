import React from 'react';
import { X, Shield, Award, DollarSign, Package, RefreshCw, AlertCircle } from 'lucide-react';

export default function TermsModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1a2540 0%, #0f172a 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', width: '100%', maxWidth: '720px',
        maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={22} style={{ color: 'var(--accent-cyan)' }} />
            <h2 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              Términos y Condiciones de Uso y Compra
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px',
            color: '#94a3b8', cursor: 'pointer', padding: '0.4rem', display: 'flex'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.7' }}>

          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={18} style={{ color: '#fbbf24' }} /> 1. Descripción de los Ciclos Progresivos
            </h3>
            <p style={{ marginBottom: '0.75rem' }}>
              La plataforma EPI ofrece un sistema de marketing multinivel basado en una <strong>Matriz Forzada Cerrada 3×3</strong> con <strong>5 ciclos progressivos</strong>. Cada ciclo otorga acceso a productos digitales, físicos o ambos, según el nivel adquirido.
            </p>
            <div style={{ background: 'rgba(15,23,42,0.6)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-cyan)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Ciclo</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Precio</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tipo de Producto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700 }}>🥉 Bronze</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>$US 80.00</td>
                    <td style={{ padding: '0.5rem' }}>Curso Básico de Marketing Digital</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700 }}>🥈 Plata</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>$US 100.00</td>
                    <td style={{ padding: '0.5rem' }}>Módulo Intermediario/Avanzado de Estrategias y Ventas</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700 }}>🥇 Oro</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>$US 500.00</td>
                    <td style={{ padding: '0.5rem' }}>Kit Vitaminas/Suplementos + Módulo Master de Liderazgo <span style={{ color: '#34d399', fontSize: '0.75rem' }}>(Producto físico incluido)</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700 }}>💎 Platino</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>$US 1,000.00</td>
                    <td style={{ padding: '0.5rem' }}>Línea Completa de Suplementos + Inmersión Ejecutiva Digital</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', fontWeight: 700 }}>👑 Diamante</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>$US 5,000.00</td>
                    <td style={{ padding: '0.5rem' }}>Kit Alta Performance + Consejo de Estrategia y Mentorías Vitalicias</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={18} style={{ color: '#34d399' }} /> 2. Sistema de Bonificaciones y Cashback
            </h3>
            <p style={{ marginBottom: '0.5rem' }}>
              Al completar la <strong>1ª capa de 3 Maestros (indicados directos)</strong> en el Ciclo Bronze, el usuario recibe un <strong>reembolso (cashback) de $US 60.00</strong> que se acredita automáticamente en su billetera digital.
            </p>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={18} style={{ color: '#60a5fa' }} /> 3. Política de Reembolso (7 Días)
            </h3>
            <p style={{ marginBottom: '0.5rem' }}>
              El usuario tiene derecho a solicitar el <strong>reembolso total de su inversión</strong> dentro de los <strong>7 (siete) días calendario</strong> posteriores a la fecha de compra de cualquier ciclo.
            </p>
            <p>
              Una vez superado el plazo de 7 días, no se realizarán reembolsos. Las solicitudes de reembolso deben realizarse a través del panel de usuario o contactando al soporte de la plataforma.
            </p>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Package size={18} style={{ color: '#a855f7' }} /> 4. Entrega de Productos Físicos
            </h3>
            <p>
              Los ciclos <strong>Oro ($US 500)</strong>, <strong>Platino ($US 1,000)</strong> y <strong>Diamante ($US 5,000)</strong> incluyen productos físicos (suplementos, vitaminas y/o kits de alta performance). El envío se gestiona de forma automática al confirmar la adquisición del ciclo. El usuario deberá proporcionar una dirección de envío válida en su perfil.
            </p>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={18} style={{ color: '#f43f5e' }} /> 5. Aceptación de los Términos
            </h3>
            <p>
              Al registrarse y/o adquirir cualquier ciclo en la plataforma EPI, el usuario declara haber leído, comprendido y aceptado íntegramente estos Términos y Condiciones. La empresa se reserva el derecho de modificar estas condiciones en cualquier momento, notificando a los usuarios registrados.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} className="btn-submit" style={{ padding: '0.5rem 1.5rem' }}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
