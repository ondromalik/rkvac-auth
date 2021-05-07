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
const readline = require('readline');
const crypto = require('crypto');

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

function logOutput(stdout, err, stderr) {
    let date = new Date();
    let dateFormat = date.getFullYear() + '/' + (date.getMonth() < 10 ? '0' : '') + date.getMonth() + '/' + (date.getDate() < 10 ? '0' : '') + date.getDate() + ' ' +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds() + ' ';
    if (err) {
        stdout += '\n' + 'error: ' + err;
    }
    if (stderr) {
        stdout += '\n' + 'stderr: ' + stderr;
    }
    fs.appendFile('./main.log', dateFormat + stdout + '\n', 'utf-8', (err) => {
        if (err) {
            console.log(err);
        }
    });
}

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

router.get('/log', require('permission')(['admin']), (req, res) => {
    res.render('log', {username: req.user.username});
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

router.get('/change-password', require('permission')(['admin']), function (req, res, next) {
    res.render('password-form', {username: req.user.username});
});

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

var task = cron;
fs.readFile('./data/Verifier/epochCron.dat', 'utf-8', (err, data) => {
    if (!err) {
        task = cron.schedule(data, () => {
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
                let RAAddress = fs.readFileSync('./data/Verifier/RAAddress.dat', 'utf-8');
                connect(RAAddress);
            });
        }, {
            scheduled: true
        })
    }
});

/* TCP Socket for changing epoch */

let currentEpoch = "";
let socket = new net.Socket();
socket.setEncoding('utf-8');
const connect = (server) => {
    socket.connect(5004, server)
};
socket.on('connect', function () {
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
});
socket.on('end', function () {
    console.log("Disconnected from server");
    exec('./rkvac-protocol-multos-1.0.0 -v -w ./data/Verifier/ra_BL_epoch_' + currentEpoch + '_C_for_verifier.dat', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            logOutput(stdout, error, stderr);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            logOutput(stdout, error, stderr);
            return;
        }
        logOutput(stdout, error, stderr);
        console.log(`stdout: ${stdout}`);
    });
});

/* TCP Socket for user revocation */

async function updateBlacklist() {
    return exec('./rkvac-protocol-multos-1.0.0 -v -u' + './data/Verifier/ra_BL_epoch_' + currentEpoch + '_C_for_verifier.dat', (error, stdout, stderr) => {
        if (error) {
            console.log(`stdout: ${stdout}`);
            console.log(`error: ${error.message}`);
            logOutput(stdout, error, stderr);
            return;
        }
        if (stderr) {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            logOutput(stdout, error, stderr);
            return;
        }
        logOutput(stdout, error, stderr);
        console.log(`stdout: ${stdout}`);
    });
}
const revokeServer = net.createServer((c) => {
    // 'connection' listener.
    let raAddress = '';
    try {
        raAddress = fs.readFileSync('./data/Verifier/RAAddress.dat').toString();
    } catch (e) {
        console.log(e);
    }
    if (!(raAddress === c.remoteAddress)) {
        console.log("Client " + c.remoteAddress + " not permitted");
        logOutput("Client " + c.remoteAddress + " not permitted");
        c.end();
    }
    else {
        console.log("Client " + c.remoteAddress + " permitted");
        logOutput("Client " + c.remoteAddress + " permitted");
        c.setEncoding('utf-8');
        c.on('end', () => {
            console.log('client disconnected');
        });
        c.on('data', function (data) {
            fs.appendFile('./data/Verifier/ra_BL_epoch_' + currentEpoch + '_C_for_verifier.dat', data, (err) => {
                if (err) {
                    console.log(err);
                    logOutput(err);
                }
                console.log('Data written to ./data/Verifier/ra_BL_epoch_' + currentEpoch + '_C_for_verifier.dat');
                logOutput('Data written to ./data/Verifier/ra_BL_epoch_' + currentEpoch + '_C_for_verifier.dat');
                updateBlacklist().then(() => {
                    console.log("Blacklist updated");
                    logOutput("Blacklist updated");
                    c.end();
                });
            });
        });
        c.on('error', (err) => {
            console.log(err);
        });
        c.setTimeout(10000);
        c.on('timeout', () => {
            console.log("Terminating connection");
            c.destroy();
        });
    }
});
revokeServer.on('error', (err) => {
    console.log(err);
});
revokeServer.listen({port: 5003, host: '0.0.0.0', exclusive: true}, () => {
    console.log('server bound');
});

