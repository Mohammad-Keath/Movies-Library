const express = require("express");
const recipesData = require('./movieData/data.json');
const app = express();
const port = 3001;
const cors = require('cors');
app.use(cors());
let result = {'title' : recipesData.title,
'poster_path' : recipesData.poster_path , 
'overview' : recipesData.overview};

app.get("/", (req, res) => {
    res.json(result);
   })

app.get('/favorite', (req, res) => {
    res.send('Welcome to Favorite Page');
});
app.get("*", (req, res) => {
        res.status(500).send('Sorry, something went wrong');
    });
app.post('*', (req, res) => {
        res.status(404).send('page not found error');
    });



app.listen(port, () => {
        console.log(`server is listing on port ${port}`);
    });
