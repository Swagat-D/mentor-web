import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  role: z.enum(['mentor', 'student']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const mentorProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  location: z.string().min(1, 'Location is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  expertise: z.array(z.string()).min(1, 'At least one expertise area is required'),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    startYear: z.number(),
    endYear: z.number().optional(),
    description: z.string().optional(),
  })),
  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string(),
    skills: z.array(z.string()),
  })),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
  }).optional(),
});

export const sessionSchema = z.object({
  mentorId: z.string(),
  subject: z.string().min(1, 'Subject is required'),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(30).max(180),
  type: z.enum(['video', 'audio', 'chat']),
  notes: z.string().optional(),
});