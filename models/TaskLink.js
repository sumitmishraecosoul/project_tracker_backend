const mongoose = require('mongoose');

const taskLinkSchema = new mongoose.Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  url: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL starting with http:// or https://'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  order: {
    type: Number,
    default: 0
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
taskLinkSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Index for efficient queries
taskLinkSchema.index({ task_id: 1, brand_id: 1 });
taskLinkSchema.index({ created_by: 1 });

// Static method to get links for a task
taskLinkSchema.statics.getTaskLinks = async function(taskId, brandId) {
  return await this.find({ task_id: taskId, brand_id: brandId })
    .populate('created_by', 'name email')
    .sort('order');
};

// Static method to reorder links
taskLinkSchema.statics.reorderLinks = async function(taskId, brandId, linkOrders) {
  const bulkOps = linkOrders.map(({ linkId, order }) => ({
    updateOne: {
      filter: { _id: linkId, task_id: taskId, brand_id: brandId },
      update: { order }
    }
  }));
  
  return await this.bulkWrite(bulkOps);
};

// Instance method to get formatted link data
taskLinkSchema.methods.getFormattedData = function() {
  return {
    id: this._id,
    name: this.name,
    url: this.url,
    description: this.description,
    order: this.order,
    created_by: this.created_by,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

module.exports = mongoose.model('TaskLink', taskLinkSchema);
