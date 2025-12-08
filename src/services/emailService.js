const { Resend } = require('resend')

async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || process.env.MAIL_FROM || 'no-reply@example.com'
  if (!apiKey) {
    const e = new Error('Email provider misconfigured')
    e.code = 500
    e.errorCode = 'EMAIL_PROVIDER_MISCONFIGURED'
    throw e
  }
  const resend = new Resend(apiKey)
  const resp = await resend.emails.send({ from, to, subject, html: html || undefined, text: text || undefined })
  return { success: true, id: resp && resp.id }
}

module.exports = { sendEmail }
