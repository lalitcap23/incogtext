import { messageSchema } from "@/app/schemas/messageSchema";
export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingmessages?: boolean;
}
 