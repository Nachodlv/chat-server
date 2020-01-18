class IpController {
    ipProvider: IpProvider;

    constructor(app, ipProvider) {
        this.ipProvider = ipProvider;
        this.app = app;

        this.getIps();
    }

    getIps() {
        this.app.post('/ips', (req, res) => {
            if(req.body && req.body.ips) {
                this.ipProvider.setIps(req.body.ips);
            }
            res.status(200);
            res.send('Ok');
        });
    }

}

module.exports = IpController;
