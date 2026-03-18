const fs = require('fs');
const ssh2 = require('ssh2');

const PORT = 3333; 
const HOST_KEY = fs.readFileSync('host.key');

const server = new ssh2.Server({
  hostKeys: [HOST_KEY]
}, (client) => {
  console.log('\n[SERVER] New connection incoming...');

  client.on('authentication', (ctx) => {
    console.log(`[SERVER] Authenticating user: ${ctx.username}`);
    ctx.accept(); 
  })
  .on('ready', () => {
    console.log('[SERVER] Client authenticated!');

    client.on('session', (accept, reject) => {
      console.log('[SERVER] Session opened.');
      const session = accept();

      session.on('pty', (accept, reject, info) => {
        console.log(`[SERVER] PTY requested (${info.term})`);
        accept();
      });

      session.on('shell', (accept, reject) => {
        console.log('[SERVER] Shell started - Sending data now!');
        const stream = accept();

        // The "\r\n" is critical for SSH terminals
        stream.write('\r\n');
        stream.write('====================================\r\n');
        stream.write('   WELCOME TO SAHIL\'S SSH SERVER    \r\n');
        stream.write('====================================\r\n');
        stream.write('Status: ACTIVE\r\n');
        stream.write('Connection: SECURE\r\n');
        stream.write('\r\n');
        stream.write('If you can see this, it works! boss\r\n');
        stream.write('Press Ctrl+C to disconnect.\r\n');
        stream.write('\r\n');

        // Simple echo to keep connection alive and show interactivity
        stream.on('data', (data) => {
          stream.write(data); 
        });

      });
    });
  })
  .on('error', (err) => {
    console.log('[SERVER] Error:', err.message);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\x1b[32m[SUCCESS] Server is live on port ${PORT}\x1b[0m`);
  console.log(`Run: ssh -p ${PORT} localhost`);
});
