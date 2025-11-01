import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  userId: string;
}

const UserSchema = new Schema({
  userId: { type: String, required: true, unique: true },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
