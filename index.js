const express = require("express");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
 require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app =express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors(
  {
    origin: ["http://localhost:5173"],
    credentials:true
  }
));
app.use(express.json());
app.use(cookieParser());

// JWT middleware

const verify = async(req,res,next) => {
  const token = req.cookies?.token;
  if(!token){
   return res.status(401).send({status: "unauthorize",code: "401"});
  } 
  jwt.verify(token,process.env.SECRET,(err,decoded) => {
    if(err){
      return res.status(401).send({status: "unauthorize",code: "401"});
    }
      console.log("value in the token",decoded)
      req.user = decoded;
      next();
  })
  
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a3cooza.mongodb.net/?retryWrites=true&w=majority`;

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
    // Create Assignment DB

    const AssCollection = client.db("GroupStudyDB").collection('Assignment');

    // Submitted Assignment DB

    const subCollection = client.db("GroupStudyDB").collection('submitAssignment');


    // JWT

app.post("/jwt",async(req,res) => {
  const body = req.body;
  const token = jwt.sign(body, process.env.SECRET,{expiresIn : '10h'});
   
  res.cookie('token',token,{
    httpOnly: true,
    secure: false,
    sameSite: 'none'
  }).send({msg: 'success'})
   

})

    //  My Assignment DB

    const MyCollection = client.db("GroupStudyDB").collection('MyAssignment');

    // Create Assignment DB
    app.post('/assignment',async(req,res) => {
        const newAssignment = req.body;
        console.log(newAssignment);
        const result = await AssCollection.insertOne(newAssignment);
        res.send(result);
    })

    app.get('/assignment',async(req,res) => {
      const cursor = AssCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete('/assignment/:id', async(req,res) => {
         const id = req.params.id;
         const quary = {_id: new ObjectId(id)};
         const result = await AssCollection.deleteOne(quary);
         res.send(result);
         
    })
    app.get('/assignment/:id',async(req,res) => {
      const id = req.params.id;
         const quary = {_id: new ObjectId(id)};
         const result = await AssCollection.findOne(quary);
      res.send(result);
    })

    app.put('/assignment/:id',async(req,res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      const updated = req.body;
        const updatedAssignment = {
          $set: {
            title: updated.title,
            image: updated.image,
            description: updated.description,
            marks: updated.marks,
            difficulty: updated.difficulty,
            date: updated.date
          }
        } 
        const result = await AssCollection.updateOne(filter,updatedAssignment);
        res.send(result);
       
     })

   // Submitted Assignment DB

   app.post('/submit',async(req,res) => {
    const newSubmit = req.body;
    console.log(newSubmit);
    const result = await subCollection.insertOne(newSubmit);
    res.send(result);
})

app.get('/submit',async(req,res) => {
  const cursor = subCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})

app.get('/submit/:id', async(req,res) => {
  const id = req.params.id;
     const quary = {_id: new ObjectId(id)};
     const result = await subCollection.findOne(quary);
  res.send(result);
})

app.put('/submit/:id',async(req,res) => {
  const id = req.params.id;
  const filter = {_id : new ObjectId(id)};
  const updated = req.body;
    const markUpdate = {
      $set: {
        marks: updated.marks,
        status: updated.status,
        feedback: updated.feedback,
        pdf: updated.pdf,
        text: updated.text
      }
    } 
    const result = await subCollection.updateOne(filter,markUpdate);
    res.send(result);
   
 })

  //  My Assignment DB

  app.post('/my',async(req,res) => {
    const newSubmit = req.body;
    console.log(newSubmit);
    const result = await MyCollection.insertOne(newSubmit);
    res.send(result);
})

app.get('/my',async(req,res) => {
  const cursor = MyCollection.find();
  const result = await cursor.toArray();
  res.send(result);
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




app.get ('/',(req,res) => {
    res.send('server is running')
});

app.listen(port ,() =>{
    console.log(`server is running on port:${port}`)
});