import mongoose from 'mongoose'
import { fileURLToPath } from "url";
import path from "path";
import { TaskData } from './models/ToDoData.js'
import session from 'express-session';
import MongoStore from 'connect-mongo';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';







const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let a = await mongoose.connect("mongodb://localhost:27017/ToDoData")





import express from 'express'
const app = express()
const port = 3000

app.use(express.static('public'));


app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret : "supersecetkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl:"mongodb://localhost:27017/ToDoData"}),
    cookie: {maxAge: 1000*60*60}    
}))

app.get("/signup",(req,res)=>{
    res.render("signup")
})

app.post("/signup",async(req,res)=>{

const {username, email, password } = req.body;

const hashedPassword = await bcrypt.hash(password,10);

try{
    const user = new User({username:username, email:email, password:hashedPassword});
    await user.save();
    res.redirect("/login");
}catch(err){
    console.log(err);
    res.status(500).send("Error registering user.")
}

});

app.get("/login",(req,res)=>{
    res.render("login");
})

app.post("/login",async(req,res)=>{

const {email, password} = req.body;
const user = await User.findOne({email:email});

if(!user){
   return res.status(400).send("User not found.");
}

const isMatch = await bcrypt.compare(password, user.password)
if(!isMatch){
    return res.status(400).send("Invalid Credentials.");
}

req.session.userId = user._id;
res.redirect ("/home")

})

function requireLogin(req,res,next){

    if(!req.session.userId){
        return res.redirect("/login")
    }

    next();
}


app.get('/home',requireLogin, async(req, res) => {

    try{
  const allData = await TaskData.find({status:"active"});
  res.render('home', {allData:allData});

  
    }catch(err){
        console.log(err)
        res.status(500).send("Error loading home")
    }

  
})

app.get('/completed/:id', async(req,res)=>{

    try{
        const taskId = req.params.id;
        await TaskData.findByIdAndUpdate(taskId, {status:"completed"})
        res.redirect('/home')

    }catch(err){
        console.log(err)
        res.status(500).send("Error updating task")
    }
    
})

app.get('/addtask', (req, res)=>{
    res.sendFile(path.join(__dirname, 'templates', 'addTask.html'));
})

app.post('/addToDoData',async(req, res)=>{
    const {task, date, time}= req.body;
    const dueDate = new Date(`${date}T${time}`)

try{

    const tododata = new  TaskData({
        task, dueDate

    });

await tododata.save();
res.redirect('/home');

}catch(err){
    console.log(err)


}



})

app.get('/completedTasks',async(req,res)=>{
    try{
        const completedData = await TaskData.find({status:"completed"});
        res.render('completedTasks',{completedData:completedData});
    }catch(err){
        console.log(err);
        res.status(500).send("Error loading completed tasks.");
    }
})






app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})









