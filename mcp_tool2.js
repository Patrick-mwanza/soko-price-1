const { spawn } = require('child_process');
const fs = require('fs');

const API_KEY = process.env.API_KEY || 'sk-user-lJyuwzBakHGAaLQ3ST4c4tFjPYjZLSabyVZiEvOakkDFjN32AzJzOn1RZJpYyRibCRSDPWP1yRPvscPGqajnBbvrdWW-gipYm8dIfXjND6Vg4i7jEI1TGr9LBJ4VfxA0-TU';
const toolName = process.argv[2];
const toolArgs = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));

const mcpProcess = spawn('node', [
    'C:\\Users\\ADMIN\\AppData\\Roaming\\npm\\node_modules\\@testsprite\\testsprite-mcp\\dist\\index.js'
], {
    env: { ...process.env, API_KEY: API_KEY }
});

const outStream = fs.createWriteStream('mcp_call_out.txt');

mcpProcess.stdout.pipe(outStream);
mcpProcess.stderr.pipe(process.stderr);

const send = (msg) => {
    mcpProcess.stdin.write(JSON.stringify(msg) + '\n');
};

send({
    jsonrpc: '2.0',
    id: 0,
    method: 'initialize',
    params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" }
    }
});

setTimeout(() => {
    send({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} });
    send({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
            name: toolName,
            arguments: toolArgs
        }
    });
}, 1000);

setTimeout(() => {
    mcpProcess.kill();
}, 300000);
