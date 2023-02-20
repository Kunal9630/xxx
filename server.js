var express=require("express");
var mysql=require("mysql");
var app=express();
var fileuploader=require("express-fileupload");
app.listen(2001,function()
{
    console.log("Started");
})

app.use(express.static("public"));

app.get("/",function(req,resp)
{
    var path=__dirname+"/public/index.html";
    //console.log(path);
    resp.sendFile(path);
})

app.get("/dclient",function(req,resp){
    var absPath = __dirname;
    var path = absPath + "/public/dash-client.html";
    resp.sendFile(path);        
});

app.get("/dcaretaker",function(req,resp){
    var absPath = __dirname;
    var path = absPath + "/public/dash-caretaker.html";
    resp.sendFile(path);        
});

app.get("/dash-admin",function(req,resp){
    var absPath = __dirname;
    var path = absPath + "/public/dash-admin.html";
    resp.sendFile(path);        
});

app.get("/caretaker-finder",function(req,resp){
    var absPath = __dirname;
    var path = absPath + "/public/caretaker-finder.html";
    resp.sendFile(path);        
});

var dbConfigurationObj={
    host:"127.0.0.1",
    user:"root",
    password:"",
    database:"project"
}

var dbRef=mysql.createConnection(dbConfigurationObj);

dbRef.connect(function(err){
        if(err==null)
            console.log("Connected Successfulllllyyyy");
        else
        console.log(err.toString());
});

app.use(express.urlencoded({extended:true}));
app.get("/signup-process-post",function(req,resp)
{
    resp.contentType("text/html");
    var dataAry=[req.query.emailForServer,req.query.pwdForServer,req.query.typeForServer];
    dbRef.query("insert into users values(?,?,?,1)",dataAry,function(err){
    
        if(err==null)
            resp.send("<b></b>Data Sent To Server</b>");
        else
            resp.send(err.toString());
    })
})

app.get("/checkEmailInTable",function(req,resp)
{
    dbRef.query("select * from users where emailid=?",req.query.emailForServer,function(err,table){
        resp.contentType("text/html");
        if(err!=null)
            resp.send(err.toString());
            
        else if(table.length==1)
            resp.send("<b>Already Occupied</b>")
        else 
            resp.send("<b>Available</b>");
    })
})

app.get("/checkUtypeInTable",function(req,resp)
{
    var dataAry=[req.query.emailForServer,req.query.pwdForServer];
    dbRef.query("select utype,status from users where emailid=? and pwd=?",dataAry,function(err,result){

        var json=JSON.parse(JSON.stringify(result));
        if(json[0].status==0)
        {
            resp.send("Your Account is Blocked");
            return;
        }
        
        else if(err==null)
        {
            resp.send(json[0].utype);
        }
        else
            resp.send("Invalid Email Id or Password");
    })
})

app.use(fileuploader());
app.post("/client-profile-post",function(req,resp)
{
    //cwd=current working directory
    var fullpath1,pic1;
    var fullpath2,pic2;

    if(req.files.ppic!=null)
    {
        pic1=req.files.ppic.name;
        fullpath1=process.cwd() + "/public/uploads/" + req.files.ppic.name;
        req.files.ppic.mv(fullpath1, function (err) 
        {
            if (err)
                console.log(err.toString());

            else
                console.log("FileUploaded Successfully with data=" + JSON.stringify(req.body));
        })
    }
    else
    pic1="nopic.png";

    if(req.files.idpic!=null)
    {
        pic2=req.files.idpic.name
        fullpath2 = process.cwd() + "/public/uploads/" + req.files.idpic.name;
        req.files.idpic.mv(fullpath2, function (err) {
            if (err)
                console.log(err.toString());

            else
                console.log("FileUploaded Successfully with data=" + JSON.stringify(req.body));
        })
    }
    else
    pic2="nopic.png";
    resp.contentType("text/html");

    var dataAry=[req.body.txtEmail,req.body.name,req.body.mobile,req.body.address,req.body.city,req.body.state,req.body.zip,pic1,pic2,req.body.pets];

    dbRef.query("insert into clients values(?,?,?,?,?,?,?,?,?,?)",dataAry,function(err){
    
        if(err==null)
            resp.send("<h2><center>Profile Saved");
        else
            resp.send(err.toString());
    })
})

app.get("/fetchFromTableClients",function(req,resp)
{
    var dataAry=[req.query.emailForServer];
    dbRef.query("select * from clients where email=?",dataAry,function(err,table){
    
        if(err!=null)
            resp.send(err.toString());
            
        else    
            resp.send(table);
    })
})


app.post("/client-update-post",function(req,resp)
{
    resp.contentType("text/html");
    var picName1
    var picName2;

    if(req.files==null)
    {
        picName1=req.body.hdn1;
        picName2=req.body.hdn2;
    }

    else if(req.files.ppic==null)
    {
        picName1=req.body.hdn1;
    }

    else{
        var fullpath1=process.cwd()+"/public/uploads/"+req.files.ppic.name;
        
        picName1=req.files.ppic.name;
        
        req.files.ppic.mv(fullpath1,function(err)
        {
            if(err)
            console.log(err.toString());
            
            else
            console.log("FileUploaded Successfully with data="+JSON.stringify(req.body));
        })
    }
    
    if(req.files.idpic==null)
    {
        picName2=req.body.hdn2;
    }
    else
    {    
        var fullpath2=process.cwd()+"/public/uploads/"+req.files.idpic.name;
        picName2=req.files.idpic.name;
        req.files.idpic.mv(fullpath2,function(err)
        {
            if(err)
            console.log(err.toString());
        
            else
            console.log("FileUploaded Successfully with data="+JSON.stringify(req.body));
        })
    }
    var dataAry=[req.body.name,req.body.mobile,req.body.address,req.body.city,req.body.state,req.body.zip,picName1,picName2,req.body.pets,req.body.txtEmail];

    dbRef.query("update clients set name=?,mobile=?,address=?,city=?,state=?,pin=?,ppic=?,idpic=?,pets=? where email=?",dataAry,function(err){
    
        if(err==null)
            resp.send("<h2><center>Updated successfullyyyyyyy");
        else
            resp.send(err.toString());
    })
})



