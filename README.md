# Carlos Perales | Portafolio web

Portafolio profesional publicado en [carlosperales.dev](https://carlosperales.dev/).
Frontend estático en HTML, CSS y JavaScript, con PocketBase para el formulario de contacto.

## Infraestructura verificada

Revisión del 16 de noviembre de 2026 mediante DNS, peticiones HTTPS y consultas de solo lectura a Azure.

| Elemento | Valor |
|---|---|
| Repositorio | https://github.com/carlosperalesa/Web.git |
| Carpeta local | `D:\OneDrive\GitHub\dev\Web` |
| Proyecto vecino | `D:\OneDrive\GitHub\dev\Khai` (independiente de esta web) |
| Proveedor | Microsoft Azure |
| Suscripción | Azure for Students |
| Máquina virtual | `vm-carlosperales` |
| Grupo de recursos | `rg-carlosperales` |
| Región | `chilecentral` |
| IP pública | `68.211.144.179` |
| Dominio | `carlosperales.dev` |
| Estado de la VM | `VM running` al verificar |

El dominio resolvió a la IP de esta VM. La página principal y `js/app.js` respondieron HTTP 200, con servidor Nginx. `/api/health` respondió HTTP 200 con `API is healthy.`. Estas comprobaciones no prueban el envío del formulario ni la entrega de correos.

Las rutas internas, servicios y certificados descritos a continuación proceden de los archivos del repositorio; no se inspeccionó por SSH la configuración activa del servidor. Las referencias anteriores a DigitalOcean y GitHub Pages no describen el alojamiento verificado.

## Cómo funciona

```text
Navegador -> HTTPS carlosperales.dev -> Nginx (VM de Azure)
                                       |-- / -> archivos estáticos
                                       |-- /api/ y /_/ -> PocketBase :8090
                                       |-- /automail-api/ -> AutoMail :8092
                                       +-- /bt/ -> backend :8091
```

La configuración versionada de Nginx sirve archivos desde `/var/www/portafolio`, redirige HTTP a HTTPS y utiliza certificados de Let's Encrypt. Incluye compresión, caché de recursos y limitación de peticiones para las API.

- **Frontend actual:** secciones de proyectos, perfil, habilidades, certificaciones y contacto; tema claro/oscuro, carruseles y efectos visuales. No requiere compilación ni un servidor Node.js.
- **Cabecera:** el desenfoque progresivo usa tres capas hasta 768 px y doce en pantallas más anchas. El efecto aparece al superar 8 px de desplazamiento y se oculta con la preferencia de transparencia reducida. La portada y las cuatro páginas de proyectos comparten [el CSS de la cabecera](css/header.css).
- **Contacto:** `js/app.js` envía nombre, teléfono, email, asunto y mensaje a `POST /api/collections/messages/records`.
- **PocketBase:** `pocketbase.service` lo ejecuta como usuario `pocketbase` en `127.0.0.1:8090`. Las migraciones definen la colección `messages`.
- **Notificaciones:** `pb_hooks/messages_notify.pb.js` intenta enviar un correo después de crear un mensaje. Requiere una configuración de correo válida en PocketBase; su entrega no fue comprobada.
- **AutoMail:** subproyecto Python/Flask que procesa archivos XLSX. Su launcher y servicio están versionados; escucha en `127.0.0.1:8092`. Su estado en producción está pendiente de validar. Consulta [su documentación](other/AutoMail/README.md).
- **Backend BT:** Nginx contiene un proxy a `127.0.0.1:8091`; no se verificó el servicio de destino.

## Estructura

```text
Web/
|-- index.html                  # Página principal
|-- css/                        # Estilos del sitio y componentes
|-- js/                         # Interacciones y formulario de contacto
|   |-- app.js
|   |-- theme-init.js
|   |-- header.js
|   |-- atmospheres.js
|   |-- carousels.js
|   |-- vendor/d3.js
|-- img/, fonts/, sounds/       # Recursos locales
|-- proyectos/                  # Casos de estudio y archivo vivo
|-- historial/                  # Versiones anteriores del portafolio
|-- other/                      # AutoMail, CV y otras aplicaciones
|-- pb_hooks/                   # Notificaciones de PocketBase
|-- pb_migrations/              # Esquema de mensajes
|-- nginx/carlosperales.dev.conf
|-- pocketbase.service
|-- automail.service
|-- start.sh                    # Script de despliegue Linux
|-- start.md                    # Operación y limitaciones del script
```

## Desarrollo local

Abre la carpeta `Web` y sirve su raíz con un servidor estático HTTP, por ejemplo Live Server si ya está disponible en el editor. No hay `package.json` ni paso de build para la página principal.

`js/app.js` selecciona `http://127.0.0.1:8090` cuando el hostname es `localhost` o `127.0.0.1`; en otros hosts utiliza `https://carlosperales.dev`. Se puede definir `window.PB_BASE_URL` antes de cargar `app.js` para apuntar a otra instancia. Abrir el archivo directamente o usar una IP de LAN no activa la detección local y puede dirigir el formulario a producción.

Para probar el formulario localmente hace falta una instancia de PocketBase con las migraciones y las reglas de acceso apropiadas. La vista estática puede revisarse sin backend. No se inició ningún servicio local durante esta revisión.

## Despliegue y operación

La VM de Azure sirve los archivos estáticos directamente desde `/var/www/portafolio`. Para publicar cambios de HTML y CSS desde un commit de `main`, sigue el [procedimiento de publicación estática](start.md#publicación-de-archivos-estáticos).

El script existente `start.sh` sincroniza el repositorio y prepara servicios systemd en Linux. Lee `/etc/environment` y admite `DEPLOY_ROOT` (por defecto `/var/www/portafolio`). Los archivos de Nginx, systemd y el launcher de AutoMail mantienen esa ruta fija: cambiar solo `DEPLOY_ROOT` no cambia toda la instalación.

GitHub Actions publica el portafolio estático al hacer push a `main`. Consulta [start.md](start.md) antes de ejecutar el script de aprovisionamiento.

## Pendientes de validación

- Comprobar la configuración activa de Nginx. El estado de Nginx, PocketBase y AutoMail se comprobó por SSH el 21 de noviembre de 2026.
- Verificar AutoMail (`/automail-api/health`), el backend BT y la entrega de correos.
- Revisar reglas de privacidad de `messages`: la migración inicial deja `listRule` y `viewRule` vacías, permitiendo lectura pública si se aplican sin cambios. No se consultaron mensajes ni se confirmó que producción conserve esas reglas.
- Mantener secretos y datos fuera de Git; `pb_data/`, entornos virtuales y el runtime de AutoMail están excluidos en `.gitignore`.
