var Class = require('../models/class');
var Teacher = require('../models/teacher');
var Department = require('../models/department');

var async = require('async');
const {body, validationResult} = require('express-validator');

exports.index = function (req, res) {

    async.parallel({
        class_count: function (callback) {
            Class.countDocuments({}, callback);
        },
        teacher_count: function (callback) {
            Teacher.countDocuments({}, callback);
        },
        department_count: function (callback) {
            Department.countDocuments({}, callback);
        }
    }, function (err, results) {
        res.render('index', {title: 'Home', error: err, data: results, username: req.user.username});
    });
};

exports.class_list = function (req, res, next) {

    Class.find({}, 'title teacher abbreviation')
        .populate('teacher')
        .exec(function (err, list_classes) {
            if (err) {
                return next(err);
            }
            res.render('class_list', {title: 'Class list', class_list: list_classes, username: req.user.username});
        });

};

exports.class_detail = function (req, res, next) {

    async.parallel({
        class: function (callback) {

            Class.findById(req.params.id)
                .populate('teacher')
                .populate('department')
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.class == null) {
            var err = new Error('Class not found');
            err.status = 404;
            return next(err);
        }
        res.render('class_detail', {title: results.class.title, class_info: results.class, username: req.user.username});
    });

};

exports.class_create_get = function (req, res, next) {

    async.parallel({
        teachers: function (callback) {
            Teacher.find(callback);
        },
        departments: function (callback) {
            Department.find(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        res.render('class_form', {
            title: 'Create class',
            teachers: results.teachers,
            departments: results.departments,
            username: req.user.username
        });
    });

};

exports.class_create_post = [
    (req, res, next) => {
        if (!(req.body.department instanceof Array)) {
            if (typeof req.body.department === 'undefined')
                req.body.department = [];
            else
                req.body.department = new Array(req.body.department);
        }
        next();
    },

    body('title', 'Title cannot be empty.').trim().isLength({min: 1}).escape(),
    body('teacher', 'Teacher cannot be empty.').trim().isLength({min: 1}).escape(),
    body('summary', 'Description cannot be empty.').trim().isLength({min: 1}).escape(),
    body('abbreviation', 'Shortcut cannot be empty.').trim().isLength({min: 1}).escape(),
    body('department', 'Department cannot be empty.').trim().isLength({min: 1}).escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var new_class = new Class(
            {
                title: req.body.title,
                teacher: req.body.teacher,
                summary: req.body.summary,
                abbreviation: req.body.abbreviation,
                department: req.body.department
            });

        if (!errors.isEmpty()) {
            async.parallel({
                teachers: function (callback) {
                    Teacher.find(callback);
                },
                departments: function (callback) {
                    Department.find(callback);
                },
            }, function (err, results) {
                if (err) {
                    return next(err);
                }

                for (let i = 0; i < results.departments.length; i++) {
                    if (new_class.department.indexOf(results.departmens[i]._id) > -1) {
                        results.departments[i].checked = 'true';
                    }
                }
                res.render('class_form', {
                    title: 'New class',
                    teachers: results.teachers,
                    departments: results.departments,
                    class_info: new_class,
                    errors: errors.array(),
                    username: req.user.username
                });
            });
            return;
        } else {
            new_class.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect(new_class.url);
            });
        }
    }
];

exports.class_delete_get = function (req, res, next) {

    async.parallel({
        class: function (callback) {
            Class.findById(req.params.id).populate('teacher').populate('department').exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.class == null) {
            res.redirect('/classes');
        }
        res.render('class_delete', {title: 'Delete class', class_info: results.class, username: req.user.username});
    });

};

// Handle book delete on POST.
exports.class_delete_post = function (req, res, next) {


    async.parallel({
        class: function (callback) {
            Class.findById(req.body.id).populate('teacher').populate('department').exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        Class.findByIdAndRemove(req.body.id, function deleteClass(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/classes');
        });

    });

};

exports.class_update_get = function (req, res, next) {

    async.parallel({
        class: function (callback) {
            Class.findById(req.params.id).populate('teacher').populate('department').exec(callback);
        },
        teachers: function (callback) {
            Teacher.find(callback);
        },
        departments: function (callback) {
            Department.find(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.class == null) { // No results.
            var err = new Error('Class not found');
            err.status = 404;
            return next(err);
        }
        res.render('class_form', {
            title: 'Edit class',
            teachers: results.teachers,
            departments: results.departments,
            class_info: results.class,
            username: req.user.username
        });
    });

};

exports.class_update_post = [

    body('title', 'Title cannot be empty.').trim().isLength({min: 1}).escape(),
    body('teacher', 'Teacher cannot be empty.').trim().isLength({min: 1}).escape(),
    body('summary', 'Description cannot be empty.').trim().isLength({min: 1}).escape(),
    body('abbreviation', 'Shortcut cannot be empty.').trim().isLength({min: 1}).escape(),
    body('department', 'Department cannot be empty.').trim().isLength({min: 1}).escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var newClass = new Class(
            {
                title: req.body.title,
                teacher: req.body.teacher,
                summary: req.body.summary,
                abbreviation: req.body.abbreviation,
                department: req.body.department,
                _id: req.params.id
            });

        if (!errors.isEmpty()) {
            async.parallel({
                teachers: function (callback) {
                    Teacher.find(callback);
                },
                departments: function (callback) {
                    Department.find(callback);
                },
            }, function (err, results) {
                if (err) {
                    return next(err);
                }

                res.render('class_form', {
                    title: 'Edit class',
                    teachers: results.teachers,
                    departments: results.departments,
                    class_info: newClass,
                    errors: errors.array(),
                    username: req.user.username
                });
            });
            return;
        } else {
            Class.findByIdAndUpdate(req.params.id, newClass, {}, function (err, theclass) {
                if (err) {
                    return next(err);
                }
                res.redirect(theclass.url);
            });
        }
    }
];