var Department = require('../models/department');
var Class = require('../models/class');
var async = require('async');
const { body,validationResult } = require("express-validator");

// Display list of all Genre.
exports.department_list = function(req, res, next) {

    Department.find()
        .sort([['title', 'ascending']])
        .exec(function (err, list_departments) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('department_list', { title: 'Seznam ústavů', departments_list:  list_departments, username: req.user.username});
        });

};

// Display detail page for a specific Genre.
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
        // Successful, so render
        res.render('department_detail', { title: 'Detail ústavu', department: results.department, department_classes: results.department_classes, username: req.user.username } );
    });

};

// Display Genre create form on GET.
exports.department_create_get = function(req, res, next) {
    res.render('department_form', { title: 'Nový ústav', username: req.user.username });
};

// Handle Genre create on POST.
exports.department_create_post = [

    // Validate and santize the name field.
    body('name', 'Zkratka ústavu je vyžadována').trim().isLength({ min: 1 }).escape(),
    body('fullname', 'Název ústavu je vyžadován').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var department = new Department(
            {
                title: req.body.name,
                fullname: req.body.fullname
            });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('department_form', { name: 'Nový ústav', department: department, errors: errors.array(), username: req.user.username});
            return;
        }
        else {
            // Data from form is valid.
            // Check if Department with same name already exists.
            Department.findOne({ 'title': req.body.name })
                .exec( function(err, found_department) {
                    if (err) { return next(err); }

                    if (found_department) {
                        // Genre exists, redirect to its detail page.
                        res.redirect(found_department.url);
                    }
                    else {

                        department.save(function (err) {
                            if (err) { return next(err); }
                            // Genre saved. Redirect to genre detail page.
                            res.redirect(department.url);
                        });

                    }

                });
        }
    }
];

// Display Genre delete form on GET.
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
        if (results.department==null) { // No results.
            res.redirect('/departments');
        }
        // Successful, so render.
        res.render('department_delete', { title: 'Vymazání ústavu', department: results.department, department_classes: results.department_classes, username: req.user.username } );
    });

};

// Handle Genre delete on POST.
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
        // Success
        if (results.department_classes.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('department_delete', { title: 'Vymazání ústavu', department: results.department, department_classes: results.department_classes, username: req.user.username } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Department.findByIdAndRemove(req.body.departmentid, function deleteDepartment(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/departments')
            })
        }
    });
};

// Display Genre update form on GET.
exports.department_update_get = function (req, res, next) {

    Department.findById(req.params.id, function (err, department) {
        if (err) { return next(err); }
        if (department == null) { // No results.
            var err = new Error('Ústav nenalezen');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('department_form', { title: 'Úprava ústavu', department: department, username: req.user.username });

    });
};

// Handle Genre update on POST.
exports.department_update_post = [

    // Validate and santize fields.
    body('name', 'Název ústavu je vyžadován').trim().isLength({ min: 1 }).escape(),


    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Author object with escaped and trimmed data (and the old id!)
        var department = new Department(
            {
                title: req.body.name,
                fullname: req.body.fullname,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('department_form', { title: 'Úprava ústavu', department: department, errors: errors.array(), username: req.user.username });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Department.findByIdAndUpdate(req.params.id, department, {}, function (err, thedepartment) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(thedepartment.url);
            });
        }
    }
];