router.get('/initiateRKVAC', require('permission')(['admin']), (req, res) => {
    fs.mkdir('./data/Verifier', {recursive: true}, err => {
        if (err) {
            console.log(err);
        }
        logOutput("RKVAC was initiated", err);
        res.redirect('/setup');
    })
});

router.get('/check-data', require('permission')(['admin']), (req, res) => {
    fs.access('./data', fs.F_OK, (err) => {
        if (err) {
            res.json({rkvac: false});
            return
        }
        res.json({rkvac: true});
    })
});

router.get('/check-keys', require('permission')(['admin']), (req, res) => {
    let response = {
        ieKey: false,
        raKey: false,
        raParams: false
    }
    fs.access('./data/Verifier/ie_sk.dat', fs.F_OK, (err) => {
        if (!err) {
            response.ieKey = true;
        }
        fs.access('./data/Verifier/ra_pk.dat', fs.F_OK, (err) => {
            if (!err) {
                response.raKey = true;
            }
            fs.access('./data/Verifier/ra_public_parameters.dat', fs.F_OK, (err) => {
                if (!err) {
                    response.raParams = true;
                }
                res.json({ieKey: response.ieKey, raKey: response.raKey, raParams: response.raParams});
            });
        });
    });
});

router.get('/check-attribute-files', require('permission')(['admin']), (req, res) => {
    let response = {
        adminReady: false,
        teacherReady: false,
        studentReady: false
    }
    fs.access('./data/Verifier/DBAdmin.att', fs.F_OK, (err) => {
        if (!err) {
            response.adminReady = true;
        }
        fs.access('./data/Verifier/DBTeacher.att', fs.F_OK, (err) => {
            if (!err) {
                response.teacherReady = true;
            }
            fs.access('./data/Verifier/DBStudent.att', fs.F_OK, (err) => {
                if (!err) {
                    response.studentReady = true;
                }
                res.json({
                    adminReady: response.adminReady,
                    teacherReady: response.teacherReady,
                    studentReady: response.studentReady
                });
            });
        });
    });
});

router.get('/check-epoch', require('permission')(['admin']), (req, res) => {
    let response = {
        RAAddress: "",
        epochNumber: "",
        currentCron: ""
    }
    fs.readFile('./data/Verifier/RAAddress.dat', "utf8", (err, data) => {
        if (!err) {
            response.RAAddress = data;
        }
        fs.readFile('./data/Verifier/ve_epoch.dat', "utf8", (err1, data1) => {
            if (!err1) {
                response.epochNumber = data1;
            }
            fs.readFile('./data/Verifier/epochCron.dat', 'utf-8', (err2, data2) => {
                if (!err2) {
                    response.currentCron = data2;
                }
                res.json({
                    RAAddress: response.RAAddress,
                    epochNumber: response.epochNumber,
                    currentCron: response.currentCron
                });
            })
        });
    });
});

router.get('/downloadLog', require('permission')(['admin']), (req, res) => {
    const file = './main.log';
    res.download(file);
});

router.get('/deleteRAAddress', require('permission')(['admin']), (req, res) => {
    fs.unlink('./data/Verifier/RAAddress.dat', (err) => {
        if (err) {
            console.error(err)
            return
        }
        logOutput('./data/Verifier/RAAddress.dat deleted', err);
        res.json({success: true});
    })
});

router.get('/createNewEpoch', require('permission')(['admin']), (req, res) => {
    exec('./rkvac-protocol-multos-1.0.0 -v -e', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            logOutput(stdout, error, stderr);
            res.json({success: false});
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            logOutput(stdout, error, stderr);
            res.json({success: false});
            return;
        }
        console.log(`stdout: ${stdout}`);
        let RAAddress = fs.readFileSync('./data/Verifier/RAAddress.dat', 'utf-8');
        connect(RAAddress);
        logOutput(stdout, error, stderr);
        res.json({success: true});
    });
});


/* POST SETUP FUNCTIONS */

router.post('/deleteKey', require('permission')(['admin']), (req, res) => {
    let path = './data/Verifier/' + req.body.filename;
    fs.unlink(path, (err) => {
        if (err) {
            console.error(err)
            return
        }
        logOutput('./data/Verifier/' + req.body.filename + ' was deleted');
        res.json({success: true});
    })
});

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

