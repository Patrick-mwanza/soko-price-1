const fs = require('fs');
const http = require('http');

const configPath = 'c:/Users/ADMIN/Desktop/Soko Yetu/client/testsprite_tests/tmp/config.json';
const interval = setInterval(() => {
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.serverPort && config.status === 'init') {
                console.log('Found server port:', config.serverPort);
                clearInterval(interval);

                const req = http.request({
                    method: 'POST',
                    host: '127.0.0.1',
                    port: config.serverPort,
                    path: '/api/commit?project_path=' + encodeURIComponent('c:/Users/ADMIN/Desktop/Soko Yetu/client')
                }, (res) => {
                    let data = '';
                    res.on('data', d => data += d);
                    res.on('end', () => {
                        console.log('Commit response:', data);
                        process.exit(0);
                    });
                });
                req.on('error', (e) => {
                    console.error('Request error:', e);
                });

                const boundary = '----WebKitFormBoundary7r1F12mAA';
                req.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
                req.write(`--${boundary}\r\nContent-Disposition: form-data; name="mode"\r\n\r\nfrontend\r\n`);
                req.write(`--${boundary}\r\nContent-Disposition: form-data; name="port"\r\n\r\n5173\r\n`);
                req.write(`--${boundary}\r\nContent-Disposition: form-data; name="scope"\r\n\r\ncodebase\r\n`);
                req.write(`--${boundary}\r\nContent-Disposition: form-data; name="login_user"\r\n\r\nadmin@sokoprice.co.ke\r\n`);
                req.write(`--${boundary}\r\nContent-Disposition: form-data; name="login_password"\r\n\r\nAdmin@123456\r\n`);
                req.write(`--${boundary}--\r\n`);
                req.end();
            }
        } catch (e) { }
    }
}, 500);

setTimeout(() => {
    console.log("Timeout waiting for config.json");
    process.exit(1);
}, 30000);
