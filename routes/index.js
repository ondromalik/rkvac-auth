var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var router = express.Router();
var auth = require('./auth.js');
var flash = require('connect-flash');
const multer = require("multer");
const fs = require('fs');
var path = require('path');
const {exec} = require("child_process");
const net = require('net');
var cron = require('node-cron');
var task = cron.schedule('* * * * *', () =>  {
    console.log('stopped task');
}, {
    scheduled: false
});

router.use(session({
    secret: 'some-secret',
    saveUninitialized: false,
    resave: true
}));

// For parsing post request's data/body
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

// Tells app to use password session
router.use(auth.initialize());
router.use(auth.session());

router.use(flash());

router.get('/login', function (req, res) {
    let message = JSON.stringify(req.flash('error'));
    if (message !== '[]') {
        let newMessage = message.replace('[', '').replace(']', '').replace('"', '').replace('"', '');
        res.render('login', {message: newMessage});
    } else {
        res.render('login');
    }
});

router.get('/authorization-failure', require('permission')(), function (req, res) {
    console.log(req.flash('error'));
    res.render('not_authorized');
});


router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/setup', require('permission')(['admin']), (req, res) => {
    res.render('setup', {username: req.user.username});
});

router.post('/login',
    auth.authenticate('login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);

router.post('/verify',
    auth.authenticate('verify', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);

var class_controller = require('../controllers/classController');
var teacher_controller = require('../controllers/teacherController');
var department_controller = require('../controllers/departmentController');

/// CLASS ROUTES ///

router.get('/', require('permission')(), class_controller.index);

router.get('/class/create', require('permission')(['admin', 'user']), class_controller.class_create_get);

router.post('/class/create', require('permission')(['admin', 'user']), class_controller.class_create_post);

router.get('/class/:id/delete', require('permission')(['admin', 'user']), class_controller.class_delete_get);

router.post('/class/:id/delete', require('permission')(['admin', 'user']), class_controller.class_delete_post);

router.get('/class/:id/update', require('permission')(['admin', 'user']), class_controller.class_update_get);

router.post('/class/:id/update', require('permission')(['admin', 'user']), class_controller.class_update_post);

router.get('/class/:id', require('permission')(['admin', 'user', 'guest']), class_controller.class_detail);

router.get('/classes', require('permission')(['admin', 'user', 'guest']), class_controller.class_list);

/// TEACHER ROUTES ///

router.get('/teacher/create', require('permission')(['admin', 'user']), teacher_controller.teacher_create_get);

router.post('/teacher/create', require('permission')(['admin', 'user']), teacher_controller.teacher_create_post);

router.get('/teacher/:id/delete', require('permission')(['admin', 'user']), teacher_controller.teacher_delete_get);

router.post('/teacher/:id/delete', require('permission')(['admin', 'user']), teacher_controller.teacher_delete_post);

router.get('/teacher/:id/update', require('permission')(['admin', 'user']), teacher_controller.teacher_update_get);

router.post('/teacher/:id/update', require('permission')(['admin', 'user']), teacher_controller.teacher_update_post);

router.get('/teacher/:id', require('permission')(['admin', 'user', 'guest']), teacher_controller.teacher_detail);

router.get('/teachers', require('permission')(['admin', 'user', 'guest']), teacher_controller.teacher_list);

/// DEPARTMENT ROUTES ///

router.get('/department/create', require('permission')(['admin']), department_controller.department_create_get);

router.post('/department/create', require('permission')(['admin']), department_controller.department_create_post);

router.get('/department/:id/delete', require('permission')(['admin']), department_controller.department_delete_get);

router.post('/department/:id/delete', require('permission')(['admin']), department_controller.department_delete_post);

router.get('/department/:id/update', require('permission')(['admin']), department_controller.department_update_get);

router.post('/department/:id/update', require('permission')(['admin']), department_controller.department_update_post);

router.get('/department/:id', require('permission')(['admin', 'user', 'guest']), department_controller.department_detail);

router.get('/departments', require('permission')(['admin', 'user', 'guest']), department_controller.department_list);

/// SETUP FUNCTIONS ///

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './data/Verifier/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname);
    }
});

const keyFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(dat)$/)) {
        req.fileValidationError = 'Only .dat files are allowed!';
        return cb(new Error('Only .dat files are allowed!'), false);
    }
    cb(null, true);
};