router.post('/uploadIEKey', require('permission')(['admin']), (req, res) => {
    let upload = multer({storage: storage, fileFilter: keyFilter}).single('ie_sk.dat');

    upload(req, res, function (err) {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        } else if (!req.file) {
            return res.send('Please select .dat file to upload');
        } else if (err instanceof multer.MulterError) {
            return res.send(err);
        } else if (err) {
            return res.send(err);
        }
        logOutput('ie_sk.dat uploaded');
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
        logOutput('ra_pk.dat uploaded');
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
        logOutput('ra_public_parameters.dat uploaded');
        res.redirect('/setup');
    });
});

router.post('/deleteAttribute', require('permission')(['admin']), (req, res) => {
    let path = './data/Verifier/' + req.body.filename;
    fs.unlink(path, (err) => {
        if (err) {
            console.error(err)
            return
        }
        logOutput('./data/Verifier/' + req.body.filename + " was deleted");
        res.json({success: true});
    });
});

router.post('/createAttribute', require('permission')(['admin']), (req, res) => {
    let attribFile = "";
    let positionFile = "";
    var command = "printf '4\\n" + req.body.attributeCount + "\\n";
    for (let i = 0; i < req.body.attributeCount; i++) {
        let attribName = 'own' + i;
        if (req.body[attribName] === "") {
            command += " ";
        } else {
            command += req.body[attribName];
        }
        command += "\\n";
    }
    command += "' | ";
    switch (req.body.userrole) {
        case "admin":
            attribFile = "DBAdmin.att";
            positionFile = "./data/Verifier/adminPosition.dat";
            break;
        case "teacher":
            attribFile = "DBTeacher.att";
            positionFile = "./data/Verifier/teacherPosition.dat";
            break;
        case "student":
            attribFile = "DBStudent.att";
            positionFile = "./data/Verifier/studentPosition.dat";
            break;
    }
    command += "./rkvac-protocol-multos-1.0.0 -v -c " + attribFile;
    exec(command, {timeout: 3000}, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            console.log(`stdout: ${stdout}`);
            logOutput(stdout, error, stderr);
            return;
        }
        if (stderr) {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            logOutput(stdout, error, stderr);
            return;
        }
        logOutput(stdout, error, stderr);
        console.log(`stdout: ${stdout}`);
    });
    if (req.body.disclosedAttributes === "") {
        fs.writeFile(positionFile, "1", 'utf-8', (err) => {
            if (err) {
                console.log(err);
                return;
            }
            logOutput("Disclosed attributes details written to " + positionFile);
            console.log("Disclosed attributes details written to " + positionFile);
        });
    }
    else {
        fs.writeFile(positionFile, req.body.disclosedAttributes, 'utf-8', (err) => {
            if (err) {
                console.log(err);
                return;
            }
            logOutput("Disclosed attributes details written to " + positionFile);
            console.log("Disclosed attributes details written to " + positionFile);
        });
    }
    res.json({success: true});
});

router.post('/show-attribute', require('permission')(['admin']), (req, res) => {
    let response = {
        names: [],
        attributes: [],
        disclosedAttributes: ""
    }
    fs.readFile('./data/Verifier/' + req.body.disclosedName, 'utf-8', (err, data) => {
        if (!err) {
            response.disclosedAttributes = data;
            const fileStream = fs.createReadStream('./data/Verifier/' + req.body.attributeName).on('error', () => {
                res.json({success: false});
            });
            readline.createInterface({
                input: fileStream,
                console: false
            }).on('line', function (line) {
                if (line !== '') {
                    let words = line.split(';').map(String);
                    response.names.push(words[0]);
                    response.attributes.push(words[1]);
                }
            }).on('close', function () {
                res.json({success: true, names: response.names, attributes: response.attributes, disclosedAttributes: response.disclosedAttributes});
            });
        }
        else {
            res.json({success: false});
        }
    });
});

router.post('/saveRAAddress', require('permission')(['admin']), (req, res) => {
    fs.writeFile('./data/Verifier/RAAddress.dat', req.body.RAAddress, 'utf8', (err) => {
        if (err) {
            console.log(err);
            return;
        }
        logOutput("RA address written to ./data/Verifier/RAAddress.dat");
        console.log("RA address written to ./data/Verifier/RAAddress.dat");
        res.json({success: true});
    });
});

