import mongoose from 'mongoose';
import Chat from './src/models/Chat.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Chat.countDocuments({ title: 'New Chat' });
        console.log('New Chats count:', count);
        const latest = await Chat.find().sort({ createdAt: -1 }).limit(5);
        console.log('Latest chats:', latest.map(c => ({ id: c._id, title: c.title, user: c.user, createdAt: c.createdAt })));
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

checkDB();
