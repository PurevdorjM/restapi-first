const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const connectDB = require('./config/db');
const fileupload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean');
const rateLimit = require("express-rate-limit");
const hpp = require('hpp');
// Route оруулж ирэх
const categoriesRouter = require("./routes/catergories");
const booksRouter = require("./routes/books");
const usersRouter = require('./routes/users');
const commentsRouter = require('./routes/comments');
// middleware оруулж ирэх
const logger = require('./middlleware/logger');
const colors = require('colors');
const erroreHandler = require('./middlleware/error');
const injectDb = require('./middlleware/injectDb');


// Аппын тохиргоог ачаалллах хэсэг process.env рүү ачааллаж байна...
dotenv.config({path:'./config/config.env'});

const db = require('./config/db-mysql');

const app = express();

connectDB();

// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
  })


var whitelist = ["http://localhost:8000", "http://localhost:3000"]
var corsOptions = {
  origin: function (origin, callback) {
    if (origin === undefined || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Зөвшөөрөгдөөгүй host байна....'))
    }
  },
  allowedHeaders: 'Authorization, Set-Cookie, Content-Type',
  methods: 'GET, POST, PUT, DELETE',
  credentials: true,
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 100 requests per windowMs
  message: '15 минутанд 3 удаа л хандаж болно 🐰',
});
  

app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(limiter);
app.use(hpp());
app.use(cookieParser());
app.use(logger);
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(fileupload());
app.use(injectDb(db));
app.use(morgan('combined', { stream: accessLogStream }));
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/comments', commentsRouter);
app.use(erroreHandler);


db.user.belongsToMany(db.book, {
  through: db.comment,
});
db.book.belongsToMany(db.user, {
  through: db.comment,
});

db.user.hasMany(db.comment);
db.comment.belongsTo(db.user);

db.book.hasMany(db.comment);
db.comment.belongsTo(db.book);



db.sequelize.sync().then(result => {
  console.log('sync hiigdlee... 🚀'.yellow.inverse);
}).catch(err => console.log(err.message))


const server = app.listen(process.env.PORT, console.log(`Hello express server working>>> port 🦑 ${process.env.PORT} 🚀`.rainbow));

process.on('unhandledRejection', (err, promise) => {
  console.log(`Алдаа гарлаа: ${err.message}`.underline.red.bold);
  server.close(()=>{
    process.exit(1);
  })
})