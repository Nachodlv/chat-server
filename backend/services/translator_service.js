class TranslatorService {
    url: string;

    constructor(request) {
        this.request = request;
        this.url = "https://eu-de.functions.cloud.ibm.com/api/v1/web/Gianluca.Scolaro%40Student.Reutlingen-University.DE_dev/hrt-demo/identify-and-translate";
    }

    translatate(message: string, callback: (string) => void) {
        this.request({
            url: this.url,
            qs: {text: message}
        }, (error, response, _) => {
            let translatedMessage = message;
            if (!error && response.statusCode === 200) {
                const translations = JSON.parse(response.body).translations;
                translatedMessage = translations !== undefined ? translations : message;
            }

            callback(translatedMessage);
        });
    }
}

module.exports = TranslatorService;
