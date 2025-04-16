/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Schema, model, models, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

// Interface for User document
interface IUser extends Document {
    username: string; // Added username property
    email: string;
    password: string;
    admins: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for User model static methods
interface IUserModel extends Model<IUser> {
    // You can add static methods here if needed
}

const UserSchema = new Schema<IUser, IUserModel>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        validate: {
            validator: (username: string) => {
                return /^[a-zA-Z0-9_]{3,16}$/.test(username);
            },
            message: 'Username must be 3-16 characters long and can only contain letters, numbers, and underscores'
        }
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        validate: (pass: string) => {
            if (!pass?.length || pass.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }
        }
    },
    admins: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

UserSchema.post('validate', function (user: IUser) {
    console.log('New user validated', user);
    user.password = bcrypt.hashSync(user.password, 10);
});

const User: IUserModel = models.User || model<IUser, IUserModel>('User', UserSchema);

export default User;