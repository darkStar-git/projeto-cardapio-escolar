import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCb)
const PREFIXO = 'scrypt$'

// Gera o texto que vai para tbAdmin.senhaAdm: scrypt$<salt>$<hash> (cabe nos 255 caracteres da coluna)
export async function gerarHashSenha(senha) {
  const salt = randomBytes(16)
  const chave = await scrypt(String(senha), salt, 64)
  return `${PREFIXO}${salt.toString('hex')}$${chave.toString('hex')}`
}

// Confere a senha digitada com o que está no banco.
// Aceita o formato novo (hash) e o antigo (texto puro), para não quebrar admins já cadastrados.
export async function senhaConfere(informada, armazenada) {
  if (typeof armazenada === 'string' && armazenada.startsWith(PREFIXO)) {
    const [, saltHex, hashHex] = armazenada.split('$')
    const esperado = Buffer.from(hashHex ?? '', 'hex')
    const chave = await scrypt(String(informada), Buffer.from(saltHex ?? '', 'hex'), 64)
    return esperado.length === chave.length && timingSafeEqual(chave, esperado)
  }

  // Legado: texto puro, comparado em tempo constante
  const a = createHash('sha256').update(String(informada)).digest()
  const b = createHash('sha256').update(String(armazenada ?? '')).digest()
  return timingSafeEqual(a, b)
}
