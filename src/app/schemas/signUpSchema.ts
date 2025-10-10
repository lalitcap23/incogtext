import {z} from 'zod'
 
export const usernamevalidation = z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must be at most 20 characters long" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" })

    export const signupSchema = z.object({
        username: usernamevalidation,
        email: z
            .string()
            .email({ message: "Invalid email address" })
            .min(1, { message: "Email is required" })
            .max(50, { message: "Email must be at most 50 characters long" }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .max(20, { message: "Password must be at most 20 characters long" })
            .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
    })