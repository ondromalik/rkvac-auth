var Department = require('../models/department');
var Class = require('../models/class');
var async = require('async');
const { body,validationResult } = require("express-validator");

exports.department_list = function(req, res, next) {

    Department.find()
        .sort([['title', 'ascending']])
        .exec(function (err, list_departments) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('department_list', { title: 'Department list', departments_list:  list_departments, username: req.user.username});
        });

};

exports.department_detail = function(req, res, next) {

    async.parallel({
        department: function(callback) {
            Department.findById(req.params.id)
                .exec(callback);
        },

        department_classes: function(callback) {
            Class.find({ 'department': req.params.id })
                .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.department==null) { // No results.
            var err = new Error('Department not found');
            err.status = 404;
            return next(err);
        }
        res.render('department_detail', { title: 'Department detail', department: results.department, department_classes: results.department_classes, username: req.user.username } );
    });

};

exports.department_create_get = function(req, res, next) {
    res.render('department_form', { title: 'New department', username: req.user.username });
};

exports.department_create_post = [

    body('name', 'Department shortcut cannot be empty').trim().isLength({ min: 1 }).escape(),
    body('fullname', 'Department title cannot be empty').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var department = new Department(
            {
                title: req.body.name,
                fullname: req.body.fullname
            });

        if (!errors.isEmpty()) {
            res.render('department_form', { name: 'New department', department: department, errors: errors.array(), username: req.user.username});
            return;
        }
        else {
            Department.findOne({ 'title': req.body.name })
                .exec( function(err, found_department) {
                    if (err) { return next(err); }

                    if (found_department) {
                        res.redirect(found_department.url);
                    }
                    else {

                        department.save(function (err) {
                            if (err) { return next(err); }
                            res.redirect(department.url);
                        });

                    }

                });
        }
    }
];

exports.department_delete_get = function(req, res, next) {

    async.parallel({
        department: function(callback) {
            Department.findById(req.params.id).exec(callback)
        },
        department_classes: function(callback) {
            Class.find({ 'department': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.department==null) {
            res.redirect('/departments');
        }
        res.render('department_delete', { title: 'Department delete', department: results.department, department_classes: results.department_classes, username: req.user.username } );
    });

};

exports.department_delete_post = function(req, res, next) {

    async.parallel({
        department: function(callback) {
            Department.findById(req.body.departmentid).exec(callback)
        },
        department_classes: function(callback) {
            Class.find({ 'department': req.body.departmentid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.department_classes.length > 0) {
            res.render('department_delete', { title: 'Department delete', department: results.department, department_classes: results.department_classes, username: req.user.username } );
            return;
        }
        else {
            Department.findByIdAndRemove(req.body.departmentid, function deleteDepartment(err) {
                if (err) { return next(err); }
                res.redirect('/departments')
            })
        }
    });
};

exports.department_update_get = function (req, res, next) {

    Department.findById(req.params.id, function (err, department) {
        if (err) { return next(err); }
        if (department == null) {
            var err = new Error('Department not found');
            err.status = 404;
            return next(err);
        }
        res.render('department_form', { title: 'Edit department', department: department, username: req.user.username });

    });
};

exports.department_update_post = [

    body('name', 'Department title cannot be empty').trim().isLength({ min: 1 }).escape(),


    (req, res, next) => {

        const errors = validationResult(req);

        var department = new Department(
            {
                title: req.body.name,
                fullname: req.body.fullname,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            res.render('department_form', { title: 'Edit department', department: department, errors: errors.array(), username: req.user.username });
            return;
        }
        else {
            Department.findByIdAndUpdate(req.params.id, department, {}, function (err, thedepartment) {
                if (err) { return next(err); }
                res.redirect(thedepartment.url);
            });
        }
    }
];