router.post('/scheduleNewEpoch', require('permission')(['admin']), (req, res) => {
    var valid = cron.validate(req.body.timer);
    if (!valid) {
        res.json({success: false});
        return;
    }
    task = cron.schedule(req.body.timer, () => {
        exec('./rkvac-protocol-multos-1.0.0 -v -e', (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                logOutput(stdout, error, stderr);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                logOutput(stdout, error, stderr);
                return;
            }
            console.log(`stdout: ${stdout}`);
            logOutput(stdout, error, stderr);
            let RAAddress = fs.readFileSync('./data/Verifier/RAAddress.dat', 'utf-8');
            connect(RAAddress);
        });
    });
    res.json({success: true});
    fs.writeFile('./data/Verifier/epochCron.dat', req.body.timer, 'utf-8', (err) => {
        if (err) {
            console.log(err);
            return;
        }
        logOutput("New cron successfully scheduled");
        console.log("Cron saved to ./data/Verifier/epochCron.dat");
    });
});

router.post('/destroyEpoch', require('permission')(['admin']), (req, res) => {
    task.stop();
    res.json({success: true});
    fs.unlink('./data/Verifier/epochCron.dat', (err) => {
        if (err) {
            console.error(err)
            return
        }
        logOutput("Cron destroyed", err);
        console.log("Cron destroyed");
    });
});

router.post('/deleteData', require('permission')(['admin']), (req, res) => {
    fs.rmdir('./data', {recursive: true}, err => {
        if (err) {
            console.log(err);
            res.json({success: false});
            return;
        }
        logOutput("RKVAC reseted", err);
        res.json({success: true});
    });
});

////// LOGGING FUNCTIONS //////

const logData = {
    headers: ["Day", "Time", "Epoch number", "Pseudonym", "Result"],
    rows: []
};

function loadLogs(userFile) {
    return new Promise((resolve, reject) => {
        try {
            let i = 0;
            let count = 0;
            const fileStream = fs.createReadStream(userFile).on('error', reject);
            readline.createInterface({
                input: fileStream,
                console: false
            }).on('line', (line) => {
                if (line !== '') {
                    count++;
                }
            }).on('close', () => {
                const fileStreamSecond = fs.createReadStream(userFile).on('error', reject);
                readline.createInterface({
                    input: fileStreamSecond,
                    console: false
                }).on('line', function (line) {
                    if (line !== '' && i >= count - 50) {
                        let words = line.split(' ').map(String);
                        if (words[2] === '') {
                            words.splice(2, 1);
                        }
                        words[0] += ' ' + words[1] + ' ' + words[2] + ' ' + words[4];
                        words.splice(1, 2);
                        words.splice(2, 1);
                        words.splice(4, 1);
                        logData.rows.push(words);
                    }
                    i++;
                }).on('close', function () {
                    resolve(logData);
                });
            });
        } catch (e) {
            reject(e);
        }
    });
}

router.get('/refreshLog', require('permission')(['admin']), function (req, res) {
    logData.rows = [];
    loadLogs('./data/Verifier/ve_requests.log').then((data) => {
        res.json({
            headers: data.headers,
            rows: data.rows
        })
    }).catch(err => {
        res.json({
            success: false
        })
        console.log('Error: ' + err);
    })
});

// Change password
const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    return sha256.update(password).digest('base64');
}

router.post('/change-password', require('permission')(['admin']), (req, res) => {
    fs.readFile('./passwd', (err, data) => {
        if (err) {
            console.log(err);
            res.render('password-form', {message: "Request failed", username: req.user.username});
            return;
        }
        if (data.toString() !== getHashedPassword(req.body.passwordOld)) {
            res.render('password-form', {message: "Incorrect old password", username: req.user.username});
            return;
        }
        if (req.body.passwordNew !== req.body.passwordNew2) {
            res.render('password-form', {message: "New passwords don't match", username: req.user.username});
            return;
        }
        fs.writeFile('./passwd', getHashedPassword(req.body.passwordNew), err1 => {
            if (err1) {
                console.log(err1);
                res.render('password-form', {message: "Request failed", username: req.user.username});
                return;
            }
            res.render('password-form', {successMessage: "Password changed", username: req.user.username});
        });
    });
});

module.exports = router;
