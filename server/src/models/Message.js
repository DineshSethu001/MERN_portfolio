import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    subject: { type: String, trim: true, maxlength: 120, default: '' },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ read: 1, createdAt: -1 });

messageSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Message = mongoose.model('Message', messageSchema);
