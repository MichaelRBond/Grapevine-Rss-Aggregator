# Grapevine RSS Aggregator

[![Build Status](https://travis-ci.org/MichaelRBond/Grapevine-Rss-Aggregator.svg?branch=master)](https://travis-ci.org/MichaelRBond/Grapevine-Rss-Aggregator)

RSS Aggregator written in Typescript


## Motivation

Being an avid user of RSS since the late 1990s, I have become tired of the RSS software I use disappearing when the software authors lose interest (I'm looking at you Google, Fever, etc ...). Since RSS is s daily use for me, I decided to write my own solution.

Grapevine RSS Aggregator is the backend service. This is the "sync" engine. Run and maintain your own aggregator with an API and connect to it with a client.

Grapevine RSS Reader is the initial frontend service. This is the client, or user interface.

My hope is that other RSS readers will integrate the API

### Setup

Container: https://hub.docker.com/r/mrbond/grapevine-rss-aggregator/

## Database

If you are using docker compose, you can skip to step #2 and just run `yarn dbm up` to apply all the database migrations.

1. Create the datbase and user

    The following creates a new database called `grapevine_rss` and gives a new user `grapevine` with password `rss` full access to it.

    ```bash
    mysql -h 127.0.0.1 -u root -p < ./installation/create_database.sql
    ```

1. Run database migrations

    ```bash
    yarn dbm up
    ```

1. Run datbase migration in docker. Replace `src_grapevine-aggregator_1` with the container id

    ```bash
    docker exec -it src_grapevine-aggregator_1 yarn dbm up
    ```

## Creating a user

Currently all users are read/write. When creating a user a password will be generated. The password will only be displayed once. Be sure to keep the output of the script in a safe place.

To create an account with USERNAME

1. While running locally `yarn run add-account -u USERNAME`
1. While running in Docker `docker exec -e DB_HOST=mysql -e DB_USER=grapevine -e CONFIG_ENV=prod -it CONTAINER_ID yarn run add-account -u USERNAME`

### Running in Production

datbase information can be passed into the application via ENV variables.

* DB_HOST
* DP_PORT
* DB_USER
* DB_PASSWD

#### Docker Compose

```yaml
  mysql:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: 12345
      MYSQL_DATABASE: node_rss_aggregator
      MYSQL_USER: rss
      MYSQL_PASSWORD: rss
    ports:
      - 3306:3306
    volumes:
      - mysql:/var/lib/mysql
  grapevine-rss:
    image: mrbond/grapevine-rss-aggregator
    environment:
      CONFIG_ENV: prod
      DB_HOST: mysql
      DB_USER: DATABASE_USER
      DB_PASSWD: DATABASE_PASSWORD
    ports:
      - 3000:3000
    command: run start
```

## API

Why a new API? Given that Fever's API is available in some existing RSS Reading software, I considered using it as Grapevine's API. However, given some of the features i'm intereted in adding in the future, I would have had to extend it. In the end, I think it will be much cleaner to build a new API.

### Feeds

#### Create

URL: `/api/v1/feed`

Method: `POST`

Payload:

```javascript
{
  title: Joi.string().required(),
  url: Joi.string().uri().required(),
}
```

#### Update

URL: `/api/v1/feed`

Method: `PUT`

Payload:

```javascript
{
  id: Joi.number().integer().min(1).required(),
  title: Joi.string().required(),
  url: Joi.string().uri().required(),
}
```

#### Get

URL: `/api/v1/feed`

Method: `GET`

Response:

```javascript
{
  id: Joi.number().integer().min(1).required(),
  title: Joi.string().required(),
  url: Joi.string().uri().required(),
  added_on: Joi.number().required(),
  last_updated: Joi.number().required(),
}
```

### Groups

#### Add Group

URL: `/api/v1/group`

Method: `POST`

Payload:

```javascript
{
  name: Joi.string().required(),
}
```

Response:

```javascript
{
  id: Joi.number().integer().min(1).required(),
  name: Joi.string().required(),
}
```

#### Update Group

URL: `/api/v1/group/{id}`

Method: `PUT`

Payload:

```javascript
{
  name: Joi.string().required(),
}
```

Response:

```javascript
{
  id: Joi.number().integer().min(1).required(),
  name: Joi.string().required(),
}
```

#### Get List of Groups

URL: `/api/v1/group`

Method: `GET`

Response:

```javascript
[
  {
    id: Joi.number().integer().min(1).required(),
    name: Joi.string().required(),
  }
]
```

#### Get Group

URL: `/api/v1/group/{id}`

Method: `GET`

Response:

```javascript
  {
    id: Joi.number().integer().min(1).required(),
    name: Joi.string().required(),
  }
```

#### Delete Group

URL: `/api/v1/group/{id}`

Method: `DELETE`

### Feed Groups

#### Add Feed to Group

URL: `/api/v1/feed-group`

Method: `POST`

Payload:

```javascript
{
  feed_id: Joi.number().integer().min(1),
  group_id: Joi.number().integer().min(1),
}
```

Response:

```javascript
{
  groups: Joi.array().items(joiGroupResponse),
}
```

#### Delete Feed from Group

URL: `/api/v1/feed-group`

Method: `DELETE`

Payload:

```javascript
{
  feed_id: Joi.number().integer().min(1),
  group_id: Joi.number().integer().min(1),
}
```

Response:

```javascript
{
  groups: Joi.array().items(joiGroupResponse),
}
```

#### Get Groups for Feed

URL: `/api/v1/feed/{id}/groups`

Method: `GET`

Response:

```javascript
{
  groups: Joi.array().items(joiGroupResponse),
}
```

#### Get Feeds in group

URL: `/api/v1/group/{id}/feeds`

Method: `GET`

Response:

```javascript
{
  feeds: Joi.array().items(joiRssFeedApiResponse),
}
```

### Items

#### Get Items in Feed

URL: `/api/v1/items/feed/{id}/{flags*}`

*flags*: optional. `/` delimited list of `read`, `starred`, `unread`, `unstarred`

Method: `GET`

Response:

```javascript
[
  {
    author: Joi.string().optional().allow(null, ""),
    categories: Joi.array().items(Joi.string().allow(null, "")).optional(),
    comments: Joi.string().optional().allow(null, ""),
    description: Joi.string().optional().allow(null, ""),
    enclosures: Joi.array().items(Joi.string().allow(null, "")).optional(),
    feed_id: Joi.number().min(1).required(),
    guid: Joi.string().required(),
    id: Joi.number().min(1).required(),
    image: Joi.object().optional(),
    link: Joi.string().optional().allow(null, ""),
    published: Joi.date(),
    read: Joi.boolean().required(),
    starred: Joi.boolean().required(),
    summary: Joi.string().optional().allow(null, ""),
    title: Joi.string().optional().allow(null, ""),
    updated: Joi.date(),
  }
]
```

#### Get items

URL: `/api/v1/items/{flags*}`

*flags*: optional. `/` delimited list of `read`, `starred`, `unread`, `unstarred`

Method: `GET`

Response:

```javascript
[
  {
    author: Joi.string().optional().allow(null, ""),
    categories: Joi.array().items(Joi.string().allow(null, "")).optional(),
    comments: Joi.string().optional().allow(null, ""),
    description: Joi.string().optional().allow(null, ""),
    enclosures: Joi.array().items(Joi.string().allow(null, "")).optional(),
    feed_id: Joi.number().min(1).required(),
    guid: Joi.string().required(),
    id: Joi.number().min(1).required(),
    image: Joi.object().optional(),
    link: Joi.string().optional().allow(null, ""),
    published: Joi.date(),
    read: Joi.boolean().required(),
    starred: Joi.boolean().required(),
    summary: Joi.string().optional().allow(null, ""),
    title: Joi.string().optional().allow(null, ""),
    updated: Joi.date(),
  }
]
```

#### Update item status

URL: `/api/v1/item/{id}/status`

Method: `POST`

Payload:

```javascript
{
  flag: Joi.string().only(
    ItemFlags.read,
    ItemFlags.unread,
    ItemFlags.starred,
    ItemFlags.unstarred,
  ),
}
```

## TODO

- [ ] Option to run a cleanup process to remove read, unstarred, items after they are X days old.
- [ ] Delete a feed
- [ ] Parse title from feed when adding a new feed, if none is provided
- [ ] Download and store favicon
- [ ] Swagger Docs
- [ ] Read only users
- [ ] Support for Password protected RSS feeds
- [ ] Tagging support
- [ ] Multiple Users
