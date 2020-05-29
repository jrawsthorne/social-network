# Setup

Install the required dependencies

```
npm install
```

# Config

Configuration settings can be changed in config/config.env

NODE_ENV: production or development, defaults to development

PORT: port the express and socket.io servers run on, defaults to 3000

MONGO_URI: formatted monogodb URL, defaults to a pre-seeded remote database

# DB Seeding

The file seed.js contains all the information to seed the database with the provided users, posts and likes. It can be run with:

```
npm run seed
```

Please note this can take some time

# Run

To start the express and socket.io server run:

```
npm run start
```