app.post("/caretaker-profile-post",function(req,resp)
{
    var fullpath,pic;

    if(req.files.idpic!=null)
    {
        resp.contentType("text/html");
        pic=req.files.idpic.name
        fullpath = process.cwd() + "/public/uploads/" + req.files.idpic.name;
        req.files.idpic.mv(fullpath, function (err) {
            if (err)
                console.log(err.toString());

            else
                console.log("FileUploaded Successfully with data=" + JSON.stringify(req.body));
        })
    }
    else
    pic="nopic.png";

    var dataAry=[req.body.txtEmail,req.body.name,req.body.mobile,req.body.address,req.body.website,req.body.city,req.body.state,req.body.zip,req.body.selpets,pic];

    dbRef.query("insert into caretaker values(?,?,?,?,?,?,?,?,?,?)",dataAry,function(err){
    
        if(err==null)
            resp.send("<h2><center>Profile Saved");
        else
            resp.send(err.toString());
    })
})

app.get("/fetchFromTableCareTaker",function(req,resp)
{
    var dataAry=[req.query.emailForServer];
    dbRef.query("select * from caretaker where email=?",dataAry,function(err,table){
    
        if(err!=null)
            resp.send(err.toString());
            
        else    
            resp.send(table);
    })
})


app.post("/caretaker-update-post",function(req,resp)
{
    resp.contentType("text/html");
    var picName
    
    if(req.files.idpic==null)
    {
        picName=req.body.hdn;
    }
    else
    {    
        var fullpath=process.cwd()+"/public/uploads/"+req.files.idpic.name;
        picName=req.files.idpic.name;
        req.files.idpic.mv(fullpath,function(err)
        {
            if(err)
            console.log(err.toString());
        
            else
            console.log("FileUploaded Successfully with data="+JSON.stringify(req.body));
        })
    }
    var dataAry=[req.body.name,req.body.mobile,req.body.address,req.body.website,req.body.city,req.body.state,req.body.zip,req.body.selpets,picName,req.body.txtEmail];

    dbRef.query("update caretaker set name=?, mobile=?, address=?, website=?, city=?, state=?, pin=?, selpets=?, ppic=? where email=?",dataAry,function(err){
    
        if(err==null)
            resp.send("<h2><center>Updated successfullyyyyyyy");
        else
            resp.send(err.toString());
    })
})

app.get("/fetch-all-users",function(req,resp)
{
    dbRef.query("select * from users",function(err,table){
    
        if(err!=null)
            resp.send(err.toString());
            
        else    
            resp.send(table);
    })
})

app.get("/block-user-angular",function(req,resp)
{
    resp.contentType("text/html");
    var dataAry=[req.query.xEmail];
    dbRef.query("update users set status=0 where emailid=?",dataAry,function(err,result){
    
        if(err!=null)
            resp.send(err.toString());
            
        else if(result.affectedRows==1)
            resp.send("<h2><center>Blocked successfullyyyyyyy");
        else    
            resp.send("Invalid ID");
    })
})

app.get("/resume-user-angular",function(req,resp)
{
    resp.contentType("text/html");
    var dataAry=[req.query.xEmail];
    dbRef.query("update users set status=1 where emailid=?",dataAry,function(err,result){
    
        if(err!=null)
            resp.send(err.toString());
            
        else if(result.affectedRows==1)
            resp.send("<h2><center>Resumed successfullyyyyyyy");
        else    
            resp.send("Invalid ID");
    })
})

app.get("/fetch-all-clients",function(req,resp)
{
    dbRef.query("select * from clients",function(err,table){
    
        if(err!=null)
            resp.send(err.toString());
            
        else    
            resp.send(table);
    })
})

app.get("/delete-clients-angular",function(req,resp)
{
    var dataAry=[req.query.xEmail];
    dbRef.query("delete from clients where email=?",dataAry,function(err,result){
    
        if(err!=null)
            resp.send(err.toString());
            
        else if(result.affectedRows==1)
            resp.send("<h2><center>Deleted successfullyyyyyyy");
        else    
            resp.send("Invalid ID");
    })
})

app.get("/fetch-all-caretakers",function(req,resp)
{
    dbRef.query("select * from caretaker",function(err,table){
    
        if(err!=null)
            resp.send(err.toString());
            
        else    
            resp.send(table);
    })
})

app.get("/delete-caretakers-angular",function(req,resp)
{
    var dataAry=[req.query.xEmail];
    dbRef.query("delete from caretaker where email=?",dataAry,function(err,result){
    
        if(err!=null)
            resp.send(err.toString());
            
        else if(result.affectedRows==1)
            resp.send("<h2><center>Deleted successfullyyyyyyy");
        else    
            resp.send("Invalid ID");
    })
})

app.get("/fetch-all-cities",function(req,resp)
{
    dbRef.query("select distinct city from caretaker",function(err,table){
    
        if(err!=null)
            resp.send(err.toString());   
        else
            resp.send(table);
    })
})

app.get("/fetch-caretakers-angular",function(req,resp)
{
    var dataAry=[req.query.cityforserver,"%"+req.query.petforserver+"%"];
    console.log(req.query.cityforserver);

    dbRef.query("select * from caretaker where city=? and selpets like ?",dataAry,function(err,table)
    {
          if(err!=null)
              resp.send(err.toString());
          else
              resp.send(table);
   })
})