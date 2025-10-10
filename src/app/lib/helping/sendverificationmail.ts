import { resend } from "@/app/lib/resend";
import VerificationEmail from "@/app/Emails/verificationEmail";
import { ApiResponse } from "@/app/type/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,   
    verifycode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [email], 
            subject: 'ingotext | verification  code',
            react: VerificationEmail({ username, otp: verifycode }),
        });

        return { success: true, message: "Verification email sent successfully" };
    } catch (error) {
        console.error("Error sending verification email:", error);
        return { success: false, message: "Failed to send verification email" };
    }
}
