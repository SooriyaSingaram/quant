const express = require('express')
const nodemailer=require("nodemailer");
const cors = require('cors');
const multipart = require('connect-multiparty');
const fs = require('fs');
var ObjectID = require('mongodb').ObjectID;
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient


 var url = 'mongodb://127.0.0.1:27017/' 
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  url = process.env.OPENSHIFT_MONGODB_DB_URL;
}

var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var db
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'sumathi.csingaram@gmail.com',
      pass: 'ss7373452634'
  }
});

 


var enableCORS = function (request, response, next) {
    response.header('Access-Control-Allow-Origin', request.headers.origin);
    response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Date, X-Date');
    return next();
};

app.use(cors());
app.use(enableCORS);

// Remember to change YOUR_USERNAME and YOUR_PASSWORD to your username and password! 
MongoClient.connect(url,{ useNewUrlParser: true }, (err, database) => {
  if (err) return console.log(err)
  db = database.db('quantzi')
  app.listen(server_port,server_ip_address, () => {
    console.log( "Listening on " + server_ip_address + ", port " + server_port )
  })
 
})

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(multipart());
app.use(express.static(__dirname));
app.get('/', (req, res) => {
      res.send("Api is running successfully..")
  })
app.get('/business_service', (req, res) => {
  db.collection('business_service').find().toArray((err, result) => {
    if (err) {
        res.send({message:"Please try again after some time."})
    }
   else{
    res.json(result)
   }
  })
})
// //// Technology/////
app.get('/technology', (req, res) => {
  db.collection('technology').find().toArray((err, result) => {
    if (err) {
        res.send({message:"Please try again after some time."})
    }
   else{
    res.json(result)
   }
  })
})
app.get('/technology/:id', (req, res) => {
  const _id = new ObjectID(req.params.id);
  db.collection('technology').find({_id:_id}).toArray((err, result) => {
    if (err) {
        res.send({message:"Please try again after some time."})
    }
   else{
    res.json(result)
   }
  })
})
app.delete('/technology/:id', (req, res) => {
  const _id = new ObjectID(req.params.id);
   db.collection('technology').deleteOne({_id:_id},function(err, result) {
    if (err) {
        res.send({message:"Please try again after some time."})
    }
   else{
    
    res.json({message:"This data successfully deleted"})
   }
  })
})

app.post('/technology', (req, res) => {
   
  db.collection('technology').insertOne(req.body, (err, result) => {
    if (err){
        res.status(503).send({message:"Please try again after some time."})
    }
  
 else{
  res.json({message:"Requested service added successfully."})
 }
  })
})

app.put('/technology/:id', (req, res) => {
  const _id = new ObjectID(req.params.id);
 
 db.collection('technology').updateOne({_id:_id},{ $set:req.body}, (err, result) => {
   if (err){
    
       res.status(503).send({message:"Please try again after some time."})
   }
else{
  res.json({message:"Requested service added successfully."})
}
 })
})
app.post('/addBussinessService', (req, res) => {
   
  db.collection('business_service').insertOne(req.body, (err, result) => {

    if (err){
        res.status(503).send({message:"Please try again after some time."})
    }
  
 else{
   var userData=req.body;
  var mailOptions = {
    from: 'sumathi.csingaram@gmail.com',
    to: userData.emailId,
    subject: 'Thanks for your approach',
    html: '<p>Hi ' + userData.name + ',<br><br>Thank you for contacting our organization.We will create scalable, secure web application.Thanks.We we will keep you posted on the update.  <br><br>Regards,<br>Team</p>',
  };
  transporter.sendMail(mailOptions, function (error, info) {
    
                if (error) {
                    
                    res.status(400).json({ status: "failed", message: "Please try again after some time." })
                } else {
    
                  res.json({message:"Requested service added successfully."})
                }
    
            });
   
 }
  })
})



app.delete('/business_service', (req, res) => {
  db.collection('business_service').findOneAndDelete({_id: req.body._id}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('A darth vadar quote got deleted')
  })
})


