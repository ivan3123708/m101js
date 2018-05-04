/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
        "use strict";

        this.db.collection('item').aggregate([
            {
                $group: {
                    _id: "$category",
                    num: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]).toArray((err, docs) => {
            if (err) {
                throw err;
            }

            var categories = [];

            var allNum = docs.reduce((acc, curr) => acc += curr.num, 0);

            categories.push({
                _id: "All",
                num: allNum
            });
            categories = categories.concat(docs);

            callback(categories);
        });
    }


    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

        var query = category === 'All' ? {} : { category: category };

        this.db.collection('item').find(query).sort({ _id: 1 }).skip(page === 0 ? 0: itemsPerPage * page).limit(itemsPerPage).toArray((err, docs) => {
            if (err) {
                throw err;
            }

            var pageItems = [];
            for (var i = 0; i < docs.length; i++) {
                pageItems.push(docs[i]);
            }

            callback(pageItems);
        });
    }


    this.getNumItems = function(category, callback) {
        "use strict";

        var numItems = 0;

        var query = category === 'All' ? {} : { category: category };

        this.db.collection('item').find(query).toArray((err, docs) => {
            if (err) {
                throw err;
            }

            callback(docs.length);
        });
    }


    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

        this.db.collection('item').find({ $text: { $search: query } }).sort({ _id: 1 }).skip(page === 0 ? 0 : itemsPerPage * page).limit(itemsPerPage).toArray((err, docs) => {
            if (err) {
                throw err;
            }

            var items = [];

            for (var i = 0; i < docs.length; i++) {
                items.push(docs[i]);
            }

            callback(items);
        });
    }


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        this.db.collection('item').find({ $text: { $search: query } }).toArray((err, docs) => {
            if (err) {
                throw err;
            }

            var numItems = docs.length;

            callback(numItems);
        });
    }


    this.getItem = function(itemId, callback) {
        "use strict";

        this.db.collection('item').findOne({ _id: itemId })
            .then((item) => {
                callback(item);
            })
            .catch((err) => console.log(err));;
    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";
        
        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }

        this.db.collection('item').updateOne({ _id: itemId }, { $push: { reviews: reviewDoc } })
            .then((doc) => {
                callback(doc);
            })
            .catch((err) => console.log(err));
    }


    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
