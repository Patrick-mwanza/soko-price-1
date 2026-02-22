const { spawn } = require('child_process');
const fs = require('fs');

const API_KEY = process.env.API_KEY || '12de9402-9993-4720-9141-86cc78f4b14d';
const toolName = process.argv[2];
const argsFile = process.argv[3];
const toolArgs = JSON.parse(fs.readFileSync(argsFile, 'utf8'));

console.log(`Starting ${toolName} with args:`, toolArgs);

const mcpProcess = spawn('node', [
    'C:\\Users\\ADMIN\\AppData\\Roaming\\npm\\node_modules\\@testsprite\\testsprite-mcp\\dist\\index.js'
], {
    env: { ...process.env, API_KEY: API_KEY }
});

let outputBuffer = '';

mcpProcess.stdout.on('data', (data) => {
    outputBuffer += data.toString();
    const parts = outputBuffer.split('\n');
    outputBuffer = parts.pop();
    for (const part of parts) {
        if (part.trim()) {
            console.log("RECV:", part);
            try {
                const msg = JSON.parse(part);
                if (msg.id === 1) { // Our tool call request
                    console.log("TOOL RESPONSE:", JSON.stringify(msg, null, 2));
                    mcpProcess.kill();
                    process.exit(0);
                }
            } catch (e) { }
        }
    }
});

mcpProcess.stderr.on('data', (data) => {
    console.error(`STDERR: ${data.toString()}`);
});

const send = (msg) => {
    console.log("SEND:", JSON.stringify(msg));
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
    send({ jsonrpc: '2.0', id: 'noti1', method: 'notifications/initialized', params: {} });
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
