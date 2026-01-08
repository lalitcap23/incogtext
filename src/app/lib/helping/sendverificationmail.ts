import { resend } from "@/app/lib/resend";
import VerificationEmail from "@/app/Emails/verificationEmail";
import { ApiResponse } from "@/app/type/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,   
    verifycode: string
): Promise<ApiResponse> {
    try {
        // In development, if Resend fails, log the code to console instead
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        // @ts-expect-error - Resend API types
        const { error } = await resend.emails.send({
            from: 'IncogText <onboarding@resend.dev>',
            to: [email], 
            subject: 'IncogText - Email Verification Code',
            react: VerificationEmail({ username, otp: verifycode }),
        });

        if (error) {
            console.error("Resend API error:", error);
            
            // In development, if it's a testing email restriction, log code to console
            if (isDevelopment && error.statusCode === 403) {
                console.log("\n=== EMAIL VERIFICATION CODE (DEV MODE) ===");
                console.log(`Email: ${email}`);
                console.log(`Verification Code: ${verifycode}`);
                console.log("Note: Resend only allows sending to your verified email in development.");
                console.log("To receive emails, use your verified email or verify a domain at resend.com/domains");
                console.log("==========================================\n");
                
                // Still return success so the flow continues
                return { 
                    success: true, 
                    message: `Verification code logged to console: ${verifycode}. Check server logs.` 
                };
            }
            
            return { success: false, message: error.message || "Failed to send verification email" };
        }

        return { success: true, message: "Verification email sent successfully" };
    // @ts-expect-error - Error handling
    } catch (error: any) {
      // @ts-expect-error - any type needed
      // @ts-expect-error - any type needed
        console.error("Error sending verification email:", (error as any));
        
        // In development, log code to console as fallback
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
            console.log("\n=== EMAIL VERIFICATION CODE (DEV MODE) ===");
            console.log(`Email: ${email}`);
            console.log(`Verification Code: ${verifycode}`);
            console.log("==========================================\n");
            
            return { 
                success: true, 
                message: `Verification code logged to console: ${verifycode}. Check server logs.` 
            };
        }
        
        return { success: false, message: "Failed to send verification email" };
    // @ts-expect-error - any type needed
    }
}
