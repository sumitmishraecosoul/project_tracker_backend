const fs = require('fs');

// Read the current controller file
let controllerContent = fs.readFileSync('controllers/brandTaskController.js', 'utf8');

// Function to fix ObjectId handling
function fixObjectIdHandling(content) {
    // Fix updateBrandTask function
    content = content.replace(
        /\/\/ Try to find by _id first \(ObjectId\), then by id field \(string\)\s*let task = await Task\.findOne\(\{ _id: id, brand_id: brandId \}\);\s*if \(!task\) \{\s*task = await Task\.findOne\(\{ id: id, brand_id: brandId \}\);\s*\}/g,
        `// Check if id is a valid ObjectId, otherwise search by id field
    let task;
    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findOne({ _id: id, brand_id: brandId });
    }
    
    if (!task) {
      task = await Task.findOne({ id: id, brand_id: brandId });
    }`
    );

    // Fix deleteBrandTask function
    content = content.replace(
        /\/\/ Try to find by _id first \(ObjectId\), then by id field \(string\)\s*let task = await Task\.findOne\(\{ _id: id, brand_id: brandId \}\);\s*if \(!task\) \{\s*task = await Task\.findOne\(\{ id: id, brand_id: brandId \}\);\s*\}/g,
        `// Check if id is a valid ObjectId, otherwise search by id field
    let task;
    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findOne({ _id: id, brand_id: brandId });
    }
    
    if (!task) {
      task = await Task.findOne({ id: id, brand_id: brandId });
    }`
    );

    // Fix assignTask function
    content = content.replace(
        /\/\/ Try to find by _id first \(ObjectId\), then by id field \(string\)\s*let task = await Task\.findOneAndUpdate\(\s*\{ _id: id, brand_id: brandId \},\s*\{ assignedTo \},\s*\{ new: true, runValidators: true \}\s*\)\.populate\('assignedTo', 'name email'\);\s*if \(!task\) \{\s*task = await Task\.findOneAndUpdate\(\s*\{ id: id, brand_id: brandId \},\s*\{ assignedTo \},\s*\{ new: true, runValidators: true \}\s*\)\.populate\('assignedTo', 'name email'\);\s*\}/g,
        `// Check if id is a valid ObjectId, otherwise search by id field
    let task;
    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findOneAndUpdate(
        { _id: id, brand_id: brandId },
        { assignedTo },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email');
    }
    
    if (!task) {
      task = await Task.findOneAndUpdate(
        { id: id, brand_id: brandId },
        { assignedTo },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email');
    }`
    );

    // Fix updateTaskStatus function
    content = content.replace(
        /\/\/ Try to find by _id first \(ObjectId\), then by id field \(string\)\s*let task = await Task\.findOneAndUpdate\(\s*\{ _id: id, brand_id: brandId \},\s*\{ status \},\s*\{ new: true, runValidators: true \}\s*\)\.populate\('assignedTo', 'name email'\)\s*\.populate\('reporter', 'name email'\);\s*if \(!task\) \{\s*task = await Task\.findOneAndUpdate\(\s*\{ id: id, brand_id: brandId \},\s*\{ status \},\s*\{ new: true, runValidators: true \}\s*\)\.populate\('assignedTo', 'name email'\)\s*\.populate\('reporter', 'name email'\);\s*\}/g,
        `// Check if id is a valid ObjectId, otherwise search by id field
    let task;
    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findOneAndUpdate(
        { _id: id, brand_id: brandId },
        { status },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email')
       .populate('reporter', 'name email');
    }
    
    if (!task) {
      task = await Task.findOneAndUpdate(
        { id: id, brand_id: brandId },
        { status },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email')
       .populate('reporter', 'name email');
    }`
    );

    // Fix updateTaskPriority function
    content = content.replace(
        /\/\/ Try to find by _id first \(ObjectId\), then by id field \(string\)\s*let task = await Task\.findOneAndUpdate\(\s*\{ _id: id, brand_id: brandId \},\s*\{ priority \},\s*\{ new: true, runValidators: true \}\s*\)\.populate\('assignedTo', 'name email'\)\s*\.populate\('reporter', 'name email'\);\s*if \(!task\) \{\s*task = await Task\.findOneAndUpdate\(\s*\{ id: id, brand_id: brandId \},\s*\{ priority \},\s*\{ new: true, runValidators: true \}\s*\)\.populate\('assignedTo', 'name email'\)\s*\.populate\('reporter', 'name email'\);\s*\}/g,
        `// Check if id is a valid ObjectId, otherwise search by id field
    let task;
    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findOneAndUpdate(
        { _id: id, brand_id: brandId },
        { priority },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email')
       .populate('reporter', 'name email');
    }
    
    if (!task) {
      task = await Task.findOneAndUpdate(
        { id: id, brand_id: brandId },
        { priority },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email')
       .populate('reporter', 'name email');
    }`
    );

    return content;
}

// Apply the fixes
const fixedContent = fixObjectIdHandling(controllerContent);

// Write the fixed content back to the file
fs.writeFileSync('controllers/brandTaskController.js', fixedContent);

console.log('✅ Task controller ObjectId handling fixed!');
