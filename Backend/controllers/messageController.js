const Message = require('../models/Message');
const User = require('../models/User');

// Mesaj gönderme
const sendMessage = async (req, res) => {
    try {

        const { toUserId, content, title } = req.body;
        const fromUserId = req.userId; // Kimlik doğrulama middleware'inden alınan kullanıcı ID'si

        // Alıcı kullanıcının var olup olmadığını kontrol et
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ error: 'Alıcı kullanıcı bulunamadı.' });
        }
        // Yeni mesaj oluştur
        const newMessage = new Message({
            from: fromUserId,
            to: toUserId,
            content: content,
            title: title,
            timestamp: new Date()
        });
        await newMessage.save();
        res.status(201).json({ message: 'Mesaj başarıyla gönderildi.', data: newMessage });

    } catch (err) {
        console.error('Mesaj gönderilirken hata:', err);
        res.status(500).json({ error: 'Sunucu hatası (sendMessage).' });
    }
}

// Kullanıcıya gelen mesajları alma
const getMessagesForUser = async (req, res) => {
    try {
        const userId = req.userId; // Kimlik doğrulama middleware'inden alınan kullanıcı ID'si
        const messages = await Message.find({ to: userId }).sort({ timestamp: -1 });
        res.json({ messages });
    } catch (err) {
        console.error('Mesajlar getirilirken hata:', err);
        res.status(500).json({ error: 'Sunucu hatası (getMessagesForUser).' });
    }
}

const getMessagesWithUser = async (req, res) => {
    try {
        const userId = req.userId; // Kimlik doğrulama middleware'inden alınan kullanıcı ID'si
        const otherUserId = req.params.userId;

        // Diğer kullanıcının var olup olmadığını kontrol et
        const otherUser = await User.findById(otherUserId);
        if (!otherUser) {
            return res.status(404).json({ error: 'Diğer kullanıcı bulunamadı.' });
        }

        // İki kullanıcı arasındaki mesajları al
        const sentMessages = await Message.find({ from: userId, to: otherUserId }).sort({ timestamp: -1 });
        const receivedMessages = await Message.find({ from: otherUserId, to: userId }).sort({ timestamp: -1 });
        res.json({ sentMessages, receivedMessages });
    } catch (err) {
        console.error('Kullanıcı ile mesajlar getirilirken hata:', err);
        res.status(500).json({ error: 'Sunucu hatası (getMessagesWithUser).' });
    }
}

const deleteMessage = async (req, res) => {
    try {
        const userId = req.userId; // Kimlik doğrulama middleware'inden alınan kullanıcı ID'si
        const messageId = req.params.messageId;

        // Mesajı bul
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Mesaj bulunamadı.' });
        }

        // Sadece gönderen veya alıcı mesajı silebilir
        if (message.from.toString() !== userId && message.to.toString() !== userId) {
            return res.status(403).json({ error: 'Bu mesajı silme yetkiniz yok.' });
        }

        await Message.findByIdAndDelete(messageId);
        res.json({ message: 'Mesaj başarıyla silindi.' });
    } catch (err) {
        console.error('Mesaj silinirken hata:', err);
        res.status(500).json({ error: 'Sunucu hatası (deleteMessage).' });
    }
}

const isRead = async (req, res) => {
    try {
        const userId = req.userId; // Kimlik doğrulama middleware'inden alınan kullanıcı ID'si
        const messageId = req.params.messageId;

        // Mesajı bul
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Mesaj bulunamadı.' });
        }

        // Sadece alıcı mesajı okundu olarak işaretleyebilir
        if (message.to.toString() !== userId) {
            return res.status(403).json({ error: 'Bu mesajı okundu olarak işaretleme yetkiniz yok.' });
        }

        message.read = true;
        await message.save();
        res.json({ message: 'Mesaj başarıyla okundu olarak işaretlendi.' });
    } catch (err) {
        console.error('Mesaj okundu olarak işaretlenirken hata:', err);
        res.status(500).json({ error: 'Sunucu hatası (isRead).' });
    }
}

module.exports = {
    sendMessage,
    getMessagesForUser,
    getMessagesWithUser,
    deleteMessage, isRead
};