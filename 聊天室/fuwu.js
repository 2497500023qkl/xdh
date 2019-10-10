const net = require('net');
const server = net.createServer();
const clients = {};//保存客户端的连接
var client = null;//当前客户连接
var uid = 0;
server.on('connection',(socket)=>{
    //启动心跳机制就是时不时向客户端发消息客户端等待客户端的固定会话
    //如果没回就是客户自己没按照规矩自己退了
    var isOnline = !0;
    //这边是定时器
    var keepAliveTimer = socket.timer = setInterval(()=>{
        if(!isOnline){
            client = socket;
            quit(socket.nick);
            return;
        }
        if(socket.writable){
            isOnline = !1;
            socket.write('::');
        }else{
            client = socket;
            quit(socket.nick);
        }
    },3000);//后面的3000是时间每过多久检测一次
    //这边这些都是与客户端交互的了
    socket.on('end',()=>{
        console.log(client.nick+'退出了房间\n\r');
        socket.destroy();
    });
    socket.on('error',(error)=>{
        console.log(error.message);
    });
    socket.on('data',(chunk)=>{
        client = socket;
        //与服务端交互数据
        var msg = JSON.parse(chunk.toString());
        if(msg.cmd=='keep'){
            isOnline = !0;
            return;
        }
        dealMsg(msg);
    });
});
server.on('error',(err)=>{
    console.log(err);
});
server.listen(3000);//启动监听
/**
 * 处理用户信息
 */
function dealMsg(msg){
    const cmd = msg.cmd;
    const funs = {
        'login':login,
        'chat':chat,
        'quit':quit,
        'exit':quit
    };
    if(typeof funs[cmd] !== 'function') return !1;
    funs[cmd](msg);
}
/**
 * 释放连接资源
 */
function freeConn(conn){
    conn.end();
    delete clients[conn.uuid];
    conn.timer&&clearInterval(conn.timer);
}
/**
 * 用户首次进入聊天室
 */
function login(msg){
    var uuid = '';
    uuid = getRndStr(15)+(++uid);//产生用户ID
    client.write(`欢迎你，${msg.nick}：这里总共有${Object.keys(clients).length}个小伙伴在聊天.\r\n`)
    client.nick = msg.nick;
    client.uuid = uuid;
    clients[uuid] = client;
    broadcast(`系统：${msg.nick}进入了聊天室.`);

}
/**
 * 广播消息不给发过来的人回话发过来的在客户端回
 * 并且判断是不是可以接收的可写的
 */
function broadcast(msg){
    Object.keys(clients).forEach((uuid)=>{
        if((clients[uuid]!=client)& clients[uuid].writable){
            clients[uuid].write(msg);
        }
    });
}
/**
 * 退出聊天室
 */
function quit(nick){
    var message = `小伙伴${nick}退出了聊天室.`;
    broadcast(message);
    freeConn(client);
}
/**
 * 用这个来判断回话并且回话
 */
function chat(msg){
    var weng=msg.msg+"";
    var feng=weng.split("@");
    if(feng.length<2){
        if(msg.msg.toLowerCase()=='quit'||msg.msg.toLowerCase()=='exit'){
            quit(msg.nick);
            return ;
        }
        message = `${msg.nick}说：${msg.msg}`;
        broadcast(message);
    }else{
         for(var i=0;i<Object.keys(clients).length;i++){
             var xiaoxi=Object.keys(clients)[i];
             if(feng[0]==clients[xiaoxi].nick){
                var message = `${msg.nick}对你悄悄说：${feng[1]}`;
                clients[xiaoxi].write(message);
             }
         }
    }
}   
/**
 * 随机指定长度(len)的字符串不知道这个有什么好处为看网上的放了个随机的
 */
function getRndStr(len=1){
    var rndStr = '';
    for (; rndStr.length < len; rndStr += Math.random().toString(36).substr(2));
    return rndStr.substr(0, len);
}