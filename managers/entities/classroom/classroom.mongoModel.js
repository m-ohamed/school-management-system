const { default: mongoose } = require("mongoose");

module.exports = mongoose.model('Classroom', new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}));