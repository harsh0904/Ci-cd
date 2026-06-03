const express = require('express');
const Joi = require('joi');
const Task = require('../models/task');

const router = express.Router();

// ─── Validation Schemas ───────────────────────────────────────────
const createSchema = Joi.object({
  title:       Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  status:      Joi.string().valid('todo', 'in-progress', 'done').optional(),
  priority:    Joi.string().valid('low', 'medium', 'high').optional(),
  tags:        Joi.array().items(Joi.string()).optional()
});

const updateSchema = Joi.object({
  title:       Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).allow('').optional(),
  status:      Joi.string().valid('todo', 'in-progress', 'done').optional(),
  priority:    Joi.string().valid('low', 'medium', 'high').optional(),
  tags:        Joi.array().items(Joi.string()).optional()
}).min(1);

// ─── GET /api/tasks ───────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status)   filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/tasks/:id ───────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/tasks ──────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const task = await Task.create(value);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/tasks/:id ───────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const task = await Task.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, message: 'Task deleted', data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
