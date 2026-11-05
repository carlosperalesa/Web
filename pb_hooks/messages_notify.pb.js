/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
    e.next()

    try {
        const senderAddress = e.app.settings().meta.senderAddress || "noreply@carlosperales.dev";
        const senderName = e.app.settings().meta.senderName || "CarlosPerales.dev";
        const message = new MailerMessage({
            from: {
                address: senderAddress,
                name: senderName,
            },
            to: [{ address: "carlosperalesa@gmail.com" }],
            subject: "Nuevo mensaje en el portafolio: " + e.record.get("subject"),
            html: "<h2>Nuevo mensaje de contacto</h2>" +
                "<p><strong>Nombre:</strong> " + e.record.get("name") + "</p>" +
                "<p><strong>Email:</strong> " + e.record.get("email") + "</p>" +
                "<p><strong>Telefono:</strong> " + e.record.get("phone") + "</p>" +
                "<p><strong>Asunto:</strong> " + e.record.get("subject") + "</p>" +
                "<p><strong>Mensaje:</strong><br>" + e.record.get("message") + "</p>",
        })

        e.app.newMailClient().send(message)
    } catch (err) {
        console.log("Error al enviar email de notificacion:", err)
    }
}, "messages")
