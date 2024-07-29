const { default: mongoose } = require("mongoose");

module.exports = ({ meta, config, managers }) =>{
    return ({req, res, next})=>{
        if(!req.params || !req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)){
            return managers.responseDispatcher.dispatch(res, {ok: false, code:400, errors: 'bad request'});
        }
        next(req.params.id);
    }
}