const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  projectId: String,
  task: String,
  eta: String,
  status: String,
  assignedTo: String,
  remark: String,
  roadBlock: String,
  supportNeeded: String
});

module.exports = mongoose.model('Task', taskSchema);
