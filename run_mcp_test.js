const { spawn } = require('child_process');
const fs = require('fs');

const API_KEY = '12de9402-9993-4720-9141-86cc78f4b14d';

const mcpProcess = spawn('node', [
    'C:\\Users\\ADMIN\\AppData\\Roaming\\npm\\node_modules\\@testsprite\\testsprite-mcp\\dist\\index.js'
], {
    env: { ...process.env, API_KEY }
});

const outStream = fs.createWriteStream('mcp_out.txt');

mcpProcess.stdout.pipe(outStream);
mcpProcess.stderr.pipe(process.stderr);

mcpProcess.on('close', (code) => {
    console.log(`MCP process exited with code ${code}`);
});

mcpProcess.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 0,
    method: 'initialize',
    params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" }
    }
}) + '\n');

setTimeout(() => {
    mcpProcess.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 'noti1', method: 'notifications/initialized', params: {} }) + '\n');
    mcpProcess.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
    }) + '\n');
}, 1000);

setTimeout(() => {
    mcpProcess.kill();
}, 2000);
