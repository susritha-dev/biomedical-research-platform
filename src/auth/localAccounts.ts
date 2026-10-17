interface LocalAccount {
  id: string
  email: string
  name: string
  passwordSalt: string
  passwordHash: string
  createdAt: string
}

const ACCOUNTS_KEY = 'helix.localAccounts.v1'
const SESSION_KEY = 'helix.localAccountSession.v1'
const PASSWORD_HASH_ITERATIONS = 310_000

function getCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure browser storage requires HTTPS or localhost.')
  }
  return globalThis.crypto
}

function encodeBytes(bytes: Uint8Array) {
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''))
}

function decodeBytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

function readAccounts(): LocalAccount[] {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY)
    const parsed: unknown = stored ? JSON.parse(stored) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter((account): account is LocalAccount =>
      account &&
      typeof account.id === 'string' &&
      typeof account.email === 'string' &&
      typeof account.passwordSalt === 'string' &&
      typeof account.passwordHash === 'string',
    )
  } catch {
    return []
  }
}

async function hashPassword(password: string, salt: Uint8Array) {
  const cryptoApi = getCrypto()
  const passwordKey = await cryptoApi.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await cryptoApi.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PASSWORD_HASH_ITERATIONS,
    },
    passwordKey,
    256,
  )
  return new Uint8Array(bits)
}

function matchesHash(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index]
  }
  return difference === 0
}

function activateAccount(account: LocalAccount) {
  localStorage.setItem(SESSION_KEY, account.id)
  return { id: account.id, email: account.email, name: account.name }
}

export async function createLocalAccount(
  emailInput: string,
  password: string,
  name: string,
) {
  const email = emailInput.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid email address.')
  }

  const accounts = readAccounts()
  if (accounts.some((account) => account.email === email)) {
    throw new Error('An account with this email already exists in this browser.')
  }

  const cryptoApi = getCrypto()
  const salt = cryptoApi.getRandomValues(new Uint8Array(16))
  const passwordHash = await hashPassword(password, salt)
  const account: LocalAccount = {
    id: cryptoApi.randomUUID(),
    email,
    name: name.trim(),
    passwordSalt: encodeBytes(salt),
    passwordHash: encodeBytes(passwordHash),
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]))
  return activateAccount(account)
}

export async function signInLocalAccount(emailInput: string, password: string) {
  const email = emailInput.trim().toLowerCase()
  const account = readAccounts().find((candidate) => candidate.email === email)
  if (!account) throw new Error('Email or password is incorrect.')

  const actualHash = await hashPassword(password, decodeBytes(account.passwordSalt))
  if (!matchesHash(actualHash, decodeBytes(account.passwordHash))) {
    throw new Error('Email or password is incorrect.')
  }

  return activateAccount(account)
}

export function restoreLocalAccount() {
  const accountId = localStorage.getItem(SESSION_KEY)
  if (!accountId) return null
  const account = readAccounts().find((candidate) => candidate.id === accountId)
  if (!account) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  return { id: account.id, email: account.email, name: account.name }
}

export function signOutLocalAccount() {
  localStorage.removeItem(SESSION_KEY)
}