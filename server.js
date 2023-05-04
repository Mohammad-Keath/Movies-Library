require ("dotenv").config();
const express = require("express");
const recipesData = require('./movieData/data.json');
const app = express();
const port = 3001;
const cors = require('cors');
const axios = require("axios");
const pg = require("pg")
const client = new pg.Client(process.env.DATABASE_URL)
app.use(cors());
app.use(express.json());
const api_key = process.env.API_KEY;
let result = {'title' : recipesData.title,
'poster_path' : recipesData.poster_path , 
'overview' : recipesData.overview};

function listItem(id,title,release_date,poster_path,overview){
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path=poster_path;
    this.overview=overview
}

app.get("/", (req, res) => {
    res.json(result);
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
app.post("/movies",handleaddmovie)
function handleaddmovie (req,res){
    const list =req.body;
    const sql = `INSERT into movies(title,release_date,poster_path,overview)values($1,$2,$3,$4)RETURNING*;`;
    const values = [list.title,list.release_date,list.poster_path,list.overview];
    client.query(sql,values).then((data) =>{
        res.send(data.rows)
    })
}
    
app.get("*", (req, res) => {
        res.status(500).send('Sorry, something went wrong');
    });
app.post('*', (req, res) => {
        res.status(404).send('page not found error');
    });

client.connect().then(()=>{
    
    app.listen(port, () => {
            console.log(`server is listing on port ${port}`);
        });
})
