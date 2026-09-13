const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Epi Matriz 3x3';
const FROM_EMAIL = process.env.SMTP_USER || 'noreply@epi.com';

async function sendEmail(to, subject, html) {
  if (!process.env.SMTP_USER) {
    console.warn('[Email] SMTP não configurado. Email não enviado:', subject, '→', to);
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html
    });
    console.log(`[Email] Enviado: "${subject}" → ${to}`);
    return true;
  } catch (err) {
    console.error('[Email] Erro ao enviar:', err.message);
    return false;
  }
}

async function sendWelcomeEmail(user) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Bem-vindo(a) à Matriz Epi! 🎉</h1>
      </div>
      <div style="background: #1e1e2e; padding: 30px; border-radius: 0 0 12px 12px; color: #e2e8f0;">
        <p>Olá <strong>${user.name}</strong>,</p>
        <p>Sua conta foi criada com sucesso na plataforma <strong>Epi Matriz 3x3</strong>!</p>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${user.email}</p>
          <p style="margin: 5px 0;"><strong>🔑 Código de Indicação:</strong> ${user.referral_code}</p>
          <p style="margin: 5px 0;"><strong>💰 Patrocinador:</strong> ${user.sponsor_name || 'Admin'}</p>
        </div>
        <p>Seu próximo passo: <strong>complete o pagamento da taxa de registro</strong> para ativar sua conta e começar a construir sua rede.</p>
        <p style="text-align: center; margin-top: 25px;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Acessar Plataforma</a>
        </p>
        <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8;">Se você não criou esta conta, ignore este email.</p>
      </div>
    </div>`;
  return sendEmail(user.email, 'Bem-vindo(a) à Matriz Epi 3x3!', html);
}

async function sendNewAffiliateNotification(sponsor, newMember) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Novo afiliado na sua rede! 🌟</h1>
      </div>
      <div style="background: #1e1e2e; padding: 30px; border-radius: 0 0 12px 12px; color: #e2e8f0;">
        <p>Olá <strong>${sponsor.name}</strong>,</p>
        <p>Um novo membro acabou de se juntar à sua rede de indicações!</p>
        <div style="background: rgba(16, 185, 129, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid rgba(16, 185, 129, 0.3);">
          <p style="margin: 5px 0;"><strong>👤 Nome:</strong> ${newMember.name}</p>
          <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${newMember.email}</p>
          <p style="margin: 5px 0;"><strong>🔑 Código:</strong> ${newMember.referral_code}</p>
        </div>
        <p>Continue construindo sua rede! Cada novo afiliado te aproxima do seu próximo nível.</p>
        <p style="text-align: center; margin-top: 25px;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ver Minha Rede</a>
        </p>
      </div>
    </div>`;
  return sendEmail(sponsor.email, `Novo afiliado: ${newMember.name}`, html);
}

async function sendWithdrawStatusEmail(user, withdrawal, status) {
  const isApproved = status === 'approved';
  const color = isApproved ? '#10b981' : '#ef4444';
  const icon = isApproved ? '✅' : '❌';
  const title = isApproved ? 'Saque aprovado!' : 'Saque rejeitado';
  const message = isApproved
    ? `Seu saque de <strong>$${withdrawal.amount}</strong> foi aprovado e será processado em breve.`
    : `Seu saque de <strong>$${withdrawal.amount}</strong> foi rejeitado. Motivo: ${withdrawal.rejection_reason || 'Não especificado.'}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${color}; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${icon} ${title}</h1>
      </div>
      <div style="background: #1e1e2e; padding: 30px; border-radius: 0 0 12px 12px; color: #e2e8f0;">
        <p>Olá <strong>${user.name}</strong>,</p>
        <p>${message}</p>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>💵 Valor:</strong> $${withdrawal.amount} USD</p>
          <p style="margin: 5px 0;"><strong>📋 Status:</strong> ${status === 'approved' ? 'Aprovado' : 'Rejeitado'}</p>
          <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${new Date(withdrawal.created_at).toLocaleDateString('pt-BR')}</p>
        </div>
        <p style="text-align: center; margin-top: 25px;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background: ${color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ver Carteira</a>
        </p>
      </div>
    </div>`;
  return sendEmail(user.email, `${icon} ${title} - $${withdrawal.amount} USD`, html);
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendNewAffiliateNotification,
  sendWithdrawStatusEmail
};
