const net = require('net');
const cout = process.stdout;
const cin = process.stdin;

var client = null;
var nick = '';

cout.write(`请输入昵称：`);
//监听命令行输入
cin.on('data',(chunk)=>{
        if(client === null){
            nick = (chunk+'').replace(/[\r\n]/ig,"");
            createClient();
        }else if(chunk){
            msg = (chunk+'').replace(/[\r\n]/ig,"");
                client.write(JSON.stringify({
                    cmd: 'chat',
                    msg: msg,
                    nick: nick
                }));
            //如果输入是exit或quit则断开连接并退出
            if(msg.toLowerCase() == 'exit' || msg.toLowerCase() == 'quit'){
                client.end();
                cin.end();
                return;
            }
            cout.write(`你说：${msg}\n\r`);
        }
});

function addListener(client) {
    client.on('connect', () => {
        cout.write(`已连接到服务器\n\r`);
        client.write(JSON.stringify({
            cmd: 'login',
            msg: '这里反正也不会显示乱来吧，可以修改成Vip登场信息',
            nick: nick
        }));
    });
    client.on('end', (chunk) => {
        cout.write(`与服务器断开连接.\n\r`);
    });
    client.on('data', (chunk) => {
        //如果是心跳信息则回应keep命令
        if(chunk.toString()=='::'){
            client.write(JSON.stringify({
                cmd: 'keep',
                msg: '这个是真的没用了',
                nick: nick
            }));
            return ;
        }
        cout.write(`${chunk}\n\r`);
    });
    client.on('error', (err) => {
        cout.write(`an error has occured.\n\r${err}`);
    });
}
/**
 * 创建socket并连接服务器
 */
function createClient(){
    //这个不知道啥网上的新奇东西作用是清屏
    console.log('\033[2J');
    cout.write(`输入'EXIT OR QUIT'退出聊天室.\r\n`);
    client = new net.Socket()
    client.connect({port:3000/*,host:'1.1.1.69'*/});
    addListener(client);
}