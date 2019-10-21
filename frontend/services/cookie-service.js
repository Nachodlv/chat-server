
export class CookieService {

    static setCookie(cname: string, cvalue, exdays = 1) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        const expires = "expires="+ d.toUTCString();
        window.document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    static getCookie(cname): string {
        const name = cname + "=";
        const decodedCookie = decodeURIComponent(window.document.cookie);
        const ca = decodedCookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
}
