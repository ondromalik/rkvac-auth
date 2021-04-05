var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const {exec} = require("child_process");

var userDB = {
    user: [
        {
            _id: 1,
            username: 'admin',
            password: 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=',
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

passport.use('verify', new LocalStrategy(
    {passwordField: 'userrole', passReqToCallback: true},
    function (req, username, password, done) {
        let requestedAccess;
        switch (req.body.userrole) {
            case 'admin':
                requestedAccess = 'DBAdmin.att';
                break;
            case 'teacher':
                requestedAccess = 'DBTeacher.att';
                break;
            case 'student':
                requestedAccess = 'DBStudent.att';
                break;
        }
        var command = "printf '1\\n' | ./rkvac-protocol-multos-1.0.0 -v -a " + requestedAccess;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                console.log(`stdout: ${stdout}`);
                done(null, false, {message: 'Přístup odepřen'});
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                console.log(`stdout: ${stdout}`);
                done(null, false, {message: 'Přístup odepřen'});
                return;
            }
            console.log(`stdout: ${stdout}`);
            for (user of userDB.user) {
                if (user.username === username) {
                    return done(null, user);
                }
            }
        });
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