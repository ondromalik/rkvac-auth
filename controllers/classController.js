var Class = require('../models/class');
var Teacher = require('../models/teacher');
var Department = require('../models/department');

var async = require('async');
const {body, validationResult} = require('express-validator');

exports.index = function (req, res) {

    async.parallel({
        class_count: function (callback) {
            Class.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        teacher_count: function (callback) {
            Teacher.countDocuments({}, callback);
        },
        department_count: function (callback) {
            Department.countDocuments({}, callback);
        }
    }, function (err, results) {
        res.render('index', {title: 'Domov', error: err, data: results, username: req.user.username});
    });
};

// Display list of all books.
exports.class_list = function (req, res, next) {

    Class.find({}, 'title teacher abbreviation')
        .populate('teacher')
        // .populate('abbreviation')
        .exec(function (err, list_classes) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render('class_list', {title: 'Seznam předmětu', class_list: list_classes, username: req.user.username});
        });

};

// Display detail page for a specific book.
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
        if (results.class == null) { // No results.
            var err = new Error('Předmet nenalezen');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('class_detail', {title: results.class.title, class_info: results.class, username: req.user.username});
    });

};

// Display book create form on GET.
exports.class_create_get = function (req, res, next) {

    // Get all authors and genres, which we can use for adding to our book.
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
            title: 'Vytvoř předmět',
            teachers: results.teachers,
            departments: results.departments,
            username: req.user.username
        });
    });

};

// Handle book create on POST.
exports.class_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if (!(req.body.department instanceof Array)) {
            if (typeof req.body.department === 'undefined')
                req.body.department = [];
            else
                req.body.department = new Array(req.body.department);
        }
        next();
    },

    // Validate and sanitise fields.
    body('title', 'Název nesmí být prázdny.').trim().isLength({min: 1}).escape(),
    body('teacher', 'Vyučující nesmí být prázdny.').trim().isLength({min: 1}).escape(),
    body('summary', 'Popis nesmí být prázdny.').trim().isLength({min: 1}).escape(),
    body('abbreviation', 'Zkratka nesmí být prázdny.').trim().isLength({min: 1}).escape(),
    body('department', 'Ústav nesmí být prázdny.').trim().isLength({min: 1}).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var new_class = new Class(
            {
                title: req.body.title,
                teacher: req.body.teacher,
                summary: req.body.summary,
                abbreviation: req.body.abbreviation,
                department: req.body.department
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
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

                // Mark our selected genres as checked.
                for (let i = 0; i < results.departments.length; i++) {
                    if (new_class.department.indexOf(results.departmens[i]._id) > -1) {
                        results.departments[i].checked = 'true';
                    }
                }
                res.render('class_form', {
                    title: 'Nový předmět',
                    teachers: results.teachers,
                    departments: results.departments,
                    class_info: new_class,
                    errors: errors.array(),
                    username: req.user.username
                });
            });
            return;
        } else {
            // Data from form is valid. Save book.
            new_class.save(function (err) {
                if (err) {
                    return next(err);
                }
                //successful - redirect to new book record.
                res.redirect(new_class.url);
            });
        }
    }
];

// Display book delete form on GET.
exports.class_delete_get = function (req, res, next) {

    async.parallel({
        class: function (callback) {
            Class.findById(req.params.id).populate('teacher').populate('department').exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.class == null) { // No results.
            res.redirect('/classes');
        }
        // Successful, so render.
        res.render('class_delete', {title: 'Vymazání předmětu', class_info: results.class, username: req.user.username});
    });

};

// Handle book delete on POST.
exports.class_delete_post = function (req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        class: function (callback) {
            Class.findById(req.body.id).populate('teacher').populate('department').exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        // Success
        // Book has no BookInstance objects. Delete object and redirect to the list of books.
        Class.findByIdAndRemove(req.body.id, function deleteClass(err) {
            if (err) {
                return next(err);
            }
            // Success - got to books list.
            res.redirect('/classes');
        });

    });

};

// Display book update form on GET.
exports.class_update_get = function (req, res, next) {

    // Get book, authors and genres for form.
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
            var err = new Error('Předmět nenalezen');
            err.status = 404;
            return next(err);
        }
        // Success.
        // Mark our selected genres as checked.
        // for (var all_g_iter = 0; all_g_iter < results.departments.length; all_g_iter++) {
        //     for (var book_g_iter = 0; book_g_iter < results.class.department.length; book_g_iter++) {
        //         if (results.genres[all_g_iter]._id.toString()===results.book.genre[book_g_iter]._id.toString()) {
        //             results.genres[all_g_iter].checked='true';
        //         }
        //     }
        // }
        res.render('class_form', {
            title: 'Úprava předmetu',
            teachers: results.teachers,
            departments: results.departments,
            class_info: results.class,
            username: req.user.username
        });
    });

};

// Handle book update on POST.
exports.class_update_post = [

    // // Convert the genre to an array
    // (req, res, next) => {
    //     if(!(req.body.department instanceof Array)){
    //         if(typeof req.body.genre==='undefined')
    //             req.body.genre=[];
    //         else
    //             req.body.genre=new Array(req.body.genre);
    //     }
    //     next();
    // },

    // Validate and sanitise fields.
    body('title', 'Název nesmí být prázdný').trim().isLength({min: 1}).escape(),
    body('teacher', 'Vyučující nesmí být prázdný').trim().isLength({min: 1}).escape(),
    body('summary', 'Popis nesmí být prázdný').trim().isLength({min: 1}).escape(),
    body('abbreviation', 'Zkratka nesmí být prázdná').trim().isLength({min: 1}).escape(),
    body('department', 'Ústav nesmí být prázdný').trim().isLength({min: 1}).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var newClass = new Class(
            {
                title: req.body.title,
                teacher: req.body.teacher,
                summary: req.body.summary,
                abbreviation: req.body.abbreviation,
                department: req.body.department,
                _id: req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
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

                // Mark our selected genres as checked.
                // for (let i = 0; i < results.genres.length; i++) {
                //     if (newClass.genre.indexOf(results.genres[i]._id) > -1) {
                //         results.genres[i].checked='true';
                //     }
                // }
                res.render('class_form', {
                    title: 'Úprava předmětu',
                    teachers: results.teachers,
                    departments: results.departments,
                    class_info: newClass,
                    errors: errors.array(),
                    username: req.user.username
                });
            });
            return;
        } else {
            // Data from form is valid. Update the record.
            Class.findByIdAndUpdate(req.params.id, newClass, {}, function (err, theclass) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to book detail page.
                res.redirect(theclass.url);
            });
        }
    }
];