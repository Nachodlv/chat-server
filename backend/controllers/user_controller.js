/*
* Provides the routes for the login view and the ABM for the user
* */
class UserController {
    dirname: string;
    userProvider: UserProvider;
    encryptionService: EncryptionService;
    constructor(app, userProvider: UserProvider, dirname: string, requestLib, encryptionService) {
        this.app = app;
        this.userProvider = userProvider;
        this.dirname = dirname;
        this.request = requestLib;
        this.encryptionService = encryptionService;
        this.loginView();
        this.registerView();
        this.loginUser();
        this.saveUserImage();
        this.registerUser();
        this.getUser();
    }

    /*
    * Returns the view of the login.html
    * */
    loginView() {
        this.app.get('/login', (req, res) => {
            res.sendFile(this.dirname + '/frontend/views/login/login.html');
        });
    }

    /*
    * Returns the view of the register.html
    * */
    registerView() {
        this.app.get('/register', (req, res) => {
            res.sendFile(this.dirname + '/frontend/views/register/register.html');
        });
    }

    /*
    * Creates a new user.
    * If it is successful it will return a status code 200.
    * If the nickname is already used, it will return a status code 409.
    * */
    loginUser() {
        this.app.post('/login', (req, res) => {
            const user = req.body;
            this.userProvider.getUser(user.name, (oldUser, _) => {
                // TODO a server error should not be interpreted as user not found error.
                if(oldUser === undefined) {
                    res.status(404);
                    res.send('User not found');
                    return;
                }
                this.encryptionService.comparePassword(user.password, oldUser.password, (matches) => {
                    if(matches) {
                        res.status(200);
                        res.send(JSON.stringify(oldUser));
                    } else {
                        res.status(403);
                        res.send('Incorrect password');
                    }
                });

            });

        });
    }

    saveUserImage() {
        this.app.post('/save-image', (req, res) => {
            req.file('avatar').upload((err, uploadedFiles) => {
                if (err) return res.send(500, err);
                return res.json({
                    message: uploadedFiles.length + ' file(s) uploaded successfully!',
                    files: uploadedFiles
                });
            });
        });
    }

    getUserImage(path, id) {
        this.app.get('/image/' + id, (req, res) => {
            res.sendFile(path);
        });
    }

    validateImage(path, origin, callback) {
        const id = path.substring(path.lastIndexOf('/') + 1);
        this.getUserImage(path, id);
        this.request({url: 'https://eu-de.functions.cloud.ibm.com/api/v1/web/7e9d533d-cf28-46d0-8942-ce49cc1cfd0e/visual-recog-actions/clasify-image', qs:{url: origin + '/image/' + id}}, (error, response, body) => {
            callback(!error && response.statusCode === 200 && response.length, response.statusCode)
        });
    }

    registerUser() {
        this.app.post('/register', (req, res) => {
            const user = req.body;
            this.validateImage(user.imgPath, req.headers.origin, (isValid, status) => {
                if (isValid) {
                    this.encryptionService.hashPassword(user.password, (hashedPassword) => {
                        if(hashedPassword === undefined) {
                            res.status(500);
                            res.send('Error hashing the password');
                            return;
                        }
                        user.password = hashedPassword;
                        this.userProvider.getUser(user.name, (oldUser, _) => {
                            if(oldUser !== undefined) {
                                res.status(409);
                                res.send('Nickname already in use');
                                return;
                            }
                            this.userProvider.createUser(user, (newUser, error) => {
                                if(newUser !== undefined) {
                                    res.status(200);
                                    res.send(JSON.stringify(newUser));
                                } else {
                                    res.status(500);
                                    res.send(error);
                                }
                            });
                        });
                    });
                } else {
                    if (status === 200) {
                        res.status(403);
                        res.send('Profile picture should include a person');
                    } else {
                        res.status(500);
                        res.send('Internal Server Error');
                    }
                }
            });
        });
    };

    /*
    * Returns the user with the id provided in the url.
    * If no user is found, it returns a status code 404.
    * */
    getUser() {
        this.app.get('/user/:userId*', (req, res) => {
            const userId = Number(req.params['userId']);
            this.userProvider.getUserById(userId, (user, _) => {
                if(user) {
                    res.status(200);
                    res.send(JSON.stringify(user));
                } else {
                    res.status(404);
                    res.send('No user found with id: ' + userId);
                }
            });
        });
    }

}

module.exports = UserController;
