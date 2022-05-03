# Getting started

Clone the repository and run this command in console.

```bash
    npm start
```

This will initialize the server and the database with fake records.

To test the api respose you can open the following link in your browser or fire a GET request in postman.

[http://127.0.0.1:3000/api/v1/user/1/karma-position](http://127.0.0.1:3000/api/v1/user/1/karma-position)

To render the results on a HTML page use the link below.

[http://127.0.0.1:3000/user/1/karma-position](http://127.0.0.1:3000/user/1/karma-position)

The links pattern is:

> user/id/count[optional default is 5]/karma-position

## NOTE

You need to add your mysql configurations inside the .env file in order to be able to connect to the database.
