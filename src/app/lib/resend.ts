import { Resend } from 'resend';

export const resend = new Resend(process.env.REST_API_KEY);
