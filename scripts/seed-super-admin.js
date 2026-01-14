const { PrismaClient } = require('@prisma/client');
const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');

const EMAIL = 'webamirov@gmail.com';
const PASSWORD = '00450045!';

const prisma = new PrismaClient();

const normalizeEmail = (email) => email.trim().toLowerCase();

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('base64url');
  const hash = scryptSync(password, salt, 64).toString('base64url');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(':');

  if (!salt || !hash) {
    return false;
  }

  const derived = scryptSync(password, salt, 64).toString('base64url');
  const valueBuffer = Buffer.from(hash);
  const expectedBuffer = Buffer.from(derived);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
};

const run = async () => {
  const email = normalizeEmail(EMAIL);
  const passwordHash = hashPassword(PASSWORD);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    update: {
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
      tokenVersion: { increment: 1 },
    },
  });

  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  const stored = await prisma.user.findUnique({ where: { id: user.id } });
  const passwordOk = stored ? verifyPassword(PASSWORD, stored.passwordHash) : false;

  console.log('Seeded SUPER_ADMIN:', {
    id: user.id,
    email: user.email,
    role: user.role,
    passwordMatches: passwordOk,
  });
};

run()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
