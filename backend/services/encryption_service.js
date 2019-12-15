class EncryptionService {
    saltRounds: number;

    constructor(bCrypt) {
        this.bCrypt = bCrypt;
        this.saltRounds = 10;
    }

    hashPassword(password: string, result: (string) => void) {
        this.bCrypt.hash(password, this.saltRounds, function (err, hash) {
            if (err === undefined && hash !== undefined) result(hash);
            else {
                console.log("Error hashing the password.\n" + err);
                result(undefined);
            }
        });
    }

    comparePassword(password: string, hash: string, result: (boolean) => void) {
        this.bCrypt.compare(password, hash, function(err, res) {
            if (err === undefined && res !== undefined) result(res);
            else {
                console.log("Error hashing the password.\n" + err);
                result(false);
            }
        });
    }
}

module .exports = EncryptionService;
