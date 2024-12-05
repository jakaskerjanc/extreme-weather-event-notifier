import express from 'express'
import bodyParser from 'body-parser';

const port = 3001
const app = express()

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.status(200).send('Hello World!')
})

app.get('/health/liveness', (_req, res) => {
  res.status(200).send('I am alive!')
})

app.post('/api/register', (req, res) => {
  console.log(req.body)
  res.status(200).json('You sent: ' + JSON.stringify(req.body))
})

app.listen(port, () => {
  console.log(`Server is listening at port ${port}`)
})


// Import the mongoose module
import mongoose from 'mongoose'


// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
mongoose.set("strictQuery", false);

// Define the database URL to connect to.
const mongoDB = "mongodb://mongo:27017/test";

// Wait for database to connect, logging an error if there is a problem
main().catch((err) => console.log(err));
async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoDB);
  console.log("Connected to MongoDB");
}

const Schema = mongoose.Schema;

const SomeModelSchema = new Schema({
  name: String,
  date: Date,
});

const SomeModel = mongoose.model("SomeModel", SomeModelSchema);

app.get('/db/testwrite/:name', async (req, res) => {
  await SomeModel.create({ name: req.params.name, date: new Date() });

  res.status(200).send('Created! (probably)')
})


app.get('/db/testread', async (_req, res) => {
  try {
    const results = await SomeModel.find({});
    res.status(200).send(JSON.stringify(results));
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
})