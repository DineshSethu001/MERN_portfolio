import mongoose from 'mongoose';

export const CATEGORIES = ['APIs', 'Real-time', 'Infra', 'Full-stack'];

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, enum: CATEGORIES, default: 'APIs' },
    summary: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, default: '', maxlength: 10000 }, // long-form case study
    highlights: [{ type: String, trim: true, maxlength: 200 }],
    tags: [{ type: String, trim: true, maxlength: 60 }],
    sourceUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    coverImage: { type: String, default: '' }, // e.g. /uploads/abc.webp
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectSchema.index({ published: 1, order: 1, createdAt: -1 });

projectSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Project = mongoose.model('Project', projectSchema);
