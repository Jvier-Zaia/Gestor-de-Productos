import mongoose, { Document, Schema } from 'mongoose'
import { version } from 'os'
import { email, string } from 'zod'

export interface IUser extends Document {

email : string
password : string
name : string
createdAt: Date
}

const UserSchema = new Schema<IUser>(

{
email : {
type: String,
required: [true,`El Email es requerido`],
unique: true,
lowercase: true,
trim:true,
match:[                                     // Validación regex para email
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Por favor ingresá un email válido'
  ]
},
password :{
  type: String,
  required : [true, `La contraseña es requerida`],
  minlength: [7, `la contraseña debe tener al menos 7 caracteres`]
},
name: {
  type: String,
  trim: true,
  default: `Usuario`,
  maxLength: [50, `El nompbre no puede exceder los 50 caracteres`]
},
 createdAt: {
  type: Date,
  default: Date.now
 }
},
{
timestamps: true, 
versionKey: `versions`
}
)



UserSchema.methods.toJSON= function (){
  const user = this.toObject()
  delete user.password
  return user
}

export default mongoose.model<IUser>('User', UserSchema)
