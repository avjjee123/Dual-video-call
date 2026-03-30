import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"; 

const userScheme =new Schema(
    {
        name:{type:String,required:true},
        username:{type:String,required:true,unique:true},
        password:{type:String,required:true},
        token:{type:String}  
    }
)
// userScheme.pre("save",async function(){
//     this.password=await bcrypt.hash(this.password,12);
// })
userScheme.pre("save", async function(){
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});
 
const User=mongoose.model("User",userScheme);

export default User;  