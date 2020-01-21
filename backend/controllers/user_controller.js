/*
* Provides the routes for the login view and the ABM for the user
* */
class UserController {
    dirname: string;
    userProvider: UserProvider;
    encryptionService: EncryptionService;
    objectStorageService: ObjectStorageService;
    constructor(app, userProvider: UserProvider, dirname: string, requestLib, objectStorageService: ObjectStorageService, encryptionService, fs) {
        this.app = app;
        this.userProvider = userProvider;
        this.dirname = dirname;
        this.request = requestLib;
        this.objectStorageService = objectStorageService;
        this.encryptionService = encryptionService;
        this.fs = fs;
        this.loginView();
        this.registerView();
        this.loginUser();
        // this.saveUserImage();
        this.registerUser();
        this.getUser();
        this.getImage();
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

    getImage() {
        this.app.get('/image/:imagePath', (req, res) => {
           this.objectStorageService.getObject(req.params['imagePath'], (data: any, error) => {
               if (error) {
                   res.status(500);
                   res.send(error);
               } else {
                   res.status(200);
                   res.send(data.Body);
               }
           })
        });
    }

    validateImage(imageBuffer, callback) {
        this.request.post(
            {
                url: 'https://eu-de.functions.cloud.ibm.com/api/v1/web/7e9d533d-cf28-46d0-8942-ce49cc1cfd0e/visual-recog-actions/clasify-image',
                body: {imageString: imageBuffer},
                json: true},
            (error, response, body) => {
                callback(!error && response.statusCode === 200 && response.body.array.length, response.statusCode)
            });
    }

    saveImage(userName, fileName, fileType, fileSize, imageBuffer, callback: (fileKey: string, error) => void) {
        this.objectStorageService.putObject(userName, fileName, fileType, fileSize, imageBuffer, (result, error) => {
            callback(result, error)
        })
    }

    registerUser() {
        this.app.post('/register', (req, res) => {
            const user = JSON.parse(req.body.user);
            const file = req.files.imageFile;
            this.validateImage(file.data, (isValid, status) => {
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
                            this.saveImage(user.name, file.name, file.mimetype, file.size, file.data, (fileKey, error1) => {
                                if (error1) {
                                    res.status(500);
                                    res.send(error1);
                                } else {
                                    user.imgPath = fileKey;
                                    this.userProvider.createUser(user, (newUser, error2) => {
                                        if(newUser !== undefined) {
                                            res.status(200);
                                            res.send(JSON.stringify(newUser));
                                        } else {
                                            res.status(500);
                                            res.send(error2);
                                            //TODO delete image from bucket
                                        }
                                    });
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

    /*removeFile(path) {
        this.fs.unlink(path, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            //file removed
        })
    }*/

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
