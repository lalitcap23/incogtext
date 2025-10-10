
import mongoose ,{Schema,Document}from "mongoose"; 

export interface Message extends Document{
    content :string;
    createdAt: Date; 
}

const MessageSchema: Schema<Message>= new Schema ({ 
content:{
    type:String,
    required:true,
},
createdAt:{
    type:Date,
    default:Date.now,
    required:true,  
},
})
export interface user extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpires: Date;
    isAcceptingMessage: boolean;
    messages: Message[];
    verified: boolean;
}
const userSchema: Schema<user> = new Schema({
    username: {
        type: String,
        required: [true, "User is not found"],
        trim: true,
        unique: true, 
    },
    email:{
        type: String,
        required: [true, "^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"],
        trim: true,
        unique: true,
        match:[ /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, 'Please enter a valid email address'],
    },
    password:{
        type: String,
        required: [true, "Password is not valid"],
        trim: true,
    },
    verifyCode:{    
        type: String,
        required: [true, "Verification code is not valid"],
        
    },
    verifyCodeExpires:{
        type: Date,
        required: [true, "Verification code is not valid"],
        
    },
    isAcceptingMessage:{
        type: Boolean,
        default: false,
    },
    messages: [MessageSchema],  
})
const UserModal =(mongoose.models.User as mongoose.Model<user> ) || mongoose.model<user>("User", userSchema);
export default UserModal;
  