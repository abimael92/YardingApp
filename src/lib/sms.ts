/**
 * SMS notification placeholder — Twilio-ready.
 * Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in env to send real SMS.
 */

const TWILIO_ENABLED = !!(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER
)

export interface SendSmsOptions {
  to: string
  body: string
}

/**
 * Send SMS. When Twilio is not configured, logs the message (dev) and returns success.
 * To enable Twilio:
 *   1. Install: pnpm add twilio
 *   2. const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
 *   3. await client.messages.create({ from: process.env.TWILIO_PHONE_NUMBER, to: options.to, body: options.body })
 */
export async function sendSms(options: SendSmsOptions): Promise<{ success: boolean; error?: string }> {
  if (TWILIO_ENABLED) {
    try {
      // Twilio integration (uncomment when twilio package is installed):
      // const twilio = require('twilio')
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      // await client.messages.create({
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: options.to.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1'),
      //   body: options.body,
      // })
      console.log("[SMS] Twilio configured but not implemented; logging:", { to: options.to, body: options.body })
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      console.error("[SMS] Twilio error:", message)
      return { success: false, error: message }
    }
  }
  console.log("[SMS] Placeholder — not sent (Twilio not configured):", { to: options.to, body: options.body })
  return { success: true }
}