app.post('/login', function (req, res) {
  if (!req.body.username || !req.body.password) {
    res.status(401).json({message:"Please enter valid credentials"});    
  } else if(req.body.username === "admin@admin.com" && req.body.password === "123") {
    // req.session.username = "admin@admin.com";
    // req.session.admin = true;
    res.json({message:"Successfully logged in"}); 
  }else{
    res.status(401).json({message:"Please enter valid credentials"}); 
  }
}); 

// Logout endpoint
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.send("logout success!");
});
 





app.post('/uploadImage',(req,res)=>{
 
  try {
    if (!req.files.file) {
        res.status(400).send("Please send valid file object");
    } else {
    
        var fileDetail = req.files.file;
        var oldpath = fileDetail.path;
        var todayDate = Date.now();

        var newpath = './uploads/' + todayDate + '.jpg';

        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.status(400).send("Please send valid file object");
            }
            else {
                res.send({message:"image uploaded successfully." ,imageUrl: todayDate + '.jpg' });
            }
        });
    }

} catch (error) {
    console.log(error)
    res.status(400).send("Please send valid file object");
}
})


//////////////employee

app.get('/employee', (req, res) => {
   db.collection('employee').find().toArray((err, result) => { 
    var err;
    if (err) {
        res.send({message:"Please try again after some time."})
    }
   else{
 res.json(result)
   }
   })
})
app.get('/employee/:id', (req, res) => {
 
  const _id = new ObjectID(req.params.id);
  db.collection('employee').find({_id:_id}).toArray((err, result) => {
    if (err) {
        res.send({message:"Please try again after some time."})
    }
   else{
    res.json(result)
   }
  })
})
app.delete('/employee/:id', (req, res) => {
  const _id = new ObjectID(req.params.id);
   db.collection('employee').deleteOne({_id:_id},function(err, result) {
    if (err) {
        res.send({message:"Please try again after some time."})
    }
   else{
    
    res.json({message:"This data successfully deleted"})
   }
  })
})

app.post('/employee', (req, res) => {
   
  db.collection('employee').insertOne(req.body, (err, result) => {
    if (err){
        res.status(503).send({message:"Please try again after some time."})
    }
  
 else{
  res.json({message:"Requested service added successfully."})
 }
  })
})

app.put('/employee/:id', (req, res) => {
  const _id = new ObjectID(req.params.id);
  db.collection('employee').updateOne({_id:_id},{ $set:req.body}, (err, result) => {
   if (err){
       res.status(503).send({message:"Please try again after some time."})
   }
 
else{
  res.json({message:"Requested service added successfully."})
}
 })
})

//////////////employee

app.get('/project', (req, res) => {
  db.collection('project').find().toArray((err, result) => { 
   var err;
   if (err) {
       res.send({message:"Please try again after some time."})
   }
  else{
res.json(result)
  }
  })
})
app.get('/project/:id', (req, res) => {

 const _id = new ObjectID(req.params.id);
 db.collection('project').find({_id:_id}).toArray((err, result) => {
   if (err) {
       res.send({message:"Please try again after some time."})
   }
  else{
   res.json(result)
  }
 })
})
app.delete('/project/:id', (req, res) => {
 const _id = new ObjectID(req.params.id);
  db.collection('project').deleteOne({_id:_id},function(err, result) {
   if (err) {
       res.send({message:"Please try again after some time."})
   }
  else{
   
   res.json({message:"This data successfully deleted"})
  }
 })
})

app.post('/project', (req, res) => {
  
 db.collection('project').insertOne(req.body, (err, result) => {
   if (err){
       res.status(503).send({message:"Please try again after some time."})
   }
 
else{
  res.json({message:"Requested service added successfully."})
}
 })
})

app.put('/project/:id', (req, res) => {
  const _id = new ObjectID(req.params.id);
  db.collection('project').updateOne({_id:_id},{ $set:req.body}, (err, result) => {
   if (err){
       res.status(503).send({message:"Please try again after some time."})
   }
 
else{
    res.json({message:"Requested service added successfully."})
}
 })
})