import { z } from 'zod';

const emailSchema = z.string().trim().email('Ingresa un correo válido.').transform((value) => value.toLowerCase());

export const customerLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'La contraseña debe tener mínimo 8 caracteres.').max(128),
});

export const customerRegisterSchema = customerLoginSchema.extend({
  name: z.string().trim().min(2, 'El nombre debe tener mínimo 2 caracteres.').max(120),
});