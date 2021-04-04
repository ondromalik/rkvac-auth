var Teacher = require('../models/teacher');
var async = require('async');
var Class = require('../models/class');
const { body,validationResult } = require('express-validator');

// Display list of all Authors.
exports.teacher_list = function(req, res, next) {

    Teacher.find()
        .sort([['surname', 'ascending']])
        .exec(function (err, list_teachers) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('teacher_list', { title: 'Seznam vyučujících', teacher_list: list_teachers, username: req.user.username });
        });

};

// Display detail page for a specific Author.
exports.teacher_detail = function(req, res, next) {

    async.parallel({
        teacher: function(callback) {
            Teacher.findById(req.params.id)
                .exec(callback)
        },
        teacher_classes: function(callback) {
            Class.find({ 'teacher': req.params.id },'title summary abbreviation')
                .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.teacher==null) { // No results.
            var err = new Error('Teacher not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('teacher_detail', { title: 'Teacher Detail', teacher: results.teacher, teacher_classes: results.teacher_classes, username: req.user.username } );
    });

};

// Display Author create form on GET.
exports.teacher_create_get = function(req, res, next) {
    res.render('teacher_form', { title: 'Nový vyučující', username: req.user.username});
};

// Handle Author create on POST.
exports.teacher_create_post = [

    // Validate and sanitize fields.
    body('firstname').trim().isLength({ min: 1 }).escape().withMessage('Jméno vyučujíciho je vyžadováno.'),
    body('surname').trim().isLength({ min: 1 }).escape().withMessage('Přímení vyučujíciho je vyžadováno.'),
    // body('title_before'),
    // body('title_after'),
    body('id_number').trim().isLength({ min: 1 }),
    body('email_address').trim().isLength({ min: 1 }),


    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('teacher_form', { title: 'Nový vyučující', teacher: req.body, errors: errors.array(), username: req.user.username });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Author object with escaped and trimmed data.
            var teacher = new Teacher(
                {
                    firstname: req.body.firstname,
                    surname: req.body.surname,
                    title_before: req.body.title_before,
                    title_after: req.body.title_after,
                    id_number: req.body.id_number,
                    email_address: req.body.email_address
                });
            teacher.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(teacher.url);
            });
        }
    }
];

// Display Author delete form on GET.
exports.teacher_delete_get = function(req, res, next) {

    async.parallel({
        teacher: function(callback) {
            Teacher.findById(req.params.id).exec(callback)
        },
        teacher_classes: function(callback) {
            Class.find({ 'teacher': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.teacher==null) { // No results.
            res.redirect('/teachers');
        }
        // Successful, so render.
        res.render('teacher_delete', { title: 'Vymazání vyučujícího', teacher: results.teacher, teacher_classes: results.teacher_classes, username: req.user.username } );
    });

};

// Handle Author delete on POST.
exports.teacher_delete_post = function(req, res, next) {

    async.parallel({
        teacher: function(callback) {
            Teacher.findById(req.body.teacherid).exec(callback)
        },
        teacher_classes: function(callback) {
            Class.find({ 'teacher': req.body.teacherid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.teacher_classes.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('teacher_delete', { title: 'Vymazání vyučujícího', teacher: results.teacher, teacher_classes: results.teacher_classes, username: req.user.username } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Teacher.findByIdAndRemove(req.body.teacherid, function deleteTeacher(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/teachers')
            })
        }
    });
};

// Display Author update form on GET.
exports.teacher_update_get = function (req, res, next) {

    Teacher.findById(req.params.id, function (err, teacher) {
        if (err) { return next(err); }
        if (teacher == null) { // No results.
            var err = new Error('Vyučující nenalezen');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('teacher_form', { title: 'Úprava vyučujícího', teacher: teacher, username: req.user.username });

    });
};

// Handle Author update on POST.
exports.teacher_update_post = [

    // Validate and santize fields.
    body('firstname').trim().isLength({ min: 1 }).escape().withMessage('Jméno vyučujíciho je vyžadováno.'),
    body('surname').trim().isLength({ min: 1 }).escape().withMessage('Přímení vyučujíciho je vyžadováno.'),
    // body('title_before').trim().isLength({ min: 1 }),
    // body('title_after').trim().isLength({ min: 1 }),
    body('id_number').trim().isLength({ min: 1 }),
    body('email_address').trim().isLength({ min: 1 }),


    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Author object with escaped and trimmed data (and the old id!)
        var teacher = new Teacher(
            {
                firstname: req.body.firstname,
                surname: req.body.surname,
                title_before: req.body.title_before,
                title_after: req.body.title_after,
                id_number: req.body.id_number,
                email_address: req.body.email_address,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('teacher_form', { title: 'Úprava vyučujícího', teacher: teacher, errors: errors.array(), username: req.user.username });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Teacher.findByIdAndUpdate(req.params.id, teacher, {}, function (err, theteacher) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(theteacher.url);
            });
        }
    }
];