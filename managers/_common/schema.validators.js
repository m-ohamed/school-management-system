const { default: mongoose } = require("mongoose");

module.exports = {
    'username': (data)=>{
        if(data.trim().length < 3){
            return false;
        }
        return true;
    },
    'objectid': (data) => {
        if (mongoose.Types.ObjectId.isValid(data)) {
            return true;
        }
        return false;
    }
}