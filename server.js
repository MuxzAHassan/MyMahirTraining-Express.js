const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;


app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//METHOD OVERRIDE
const methodOverride = require('method-override');
app.use(methodOverride('_method'));


//CORS
const cors = require('cors');
const corsOptions = {
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type','Authorization'],
};
app.use(cors(corsOptions));



app.use(express.static('public'));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.send("Hello Express!");
});

app.get("/about", (req, res) => {
    res.send("About Us Page");
});

app.get("/search", (req, res) => {
    const {q, page} = req.query;
    res.send(`Search keyword: ${q || 'Tak tau'}. Page Number: ${page||100}`);
});

const blogRoutes = require('./routes/blogRoutes');
app.use("/posts", blogRoutes);

const posting =[
    {id:1, title:"Hello Express"},
    {id:2, title:"Learning Express is fun"},
]

app.get('/posting',(req,res)=>{
    res.render('index',{title: 'My Posting', posting});
});

app.get('/posting/:id', (req,res)=>{
    const post = posting.find(p => p.id == Number(req.params.id));
if(!post) return res.status(404).send('Post not found');
res.render('post', {post});
});

const contactRoute = require('./routes/contact/contact_route');
app.use('/contacts', contactRoute);

//Student Routes
const studentRoutes = require('./routes/students/student_route');
app.use('/students', studentRoutes);

//API Routes
const apiRoutes = require('./routes/api/studentapi_routes');
app.use('/api/students', apiRoutes);

//AUTH Routes
const authRoutes = require('./routes/api/authapi_routes');
app.use('/api/auth', authRoutes);


app.listen(PORT, () => {console.log(`Server is running on http://localhost:${PORT}`); });