import fs from 'node:fs';
import path from 'node:path';

const inputPath = path.join(import.meta.dirname, '..', 'input.txt');
if (!fs.existsSync(inputPath)) {
    fs.writeFileSync(inputPath, '');
    console.error(`add proxies to ${inputPath} and run again`);
    process.exit(1);
}

const outputPath = path.join(import.meta.dirname, '..', 'output.txt');
fs.writeFileSync(outputPath, '');

const testProxies = fs.readFileSync(inputPath, 'utf8');

await Promise.all(testProxies.split('\n').filter(e => e.trim().length > 1).map(async (proxy) => {
    try {
        const res = await fetch('https://clean.myip.wtf/json', { proxy: proxy.trim().replace('socks5h', 'http').replace('socks5', 'http'), tls: { rejectUnauthorized: false } });
        const proxyUsername = proxy.split(':')[1];
        if (res.status === 200) {
            fs.appendFileSync(outputPath, proxy.trim() + '\n');
            console.log(`[${res.status}] - ${proxyUsername} - ${(await res.json() as any)?.YourIPAddress}`);
        } else console.log(`[${res.status}] - ${proxyUsername}`);
    } catch (err: any) {
        console.log(`[ERR] - ${proxy.split(':')[1]} - ${err.message}`);
    }
}));

console.log(`\nvalid proxies saved to ${outputPath}`);