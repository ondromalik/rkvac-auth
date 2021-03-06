var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const {exec} = require("child_process");
const fs = require('fs');
const net = require('net');

var userDB = {
    user: [
        {
            _id: 1,
            username: 'admin',
            password: '',
            role: 'admin'
        },
        {
            _id: 2,
            username: 'teacher',
            password: 'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=',
            role: 'user'
        },
        {
            _id: 3,
            username: 'student',
            password: 'hJg8YPfarcHLhphiH4AsDZ+aPDwpXIEHSPsEgRXBhuw=',
            role: 'guest'
        }
    ]
};

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    return sha256.update(password).digest('base64');
}

// Register a login strategy
passport.use('login', new LocalStrategy(
    function (username, password, done) {
        let hashedPassword = getHashedPassword(password);
        let userFound = false;
        try {
            userDB.user[0].password = fs.readFileSync('./passwd').toString();
        } catch (e) {
            console.log(e);
        }
        for (user of userDB.user) {
            if (user.username === username) {
                if (user.password === hashedPassword) {
                    return done(null, user);
                } else {
                    done(null, false, {message: 'Invalid password'});
                }
                userFound = true;
            }
        }
        if (!userFound) {
            done(null, false, {message: 'Invalid username'});
        }
    }
));
let rkvacUsed = false;
passport.use('verify', new LocalStrategy(
    {passwordField: 'userrole', passReqToCallback: true},
    function (req, username, password, done) {
        if (rkvacUsed) {
            done(null, false, {message: 'RKVAC library is currently in use, please try later.'});
            return;
        }
        rkvacUsed = true;
        let requestedAccess;
        let positionFile = "";
        switch (req.body.userrole) {
            case 'admin':
                requestedAccess = 'DBAdmin.att';
                positionFile = "./data/Verifier/adminPosition.dat";
                break;
            case 'teacher':
                requestedAccess = 'DBTeacher.att';
                positionFile = "./data/Verifier/teacherPosition.dat";
                break;
            case 'student':
                requestedAccess = 'DBStudent.att';
                positionFile = "./data/Verifier/studentPosition.dat";
                break;
        }
        fs.readFile(positionFile, 'utf-8', (err, data) => {
            if (err) {
                console.log(err);
                done(null, false, {message: 'Request failed - RKVAC error'});
                rkvacUsed = false;
                return;
            }
            var command = "printf '" + data + "\\n' | ./rkvac-protocol-multos-1.0.0 -v -a " + requestedAccess;
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log(`stdout: ${stdout}`);
                    console.log(`error: ${error.message}`);
                    if (error.message.includes('ACCESS DENIED')) {
                        done(null, false, {message: 'ACCESS DENIED'});
                    }
                    else {
                        done(null, false, {message: 'Request failed'});
                    }
                    rkvacUsed = false;
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    console.log(`stdout: ${stdout}`);
                    done(null, false, {message: 'Request failed'});
                    rkvacUsed = false;
                    return;
                }
                console.log(`stdout: ${stdout}`);
                for (user of userDB.user) {
                    if (user.username === username) {
                        rkvacUsed = false;
                        return done(null, user);
                    }
                }
            });
        })
    }
));

// Required for storing user info into session
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

// Required for retrieving user from session
passport.deserializeUser(function (id, done) {
    // The user should be queried against db
    // using the id
    done(null, user);
});

module.exports = passport;