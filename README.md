# Final Project App from M101JS: MongoDB for Node.js Developers Course
## Setup
1.  Install the dependencies.
2.  Make sure you have a mongod running version 3.2.x of MongoDB.
3.  Import the "item" collection:  mongoimport  --drop  -d  mongomart  -c  item data/items.json
4.  Import the "cart" collection:  mongoimport  --drop  -d  mongomart  -c  cart data/cart.json
5.  Run the application by typing "node mongomart.js" in the mongomart directory.