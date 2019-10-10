const net = require('net');
const fs=require('fs');
const server = net.createServer(function(socket){
    socket.setEncoding();
    var sj = '';
    var asd="";
    var panduan=null;
    socket.on('data',(data)=>{
        var zf=(""+data).split("\r\n")[0].split(" ");
        if(zf[1]=="/"){
            socket.write("http/1.1 200 ok/\n");
            socket.write("Content-Type:text/html\n\n");
            socket.write('<meta charset="UTF-8">');
            socket.write('<h1>welcome</h1><a href="admin">进入管理后台</a>');
            socket.end("");
        }else if(zf[1]=="/admin"){
            if(zf[0]=="GET"){
                var ttt=/.*Cookie.*/
                var rrr=data+""
                console.log("条状了");
                if(ttt.test(rrr)){
                    var qwe=(""+data).split("Cookie:")[1].split("=")[1].split("\r\n")[0];
                    console.log(qwe);
                    console.log("meiji");
                    var buf = new Buffer.alloc(1024);
                        fs.readdir("./",function(err, files){
                            files.forEach( function (file){
                                console.log(file.split(".")[0]);
                                var yu=1;
                                    if(file.split(".")[0]==qwe){
                                        console.log(file);
                                        fs.open(file, 'r+', function(err, fd) {
                                            console.log("12");
                                            fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
                                                if(bytes > 0){
                                                    asd=buf.slice(0, bytes).toString();
                                                }
                                                console.log(asd);
                                                if(asd=="username=admin&password=123456"){
                                                    socket.write("http/1.1 200 ok/\n");
                                                    socket.write("Content-Type:text/html\n\n");
                                                    socket.write('<meta charset="UTF-8">');
                                                    socket.write("<h1>登入成功</h1>");
                                                    socket.end("");
                                                }else{
                                                    socket.write("http/1.1 302 ok/\n");
                                                socket.write("Location: login\n");
                                                    socket.write("Content-Type:text/html\n\n");
                                                 socket.end("");
                                                    }
                                            });
                                        });
                                    }else{
                                        if(yu==files.length){
                                            socket.write("http/1.1 302 ok/\n");
                                            socket.write("Location: login\n");
                                                socket.write("Content-Type:text/html\n\n");
                                             socket.end("");
                                        }else{
                                            yu++;
                                        }
                                    }
                            });
                         });
                }else{
                    socket.write("http/1.1 302 ok/\n");
                socket.write("Location: login\n");
                socket.write("Content-Type:text/html\n\n");
                socket.end("");
                }
            }
             
        }else if(zf[1]=="/login"){
            
            if(zf[0]=="POST"){
                var zf2=(""+data).split("\r\n\r\n")[1];
                if(zf2=="username=admin&password=123456"){
                    for (; sj.length < 10; sj += Math.random().toString(36).substr(2));
                    console.log(zf2);
                    console.log(data);
                    fs.open(sj+'.txt', 'w+', function(err, fd) {
                   console.log("文件打开成功！");     
                   fs.writeFile(sj+'.txt',zf2,  function(err) {
                    console.log("数据写入成功！");
                    console.log("yunxin");
                    socket.write("http/1.1 302 ok/\n");
                    socket.write(`Set-Cookie:cooke=${sj}\n`);   
                    socket.write("Location: admin\n");
                    socket.end("");
                    });
                    });
                }else{
                    socket.write("http/1.1 200 ok/\n");
                    socket.write("Content-Type:text/html\n\n");
                    socket.write('<meta charset="UTF-8">');
                    socket.write('<form action="login" method="POST"> <div>username<input type="text" name="username"></div><div>password<input type="text" name="password"></div> <button type="submit">提交</button> </form>');
                    socket.end("");
                }
                }else if(zf[0]=="GET"){
                    socket.write("http/1.1 200 ok/\n");
                    socket.write("Content-Type:text/html\n\n");
                    socket.write('<meta charset="UTF-8">');
                    socket.write('<form action="login" method="POST"> <div>username<input type="text" name="username"></div><div>password<input type="text" name="password"></div> <button type="submit">提交</button> </form>');
                    socket.end("");
            }
        }
    })
});
server.listen(3001);
