/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = new Collection({
        name: "messages",
        type: "base",
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: null,
        deleteRule: null,
        fields: [
            new TextField({ name: "name", required: true }),
            new TextField({ name: "phone" }),
            new EmailField({ name: "email", required: true }),
            new TextField({ name: "subject" }),
            new TextField({ name: "message", required: true }),
        ],
    });

    app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("messages");
    app.delete(collection);
});
