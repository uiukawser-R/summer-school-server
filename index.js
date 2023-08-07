const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



// const verifyJWT=(req,res,next)=>{
//     const authorization=req.headers.authorization;
//     if(!authorization){
//         return res.status(401).send({error:true, message:'unauthorize access'});
//     }
//     const token =authorization.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
//         if(err){
//             return res.status(401).send({error:true, message:'unathorize access'})
//         }
//         req.decoded=decoded;
//         next();
//     })
// }


const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });
    }
    // bearer token
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}



const { MongoClient, ServerApiVersion, MongoAWSError, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.opp4yua.mongodb.net/?retryWrites=true&w=majority`;

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


        const classCollection = client.db("schoolDB").collection("class");
        const classesCollection = client.db("schoolDB").collection("classes");
        const usersCollection = client.db("schoolDB").collection("users");
        const cartsCollection = client.db("schoolDB").collection("carts");
        const instructoclassesCollection = client.db("schoolDB").collection("instructoclasses");


        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

            res.send({ token })
        })

        // ........................................................
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ error: true, message: 'forbidden message' });
            }
            next();
        }


        const verifyInstructor = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'instructor') {
                return res.status(403).send({ error: true, message: 'forbidden message' });
            }
            next();
        }
        // ...........................................................

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })


        // app.get('/users/admin/:email',verifyJWT, async (req,res)=>{
        //     const email= req.params.email;
        //     if(req.decoded.email !== email){
        //         res.send({admin:false})
        //     }
        //     const query={email:email}
        //     const user=await usersCollection.findOne(query);
        //     const result={admin: user?.role === 'admin'}
        //     res.send(result);
        // })





 1//////////////////////////////////////////////////////////////////       

        app.get('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            if (req.decoded.email !== email) {
                return res.send({ admin: false })
            }

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);
        })


        app.get('/users/instructor/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            if (req.decoded.email !== email) {
                return res.send({ instructor: false });
            }

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const result = { instructor: user?.role === 'instructor' };
            res.send(result);
        });









        
1//////////////////////////////////////////////////////////////////////





2//////////////////////////////////////////////////////////
        // app.patch('/users/admin/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const updateDoc = {
        //         $set: {
        //             role: 'admin'
        //         },
        //     };
        //     const result = await usersCollection.updateOne(filter, updateDoc);
        //     res.send(result);
        // })

        // app.patch('/users/instructor/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const updateDoc = {
        //         $set: {
        //             role: 'instructor'
        //         },
        //     };
        //     const result = await usersCollection.updateOne(filter, updateDoc);
        //     res.send(result);
        // })



        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id;
            const { role } = req.body; 
          
            if (role !== 'admin' && role !== 'instructor') {
              return res.status(400).send({ error: true, message: 'Invalid role' });
            }
          
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
              $set: {
                role: role,
              },
            };
          
            try {
              const result = await usersCollection.updateOne(filter, updateDoc);
              res.send(result);
            } catch (err) {
              res.status(500).send({ error: true, message: 'Error updating user role' });
            }
          })


2///////////////////////////////////////


        app.get('/class',async(req,res)=>{
            const result= await classCollection.find().toArray();
            res.send(result);
        })
       






        // .......................


        app.get('/classes',async(req,res)=>{
            const result= await classesCollection.find().toArray();
            res.send(result);
        })





        // app.get('/classes', async (req, res) => {
        //     const email = req.query.email;
        //     // console.log(email);
      
        //     if (!email) {
        //       res.send([]);
        //     }

      
        //     const query = { instructor_email: email };
        //     const result = await classesCollection.find(query).toArray();
        //     // console.log(result);
        //     res.send(result);
        //   });

        // .......................

        app.post('/classes', async (req, res) => {
            const newItem = req.body;
            const result = await classesCollection.insertOne(newItem)
            res.send(result);
        })


        3///////////////////////


        app.patch('/classes/:id', async (req, res) => {
            const id = req.params.id;
            const { status } = req.body; 
          
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
              $set: {
                status: status,
              },
            };
          
            try {
              const result = await classesCollection.updateOne(filter, updateDoc);
              res.send(result);
            } catch (err) {
              res.status(500).send({ error: true, message: 'Error updating user action' });
            }
          })


        3///////////////////////

4////////////////////////

app.post('/carts',async(req,res)=>{
    const cartItem =req.body;
    console.log(cartItem);
    const result=await cartsCollection.insertOne(cartItem);
    res.send(result); 
})





app.get('/carts', async (req, res) => {
    const email = req.query.email;
    if (!email) {
      res.send([]);
    }
    const query = { email: email };
    const result = await cartsCollection.find(query).toArray();
    res.send(result);
  });


  app.delete('/carts/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await cartsCollection.deleteOne(query);
    res.send(result);
  })


4/////////////////////////



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
    res.send('Class is running')
})


app.listen(port, () => {
    console.log(`Class is running on port ${port}`);
})