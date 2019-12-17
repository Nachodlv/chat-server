
/*
* Service used to add and get cookies.
* */
export class CookieService {

    /*
    * Sets a cookie with a given name, value and expiration days
    * */
    static setCookie(cname: string, cvalue: string, exdays = 1) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        const expires = "expires="+ d.toUTCString();
        window.document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    static removeCookie(cname: string) {
        window.document.cookie = cname + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
    }

    /*
    * Returns the value of a cookie with the name 'cname'.
    * Returns and empty string if cookie does not exist.
    * */
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
