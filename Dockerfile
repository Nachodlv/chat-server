FROM node:latest

COPY . /server/

WORKDIR /server
ENTRYPOINT npm start