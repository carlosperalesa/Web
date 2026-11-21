# Despliegue y operación de CarlosPerales.dev

Documentación contrastada con `start.sh`, los servicios systemd y Nginx del repositorio el 21 de noviembre de 2026. La web está alojada en la VM de Azure `vm-carlosperales` (Azure for Students, `chilecentral`, IP `68.211.144.179`). El inventario y las comprobaciones públicas están en [README.md](README.md).

## Publicación de archivos estáticos

La raíz activa `/var/www/portafolio` es un directorio de archivos estáticos. Para cambios de HTML o CSS, transfiere los archivos del commit de `main` publicado en GitHub mediante el alias SSH `vm-carlosperales`.

1. Compara los SHA-256 de los archivos publicados con los del commit anterior para detectar cambios en producción.
2. Extrae del commit nuevo los archivos a publicar y cópialos con `scp` a un directorio temporal privado en la VM. Comprueba sus SHA-256 después de la transferencia.
3. Respalda los archivos actuales en `/var/backups`, fuera de la raíz web. Copia cada reemplazo junto a su destino con propietario `root:root` y modo `0644`, y actívalo con un renombrado. Publica primero el CSS y después el HTML que referencia su versión.
4. Comprueba por HTTPS que las páginas referencien el nuevo parámetro `v` y que el recurso entregado coincida con el commit. Si falla la verificación, restaura los archivos respaldados y vuelve a comprobar las rutas.

Para la cabecera, comprueba la portada y los proyectos Archivo vivo, Ghivs, ProdQuim y TNSP. Abre una página a un ancho de hasta 768 px y desplázate más de 8 px para comprobar el degradado y el menú móvil.

## Alcance de start.sh

El script requiere Linux, permisos administrativos y un checkout Git existente. Utiliza servicios del host (systemd, Nginx y un entorno virtual Python); no despliega contenedores. No se ejecutó durante la revisión documental.

1. Carga `/etc/environment` y determina `MAIN_DIR` mediante `DEPLOY_ROOT`, cuyo valor por defecto es `/var/www/portafolio`.
2. Sincroniza Git mediante `fetch --all --prune --tags`, selecciona `main`, `master` o la rama actual y ejecuta `reset --hard` contra la rama remota, con fallback a `HEAD`. También elimina una lista fija de archivos residuales.
3. Instala soporte Python mediante apt, crea el entorno `other/AutoMail/.venv` e instala sus dependencias.
4. Si falta el ejecutable, descarga PocketBase **0.36.5** en `MAIN_DIR`, seleccionando el binario según arquitectura. Esa es la versión fijada por el script, no una versión instalada comprobada.
5. Copia las unidades `pocketbase.service` y `automail.service`, recarga systemd, habilita y reinicia los servicios.
6. Ajusta permisos de recursos estáticos y directorios de datos/runtime.
7. Copia la configuración de Nginx, crea el enlace en `sites-enabled`, ejecuta `nginx -t` y, si pasa, recarga Nginx.

## Condiciones antes de desplegar

- El checkout debe existir en `/var/www/portafolio` y tener acceso al repositorio remoto.
- Revisar y respaldar cambios locales del servidor: `reset --hard` descarta modificaciones de archivos rastreados. No es un despliegue que preserve automáticamente cambios locales.
- Nginx, systemd, curl, unzip y los certificados referenciados deben estar preparados; el script no configura por completo un servidor vacío.
- El usuario y grupo `pocketbase` deben existir; el script no los crea.
- Respaldar datos de PocketBase y configuración operativa antes de cambios.
- Las rutas de las unidades, el launcher y Nginx están fijadas en `/var/www/portafolio`. Cambiar solo `DEPLOY_ROOT` no basta.

## Servicios versionados

| Servicio | Configuración |
|---|---|
| PocketBase | Usuario/grupo `pocketbase`; directorio `/var/www/portafolio`; ejecutable `./pocketbase serve --http=127.0.0.1:8090` |
| AutoMail | Usuario/grupo `root`; directorio `/var/www/portafolio/other/AutoMail`; ejecuta `launch.sh` |
| Launcher AutoMail | Crea `.venv` si falta, instala dependencias y ejecuta `server.py` en `127.0.0.1:8092` |
| Nginx | HTTP a HTTPS; raíz `/var/www/portafolio`; proxies PocketBase, AutoMail y BT |

La configuración de BT apunta a `127.0.0.1:8091`, pero este script no instala ni reinicia ese backend.

## Ejecución y automatización

`start.sh` está previsto para aprovisionar o actualizar servicios desde un checkout revisado con privilegios administrativos. El script reinicia servicios y puede interrumpir peticiones; no ofrece garantía de despliegue sin interrupciones ni rollback automático.

Las directrices del proyecto piden canalizar automatizaciones mediante Makefile. El repositorio todavía no incluye un Makefile ni workflows en `.github/workflows`.

## Verificación posterior

Comprobar de forma independiente:

- `https://carlosperales.dev/`: página principal y recursos estáticos.
- `https://carlosperales.dev/api/health`: salud de PocketBase.
- `https://carlosperales.dev/automail-api/health`: salud de AutoMail, pendiente de comprobar en esta revisión.
- Estado y logs de `pocketbase`, `automail` y Nginx mediante systemd/journal en el servidor.
- Formulario y entrega de correo mediante una prueba acordada; la salud de la API no prueba ambos flujos.

No existe `check.sh` en este checkout. No utilizar las referencias antiguas a ese archivo como un procedimiento disponible.

## Diagnóstico

Si falla una comprobación, revisar los logs del servicio afectado y el resultado de `nginx -t` antes de volver a desplegar. Ejecutar `start.sh` como diagnóstico puede descartar cambios y reiniciar servicios innecesariamente. Las reglas de privacidad de mensajes también requieren una revisión específica; consultar los pendientes del README.
