import {z } from 'zod'

export const verifySchema = z.object({
    
    code: z
        .string()
        .length(6, { message: "code  must be exactly 6 digits" })
        .regex(/^\d+$/, { message: "OTP must contain only digits" }),
})  