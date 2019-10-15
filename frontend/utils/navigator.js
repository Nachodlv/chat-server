export default class Navigator {
    static navigateTo(url) {
        const href = window.location.href;
        const split = href.split('/');
        console.log(split[0] + '//' + split[2] + url );
        window.location.href =  url ;
    }
}