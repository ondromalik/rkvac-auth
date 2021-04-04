var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TeacherSchema = new Schema(
    {
        firstname: {type: String, required: true, maxlength: 100},
        surname: {type: String, required: true, maxlength: 100},
        title_before: {type: String, maxlength: 100},
        title_after: {type: String, maxlength: 100},
        id_number: {type: String, required: true, maxlength: 100},
        email_address: {type: String, required: true, maxlength: 100},
    }
);

// Virtual for author's full name
TeacherSchema
    .virtual('name')
    .get(function () {
        return this.title_before + ' ' + this.surname + ' ' + this.firstname + ' ' + this.title_after;
    });

// Virtual for author's URL
TeacherSchema
    .virtual('url')
    .get(function () {
        return '/teacher/' + this._id;
    });

//Export model
module.exports = mongoose.model('Teacher', TeacherSchema);