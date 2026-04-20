import emailjs from '@emailjs/browser'

const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  ?? ''
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  ?? ''
const TMPL_CONTACT  = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CONTACT  ?? ''
const TMPL_REQUEST  = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_REQUEST  ?? ''

export async function sendContactEmail(params: {
  from_name:    string
  phone_number: string
  from_email:   string
  message:      string
}) {
  return emailjs.send(SERVICE_ID, TMPL_CONTACT, params, { publicKey: PUBLIC_KEY })
}

export async function sendTemplateRequest(params: {
  from_name:     string
  template_name: string
  description:   string
  from_email:    string
}) {
  return emailjs.send(SERVICE_ID, TMPL_REQUEST, params, { publicKey: PUBLIC_KEY })
}
