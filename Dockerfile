FROM node:12.18.3-alpine
EXPOSE 3000 9229

WORKDIR /home/app

COPY package.json /home/app/
COPY yarn.lock /home/app/

RUN yarn install --frozen-lockfile

COPY . /home/app

CMD yarn start
