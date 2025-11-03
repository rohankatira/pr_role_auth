const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const dotenv = require('./configs/config.env');
const db = require('./configs/db');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const addFlash = require('./middlewares/flash');
const path = require('path');
const session = require('express-session');
const app = express();

const port = dotenv.PORT || 3000;

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cookieParser());

app.use(morgan('dev'));

app.use(session({
    secret: dotenv.SECRET_KEY, 
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24} 
}));

app.use(flash());
app.use(addFlash);

app.use('/', require('./routers'));

app.listen(port, (err) => {
    if(!err){
        db();
        console.log("http://localhost:"+port);   
    }
})