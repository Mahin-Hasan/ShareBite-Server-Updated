const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


//connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4lo48xa.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        //Database Collections
        const foodCollection = client.db('shareBiite').collection('foods');
        const requestCollection = client.db('shareBiite').collection('requests');

        //read
        app.get('/foods', async (req, res) => {
            // const cursor = foodCollection.find();
            const cursor = foodCollection.find().sort({ expiredDateTime: 1 });// sorting from lowest to highest
            const result = await cursor.toArray();
            // console.log(result);
            // const sortedResult = result.sort({expiredDateTime: -1})
            res.send(result);
        })
        //add food 
        app.post('/foods', async (req, res) => {
            const newFood = req.body;
            const result = await foodCollection.insertOne(newFood);
            res.send(result)
        })
        // view single food by id
        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.findOne(query);
            res.send(result)
        })
        //update single food status to pending from available when food is requested
        app.patch('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedFood = req.body;
            console.log(updatedFood);
            const updateDoc = {
                $set: {
                    foodStatus: updatedFood.foodStatus
                },
            };
            const result = await foodCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        // Food request related api
        // app.get('/requests', async (req, res) => {
        //     const cursor = requestCollection.find();
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })
        // read request with some data
        app.get('/requests', async (req, res) => {
            console.log(req.query);
            console.log(req.query.loggedUserEmail);
            let query = {};
            if (req.query?.loggedUserEmail) {
                query = { loggedUserEmail: req.query.loggedUserEmail }
            }
            const result = await requestCollection.find(query).toArray();
            res.send(result);
        })
        //add food request
        app.post('/requests', async (req, res) => {
            const newRequest = req.body;
            // console.log(newRequest);
            const result = await requestCollection.insertOne(newRequest);
            res.send(result)
        })







        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('sharebite is running')
})

app.listen(port, () => {
    console.log(`sharebite server is running at port ${port}`);
})