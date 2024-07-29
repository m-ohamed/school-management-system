const { default: mongoose } = require("mongoose");

const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

schoolSchema.pre('deleteOne', async function (next) {
    const schoolId = this.getQuery()._id;
    await mongoose.model('User').updateOne({ _id: this.admin }, { $pull: { school: schoolId } });
    await mongoose.model('Classroom').updateMany({ school: schoolId }, { $unset: { school: 1 } });
    next();
});

schoolSchema.post('save', async function () {
    await mongoose.model('User').updateOne({ _id: this.admin }, { $set: { school: this._id } });
});

schoolSchema.post('findByIdAndUpdate', async function () {
    await mongoose.model('User').updateOne({ _id: this.admin }, { $set: { school: this._id } });
});

module.exports = mongoose.model('School', schoolSchema);