router.get('/initiateRKVAC', require('permission')(['admin']), (req, res) => {
    let command = "printf '^C' | ./rkvac-protocol-multos-1.0.0 -v";
    exec(command, {timeout: 3000}, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    res.redirect('/setup');
});

router.get('/check-data', require('permission')(['admin']), (req, res) => {
    fs.access('./data', fs.F_OK, (err) => {
        if (err) {
            res.sendStatus(404);
            return
        }
        res.sendStatus(200);
    })
});

router.get('/check-ie-key', require('permission')(['admin']), (req, res) => {
    fs.access('./data/Verifier/ie_sk.dat', fs.F_OK, (err) => {
        if (err) {
            res.sendStatus(404);
            return
        }
        res.sendStatus(200);
    })
});

router.get('/check-ra-key', require('permission')(['admin']), (req, res) => {
    fs.access('./data/Verifier/ra_pk.dat', fs.F_OK, (err) => {
        if (err) {
            res.sendStatus(404);
            return
        }
        res.sendStatus(200);
    })
});

router.get('/check-ra-params', require('permission')(['admin']), (req, res) => {
    fs.access('./data/Verifier/ra_public_parameters.dat', fs.F_OK, (err) => {
        if (err) {
            res.sendStatus(404);
            return
        }
        res.sendStatus(200);
    })
});

router.get('/check-admin-attribute', require('permission')(['admin']), (req, res) => {
    fs.access('./data/Verifier/DBAdmin.att', fs.F_OK, (err => {
        if (err) {
            res.sendStatus(404);
            return
        }
        res.sendStatus(200);
    }))
});

router.get('/check-teacher-attribute', require('permission')(['admin']), (req, res) => {
    fs.access('./data/Verifier/DBTeacher.att', fs.F_OK, (err => {
        if (err) {
            res.sendStatus(404);
            return
        }
        res.sendStatus(200);
    }))
});

router.get('/check-student-attribute', require('permission')(['admin']), (req, res) => {
    fs.access('./data/Verifier/DBStudent.att', fs.F_OK, (err => {
        if (err) {
            res.sendStatus(404);
            return
        }
        res.sendStatus(200);
    }))
});

let currentEpoch = "";
let socket = new net.Socket();
socket.setEncoding('utf-8');
const connect = (server) => {
    socket.connect(5001, server)
};
socket.once('connect', function () {
    console.log('Connected to server!');
    let files = fs.readdirSync('./data/Verifier').filter(fn => fn.endsWith('for_RA.dat'));
    fs.readFile('./data/Verifier/' + files[0], 'utf-8', (err, data) => {
        if (err) {
            console.log("Error: " + err);
            return;
        }
        socket.write(data);
        currentEpoch = data;
    });
    // socket.write("Hey");
});
socket.on('error', function (error) {
    console.log("Terminating connection");
    socket.end();
});
socket.on('data', function (data) {
    console.log("Writing data");
    fs.appendFile('./data/Verifier/ra_BL_epoch_' + currentEpoch + '_C_for_verifier.dat', data, (err => {
        if (err) {
            console.log(err);
        }
    }));
    // socket.end();
});
socket.on('end', function () {
    console.log("Disconnected from server");
    exec('./rkvac-protocol-multos-1.0.0 -v -w ./data/Verifier/ra_BL_epoch_' + currentEpoch + '_C_for_verifier.dat', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
});

router.post('/createNewEpoch', require('permission')(['admin']), (req, res) => {
    exec('./rkvac-protocol-multos-1.0.0 -v -e', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        connect(req.body.RAAddress);
    });
    res.redirect('/setup');
});

router.post('/scheduleNewEpoch', require('permission')(['admin']), (req, res) => {
    var valid = cron.validate(req.body.timer);
    if (!valid) {
        res.sendStatus(501);
        return;
    }
    task = cron.schedule(req.body.timer, () => {
        exec('./rkvac-protocol-multos-1.0.0 -v -e', (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            connect(req.body.address);
        });
    });
    res.sendStatus(200);
});

router.post('/destroyEpoch', require('permission')(['admin']), (req, res) => {
    task.stop();
    res.sendStatus(200);
});

router.post('/deleteKey', require('permission')(['admin']), (req, res) => {
    let path = './data/' + req.body.filename;
    fs.unlink(path, (err) => {
        if (err) {
            console.error(err)
            return
        }
        res.redirect('/setup');
    })
});

router.post('/deleteAttribute', require('permission')(['admin']), (req, res) => {
    let path = './data/Verifier/' + req.body.filename;
    fs.unlink(path, (err) => {
        if (err) {
            console.error(err)
            return
        }
        res.redirect('/setup');
    })
});

router.post('/uploadIEKey', require('permission')(['admin']), (req, res) => {
    let upload = multer({storage: storage, fileFilter: keyFilter}).single('ie_sk.dat');

    upload(req, res, function (err) {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        } else if (!req.file) {
            return res.send('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            return res.send(err);
        } else if (err) {
            return res.send(err);
        }
        res.redirect('/setup');
    });
});

router.post('/uploadRAKey', require('permission')(['admin']), (req, res) => {
    let upload = multer({storage: storage, fileFilter: keyFilter}).single('ra_pk.dat');

    upload(req, res, function (err) {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        } else if (!req.file) {
            return res.send('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            return res.send(err);
        } else if (err) {
            return res.send(err);
        }
        res.redirect('/setup');
    });
});

router.post('/uploadRAParams', require('permission')(['admin']), (req, res) => {
    let upload = multer({storage: storage, fileFilter: keyFilter}).single('ra_public_parameters.dat');

    upload(req, res, function (err) {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        } else if (!req.file) {
            return res.send('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            return res.send(err);
        } else if (err) {
            return res.send(err);
        }
        res.redirect('/setup');
    });
});

router.post('/createAttribute', require('permission')(['admin']), (req, res) => {
    let attribFile = "";
    var command = "printf '4\\n1\\n" + req.body.attribute + "\\n^C' | ";
    switch (req.body.userrole) {
        case "admin":
            attribFile = "DBAdmin.att";
            break;
        case "teacher":
            attribFile = "DBTeacher.att";
            break;
        case "student":
            attribFile = "DBStudent.att";
            break;
    }
    command += "./rkvac-protocol-multos-1.0.0 -v -a " + attribFile;
    exec(command, {timeout: 3000}, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    res.redirect('/setup');
});


module.exports = router;
