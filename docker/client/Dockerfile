FROM nginx:1.29-alpine

ARG APP_VERSION

COPY dist/client/ /usr/share/nginx/html/
COPY docker/client/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY dist/client/csp-hashes.conf /etc/nginx/csp-hashes.conf

RUN rm /usr/share/nginx/html/csp-hashes.conf

LABEL app.version=${APP_VERSION}

EXPOSE 3000
EXPOSE 4000
