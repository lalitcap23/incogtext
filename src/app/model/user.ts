
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
    clerkId: string;
    username: string;
    email: string;
    isAcceptingMessage: boolean;
    messages: Message[];
}
const userSchema: Schema<user> = new Schema({
    clerkId: {
        type: String,
        required: [true, "Clerk ID is required"],
        unique: true,
        trim: true,
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true, 
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        trim: true,
        unique: true,
        match:[ /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, 'Please enter a valid email address'],
    },
    isAcceptingMessage:{
        type: Boolean,
        default: true,
    },
    messages: [MessageSchema],  
})
const UserModal =(mongoose.models.User as mongoose.Model<user> ) || mongoose.model<user>("User", userSchema);
export default UserModal;
  