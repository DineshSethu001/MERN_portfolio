import slugify from 'slugify';
import { Project } from '../models/Project.js';
import { HttpError } from '../utils/http.js';
import { publicPath, removeUpload } from '../middleware/upload.js';

async function uniqueSlug(title, ignoreId) {
  const base = slugify(title, { lower: true, strict: true }) || 'project';
  let slug = base;
  for (let i = 2; await Project.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) }); i++) {
    slug = `${base}-${i}`;
  }
  return slug;
}

// Public: published projects only.
export async function listPublic(req, res) {
  const { category, featured, limit } = req.validQuery;
  const filter = { published: true };
  if (category) filter.category = category;
  if (featured) filter.featured = featured === 'true';

  const query = Project.find(filter).sort({ order: 1, createdAt: -1 }).select('-description');
  if (limit) query.limit(limit);
  const projects = await query.lean();
  res.json({ count: projects.length, data: projects });
}

export async function getBySlug(req, res) {
  const project = await Project.findOne({ slug: req.params.slug.toLowerCase(), published: true }).lean();
  if (!project) throw new HttpError(404, 'Project not found');
  res.json({ data: project });
}

// Admin: everything, including drafts.
export async function listAll(_req, res) {
  const projects = await Project.find().sort({ order: 1, createdAt: -1 }).lean();
  res.json({ count: projects.length, data: projects });
}

export async function create(req, res) {
  const { removeCover, ...fields } = req.body;
  const top = await Project.findOne().sort({ order: 1 }).select('order').lean();
  const project = await Project.create({
    ...fields,
    slug: await uniqueSlug(fields.title),
    coverImage: publicPath(req.file),
    order: top ? top.order - 1 : 0, // new projects appear first
  });
  res.status(201).json({ data: project });
}

export async function update(req, res) {
  const project = await Project.findById(req.params.id);
  if (!project) throw new HttpError(404, 'Project not found');

  const { removeCover, ...fields } = req.body;
  if (fields.title && fields.title !== project.title) {
    project.slug = await uniqueSlug(fields.title, project._id);
  }
  Object.assign(project, fields);

  if (req.file || removeCover) {
    await removeUpload(project.coverImage);
    project.coverImage = publicPath(req.file);
  }

  await project.save();
  res.json({ data: project });
}

export async function remove(req, res) {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw new HttpError(404, 'Project not found');
  await removeUpload(project.coverImage);
  res.status(204).end();
}

export async function reorder(req, res) {
  const { ids } = req.body;
  await Project.bulkWrite(ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { order: index } } })));
  res.json({ ok: true });
}
