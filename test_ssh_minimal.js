const fs = require('fs');
const ssh2 = require('ssh2');

const PORT = 3001; // Different port for testing
const HOST_KEY = fs.readFileSync('host.key');

const server = new ssh2.Server({
  hostKeys: [HOST_KEY]
}, (client) => {
  client.on('authentication', (ctx) => ctx.accept())
  .on('ready', () => {
    client.on('session', (accept, reject) => {
      const session = accept();
      session.on('pty', (accept, reject, info) => accept());
      session.on('shell', (accept, reject) => {
        const stream = accept();
        stream.write('\n\r');
        stream.write('HELLO SAHIL MANE!\n\r');
        stream.write('If you see this, SSH connection is working.\n\r');
        stream.write('Press any key to exit...\n\r');
        stream.on('data', () => stream.end());
      });
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal Test Server on ${PORT}`);
});
