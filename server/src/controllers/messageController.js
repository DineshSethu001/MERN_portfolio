import { Message } from '../models/Message.js';
import { HttpError } from '../utils/http.js';

export async function create(req, res) {
  const { website, ...data } = req.body; // drop honeypot
  await Message.create(data);
  res.status(201).json({ ok: true, message: "Thanks — your message is in. I'll get back to you soon." });
}

export async function list(_req, res) {
  const [messages, unread] = await Promise.all([
    Message.find().sort({ createdAt: -1 }).limit(500).lean(),
    Message.countDocuments({ read: false }),
  ]);
  res.json({ count: messages.length, unread, data: messages });
}

export async function update(req, res) {
  const message = await Message.findByIdAndUpdate(req.params.id, { read: req.body.read }, { new: true });
  if (!message) throw new HttpError(404, 'Message not found');
  res.json({ data: message });
}

export async function remove(req, res) {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) throw new HttpError(404, 'Message not found');
  res.status(204).end();
}
