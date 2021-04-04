var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DepartmentSchema = new Schema({
    title: {type: String, required: true, minlength: 3, maxlength: 100},
    fullname: {type: String, required: true, minlength: 3, maxlength: 100},
});

// Virtual for this genre instance URL.
DepartmentSchema
    .virtual('url')
    .get(function () {
        return '/department/'+this._id;
    });

// Export model.
module.exports = mongoose.model('Department', DepartmentSchema);