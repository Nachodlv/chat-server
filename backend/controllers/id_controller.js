class IdController {

    constructor(app) {
        this.app = app;
        this.id = process.env.CF_INSTANCE_GUID || 'local';
        this.getId();
    }

    getId() {
        this.app.get('/id', (req, res) => {
            res.status(200);
            res.send(this.id);
        });
    }

}

module.exports = IdController;
