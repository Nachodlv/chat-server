class IpProvider {
    ips: string[];
    constructor(io) {
        this.ips = [];
        this.io = io;
    }

    setIps(ips) {
        // io.adapter()
        this.ips = ips;
    }
}

module.exports = IpProvider;
