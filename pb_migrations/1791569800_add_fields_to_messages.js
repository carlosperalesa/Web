/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("messages");

    collection.fields.add(new TextField({
        name: "name",
        required: true,
    }));

    collection.fields.add(new TextField({
        name: "phone",
        required: false,
    }));

    collection.fields.add(new EmailField({
        name: "email",
        required: true,
    }));

    collection.fields.add(new TextField({
        name: "subject",
        required: false,
    }));

    collection.fields.add(new TextField({
        name: "message",
        required: true,
    }));

    app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("messages");
    collection.fields.removeByName("name");
    collection.fields.removeByName("phone");
    collection.fields.removeByName("email");
    collection.fields.removeByName("subject");
    collection.fields.removeByName("message");
    app.save(collection);
});
