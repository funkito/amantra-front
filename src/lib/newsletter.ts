export function normalizeNewsletterEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateNewsletterEmail(email: string) {
  const normalizedEmail = normalizeNewsletterEmail(email);

  if (!normalizedEmail) {
    return 'El correo es obligatorio.';
  }

  if (normalizedEmail.length > 180) {
    return 'El correo es demasiado largo.';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return 'Ingresa un correo válido.';
  }

  return null;
}

