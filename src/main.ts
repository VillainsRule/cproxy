import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

(async () => {
    const input = await new Promise<string[]>((r) => {
        console.log('[cproxy] paste all proxies, then click enter twice:\n');

        let input: string[] = [];

        rl.on('line', (line) => {
            input.push(line);

            if (input[input.length - 1] === '' && input[input.length - 2] === '') {
                rl.close();
                r(input.filter(e => e && e.trim().length > 10))
            }
        });
    });

    console.log('got it! validating now...\n');

    const outputPath = path.join(os.tmpdir(), 'cproxy-output.txt');
    fs.writeFileSync(outputPath, '');

    await Promise.all(input.map(async (proxy) => {
        try {
            const res = await fetch('https://clean.myip.wtf/json', {
                proxy: proxy.trim().replace('socks5h', 'http').replace('socks5', 'http'),
                tls: { rejectUnauthorized: false }
            });

            const proxyUsername = proxy.split(':')[1];

            if (res.status === 200) {
                fs.appendFileSync(outputPath, proxy.trim() + '\n');
                console.log(`[${res.status}] - ${proxyUsername} - ${(await res.json() as any)?.YourIPAddress}`);
            } else console.log(`[${res.status}] - ${proxyUsername}`);
        } catch (err: any) {
            console.error(`[ERR] - ${proxy.split(':')[1]} - ${err.message}`);
        }
    }));

    console.log(`\nvalid proxies saved to ${outputPath}`);
})();