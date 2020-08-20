FROM node:14.8.0-alpine
EXPOSE 9001

WORKDIR /home/app

COPY package.json /home/app/
COPY yarn.lock /home/app/

RUN yarn install --frozen-lockfile

COPY . /home/app

CMD yarn dev
