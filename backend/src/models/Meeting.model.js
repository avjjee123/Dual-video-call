import mongoose,{Schema} from "mongoose"; 

const meetinSchema=new Schema({
     user_id:{type:String},
     meetingCode:{type:String,required:true},
     date:{type:Date,default:Date.now,required:true},
});

const Meeting =mongoose.model("Meeting",meetinSchema);

export {Meeting}; 