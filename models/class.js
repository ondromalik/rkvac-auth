var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ClassSchema = new Schema(
    {
        title: {type: String, required: true},
        teacher: {type: Schema.Types.ObjectId, ref: 'Teacher', required: true},
        summary: {type: String, required: true},
        abbreviation: {type: String, required: true},
        department: {type: Schema.Types.ObjectId, ref: 'Department', required: true},
    }
);

// Virtual for book's URL
ClassSchema
    .virtual('url')
    .get(function () {
        return '/class/' + this._id;
    });

//Export model
module.exports = mongoose.model('Class', ClassSchema);