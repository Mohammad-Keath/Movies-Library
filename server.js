require ("dotenv").config();
const express = require("express");
const recipesData = require('./movieData/data.json');
const app = express();
const port = process.env.PORT;
const cors = require('cors');
const axios = require("axios");
const pg = require("pg")
const client = new pg.Client(process.env.DATABASE_URL)
app.use(cors());
app.use(express.json());
const api_key = process.env.API_KEY;


function listItem(id,title,release_date,poster_path,overview){
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path=poster_path;
    this.overview=overview
}

app.get("/", (req, res) => {
    res.json("welcome to home page");
   })

app.get('/favorite', (req, res) => {
    res.send('Welcome to Favorite Page');
});
app.get("/trending", handleTrending) 
async function handleTrending(req,res)  {
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${api_key}&language=en-US`
        let listFromApi=await axios.get(url);
        console.log(listFromApi)
        let list = listFromApi.data.results.map((item) => {
            return new listItem (item.id,item.title,item.release_date,item.poster_path,item.overview)
        })
        res.send(list);
    };

app.get("/search", handleSearch) 
async function handleSearch(req,res)  {
    const search = req.query.title
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&language=en-US&query=${search}`
    let searchByTitle=await axios.get(url);
    let list = searchByTitle.data.results.map((item) => {
        return new listItem (item.id,item.title,item.release_date,item.poster_path,item.overview)
    })
        res.send(list);
    };

app.get("/forchildren", handleForChildren) 
async function handleForChildren(req,res)  {
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${api_key}&language=en-US`
    const forChildren = await axios.get(url);
    let list = forChildren.data.results.map((item) => { if (item.adult == false){
        return new listItem (item.id,item.title,item.release_date,item.poster_path,item.overview)}
    })
        res.send(list);
    };
app.get("/top_rated", handleTopRated) 
    async function handleTopRated(req,res)  {
        const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=799682632f70878276e93308454e2b1b&language=en-US&page=1`
        let topRated=await axios.get(url);
        let list = topRated.data.results.map((item) => { if (item.adult == false){
            return new listItem (item.id,item.title,item.release_date,item.poster_path,item.overview)}
        })
            res.send(list);
        };

// app.get("/details", handleDetails) 
//     async function handleDetails(req,res)  {
//         const list_id = req.query.id
//         const url = `https://api.themoviedb.org/3/list/${list_id}?api_key=${api_key}&language=en-US`
//         let details=await axios.get(url);
//          let list = searchByAge.data.results.map((item) => {
//              return new listItem (item.id,item.title,item.release_date,item.poster_path,item.overview)
//          })
//             res.send(details);
//         };

///////////////////////////show////////////////////////////

app.get("/movies",handlegetmovie)
function handlegetmovie(req,res){
    const sql =`select * from movies;`;
    client.query(sql)
    .then((data) => {
        let dataFromDB = data.rows.map((item)=>{
            let singleMovie = new listItem(
                item.id,
                item.title,
                item.release_date,
                item.poster_path,
                item.overview
            )
            return singleMovie
        });
        res.send(dataFromDB);
    })
}
app.post("/createtable",handlecreate)
function handlecreate (req,res){
    const sql = `DROP TABLE IF EXISTS;
    CREATE TABLE movies(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        release_date VARCHAR(255),
        poster_path VARCHAR(255),
        overview VARCHAR(255)
    );`;
    
    client.query(sql).then((data) =>{
        res.send('table added')
    })
}

///////////////////////////add////////////////////////////

app.post("/movies",handleaddmovie)
function handleaddmovie (req,res){
    const list =req.body;
    const sql = `INSERT into movies(title,release_date,poster_path,overview)values($1,$2,$3,$4)RETURNING*;`;
    const values = [list.title,list.release_date,list.poster_path,list.overview];
    client.query(sql,values).then((data) =>{
        res.send(data.rows)
    })
}

///////////////////////////update////////////////////////////

app.put("/update/:id",handleupdatemovie)
function handleupdatemovie (req,res){
    const thisid = req.params.id;
    const sql = `update movies set title=$1,release_date=$2,poster_path=$3,overview=$4 where id=${thisid} returning *;`
    const values = [req.body.title, req.body.release_date, req.body.poster_path, req.body.overview];
    client.query(sql, values)
      .then((data) => {
        res.status(200).send(data.rows);
      })
}
///////////////////////////delete////////////////////////////
app.delete("/delete/:id",handledeletemovie)
function handledeletemovie (req,res){
    const thisid = req.params.id;
    const sql = `delete from movies where id = ${thisid};`
    client.query(sql)
      .then(() => {
        res.status(202).send(`deleted`);
      })
}

////////////////////////////////get by id/////////////////////////

app.get("/getmovie/:id",handlegetbyid)
function handlegetbyid(req,res){
    const thisid =req.params.id;
    const sql = `select * from movies
    where movies.id =${thisid};`
   client.query(sql)
  .then((data)=>{
        res.send(data.rows)
    })
}


  
///////////////////////////error handeling////////////////////////////
app.get("*", (req, res) => {
        res.status(500).send('Sorry, something went wrong');
    });
app.post('*', (req, res) => {
        res.status(404).send('page not found error');
    });

////////////////////////////////////////////////////////////////////////
client.connect().then(()=>{
    
    app.listen(port, () => {
            console.log(`server is listing on port ${port}`);
        });
})
