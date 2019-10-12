export class Provider {
    constructor() {
        this.models = [];
        this.id = 0;
    }

    /*
    * Returns the model that matches the id. If no model is found, it returns undefined
    * */
    getModel(id) {
        return this.models.find(model => model.id === id);
    }

    /*
    * Assign an id to the model and adds it to the model array. It returns the id assigned.
    * */
    createModel(model) {
        model.id = id;
        id++;
        this.models.push(model);
        return id;
    }

    /*
    * Deletes the model with the corresponding id. If no model is found it doesn't do anything.
    * */
    deleteModel(id) {
        this.models = this.models.filter(m => m.id !== id);
    }
}