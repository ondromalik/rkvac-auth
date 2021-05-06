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
            res.render('teacher_list', { title: 'Teacher list', teacher_list: list_teachers, username: req.user.username });
        });

};

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
        res.render('teacher_detail', { title: 'Teacher Detail', teacher: results.teacher, teacher_classes: results.teacher_classes, username: req.user.username } );
    });

};

exports.teacher_create_get = function(req, res, next) {
    res.render('teacher_form', { title: 'New teacher', username: req.user.username});
};

exports.teacher_create_post = [

    body('firstname').trim().isLength({ min: 1 }).escape().withMessage('Teacher name cannot be empty'),
    body('surname').trim().isLength({ min: 1 }).escape().withMessage('Teacher surname cannot be empty'),
    body('id_number').trim().isLength({ min: 1 }),
    body('email_address').trim().isLength({ min: 1 }),


    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('teacher_form', { title: 'New teacher', teacher: req.body, errors: errors.array(), username: req.user.username });
            return;
        }
        else {
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
                res.redirect(teacher.url);
            });
        }
    }
];

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
        res.render('teacher_delete', { title: 'Teacher delete', teacher: results.teacher, teacher_classes: results.teacher_classes, username: req.user.username } );
    });

};

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
            res.render('teacher_delete', { title: 'Delete teacher', teacher: results.teacher, teacher_classes: results.teacher_classes, username: req.user.username } );
            return;
        }
        else {
            Teacher.findByIdAndRemove(req.body.teacherid, function deleteTeacher(err) {
                if (err) { return next(err); }
                res.redirect('/teachers')
            })
        }
    });
};

exports.teacher_update_get = function (req, res, next) {

    Teacher.findById(req.params.id, function (err, teacher) {
        if (err) { return next(err); }
        if (teacher == null) { // No results.
            var err = new Error('Teacher not found');
            err.status = 404;
            return next(err);
        }
        res.render('teacher_form', { title: 'Edit teacher', teacher: teacher, username: req.user.username });

    });
};

exports.teacher_update_post = [

    body('firstname').trim().isLength({ min: 1 }).escape().withMessage('Teacher name cannot be empty.'),
    body('surname').trim().isLength({ min: 1 }).escape().withMessage('Teacher surname cannot be empty.'),
    body('id_number').trim().isLength({ min: 1 }),
    body('email_address').trim().isLength({ min: 1 }),


    (req, res, next) => {

        const errors = validationResult(req);

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
            res.render('teacher_form', { title: 'Edit teacher', teacher: teacher, errors: errors.array(), username: req.user.username });
            return;
        }
        else {
            Teacher.findByIdAndUpdate(req.params.id, teacher, {}, function (err, theteacher) {
                if (err) { return next(err); }
                res.redirect(theteacher.url);
            });
        }
    }
];