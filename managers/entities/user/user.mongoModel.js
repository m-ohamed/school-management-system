const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' },
    school: {
        type: mongoose.Schema.Types.ObjectId, ref: 'School', required: function () {
            return this.role === 'student';
        }
    }
});

userSchema.pre('deleteOne', async function (next) {
    const userId = this.getQuery()._id;
    await mongoose.model('School').updateOne({ admin: userId }, { $unset: { admin: 1 } });
    await mongoose.model('Classroom').updateMany({ students: userId }, { $pull: { students: userId } });
    next();
});

module.exports = mongoose.model('User', userSchema);