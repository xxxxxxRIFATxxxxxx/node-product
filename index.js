const express = require('express');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vwkey.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("productsDB");
        const products = database.collection("products");
        const cart = database.collection("cart");

        // GET ALL PRODUCTS API
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = products.find(query);
            const count = await cursor.count();

            const currentPage = parseInt(req.query.currentPage);
            const size = parseInt(req.query.size);

            let productsArray;
            if (currentPage) {
                productsArray = await cursor.skip(currentPage * size).limit(size).toArray();
            }

            else {
                productsArray = await cursor.toArray();
            }

            res.send({
                count,
                productsArray
            });
        });

        // GET SINGLE PRODUCT API
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const cursor = products.findOne(query);
            const singleProduct = await cursor;
            res.send(singleProduct);
        });

        // POST PRODUCT API
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await products.insertOne(product);
            res.send(result);
        });

        // UPDATE SINGLE PRODUCT API
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = req.body;
            const updateDoc = {
                $set: {
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    description: product.description
                },
            };
            const result = await products.updateOne(query, updateDoc);
            res.send(result);
        });

        // DELETE SINGLE PRODUCT API
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await products.deleteOne(query);
            res.send(result);
        });

        // GET ALL CART API
        app.get('/cart', async (req, res) => {
            const query = {};
            const cursor = cart.find(query);
            const cartArray = await cursor.toArray()
            res.send(cartArray);
        });

        // POST CART API
        app.post('/cart', async (req, res) => {
            const product = req.body;
            const result = await cart.insertOne(product);
            res.send(result);
        });

        // UPDATE SINGLE CART API
        app.put('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = req.body;
            const updateDoc = {
                $set: {
                    key: product.key,
                    category: product.category,
                    name: product.name,
                    seller: product.seller,
                    wholePrice: product.wholePrice,
                    priceFraction: product.priceFraction,
                    stock: product.stock,
                    star: product.star,
                    starCount: product.starCount,
                    img: product.img,
                    url: product.url,
                    features: product.features,
                    price: product.price,
                    shipping: product.shipping,
                    qty: product.qty
                },
            };
            const result = await cart.updateOne(query, updateDoc);
            console.log(result)
            res.send(result);
        });
    }

    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});