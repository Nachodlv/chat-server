/*
* Provides the routes for the login view and the ABM for the user
* */
class UserController {
    constructor(app, Provider, dirname) {
        this.app = app;
        this.userProvider = new Provider();
        this.dirname = dirname;
        this.loginView();
        this.newUser();
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
    * Creates a new user.
    * If it is successful it will return a status code 200.
    * If the nickname is already used, it will return a status code 409.
    * */
    newUser() {
        this.app.post('/login', (req, res) => {
            const user = req.body;
            const result = this.userProvider.models.find((model) => model.name === user.name);
            if(result) {
                res.status(409);
                res.send('Nickname already in use');
                return;
            }
            const newUser = this.userProvider.createModel(user);
            res.status(200);
            res.send(JSON.stringify(newUser));
        });
    }
}

module.exports = UserController;