/*
* Class for the user that interacts with application.
* */
export default class User {
    name: string;
    online: boolean;
    id: number;

    constructor(name: string) {
        this.name = name;
        this.online = true;
        this.id = 0;
    }
}