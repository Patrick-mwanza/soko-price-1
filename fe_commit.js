const http = require('http');

const port = 23869;
const projectPath = 'c:/Users/ADMIN/Desktop/Soko Yetu/client';
const boundary = '----WKF';

const parts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="mode"\r\n\r\nfrontend\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="port"\r\n\r\n5173\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="scope"\r\n\r\ncodebase\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="login_user"\r\n\r\nadmin@sokoprice.co.ke\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="login_password"\r\n\r\nAdmin@123456\r\n`,
    `--${boundary}--\r\n`
];

const body = parts.join('');

const req = http.request({
    method: 'POST',
    host: '127.0.0.1',
    port: port,
    path: '/api/commit?project_path=' + encodeURIComponent(projectPath),
    headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary
    }
}, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(body);
req.end();
