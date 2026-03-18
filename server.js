const fs = require('fs');
const ssh2 = require('ssh2');
const blessed = require('blessed');
const chalk = require('chalk');
const figlet = require('figlet');

const PORT = 3000;
const HOST_KEY = fs.readFileSync('host.key');

console.log('--- Starting Professional TUI Portfolio ---');

const server = new ssh2.Server({
  hostKeys: [HOST_KEY]
}, (client) => {
  client.on('authentication', (ctx) => ctx.accept())
  .on('ready', () => {
    client.on('session', (accept, reject) => {
      const session = accept();
      let pty_info;
      let shellStream;

      session.on('pty', (accept, reject, info) => {
        pty_info = info;
        if (accept) accept();
      });

      session.on('window-change', (accept, reject, info) => {
        pty_info = info;
        if (shellStream) {
          shellStream.columns = info.cols;
          shellStream.rows = info.rows;
          shellStream.emit('resize');
        }
        if (accept) accept();
      });

      session.on('shell', (accept, reject) => {
        shellStream = accept();
        console.log('[INFO] Client session started');
        
        // Essential configuration for blessed over SSH
        shellStream.isTTY = true;
        shellStream.setWindow = function(rows, cols) {
           this.rows = rows;
           this.columns = cols;
           this.emit('resize');
        };
        if (pty_info) {
           shellStream.columns = pty_info.cols;
           shellStream.rows = pty_info.rows;
        }

        try {
          // Initialize Blessed Program and Screen cleanly
          const program = blessed.program({
            input: shellStream,
            output: shellStream,
            terminal: (pty_info && pty_info.term) || 'xterm-256color',
          });

          const screen = blessed.screen({
            program: program,
            smartCSR: true,
            fullUnicode: true,
            title: 'Sahil Mane - Portfolio'
          });

          // Main Layout Container (Using absolute positioning to eliminate unwanted space)
          const container = blessed.box({
            parent: screen,
            top: 'center',
            left: 'center',
            width: 140, // Increased width to match accurate image + right column
            height: 38,
          });

          // --- LEFT COLUMN: ASCII ART ---
          const portrait = blessed.box({
            parent: container,
            top: 2,
            left: 0,
            width: 75,
            height: '100%',
            content: fs.existsSync('image.txt') ? fs.readFileSync('image.txt', 'utf8') : 'Sahil Profile',
            style: { fg: 'white' }
          });

          // --- RIGHT COLUMN: CONTENT ---
          const rightCol = blessed.box({
            parent: container,
            top: 2,
            left: 75, // Move right column more to the right to clear the image
            width: 65,
            height: '100%-4'
          });

          // ASCII NAME Header
          const header = blessed.box({
            parent: rightCol,
            top: 0,
            left: 0,
            width: '100%',
            height: 7,
            content: chalk.cyan.bold(figlet.textSync('SAHIL', { font: 'Slant' })),
            tags: true
          });

          // Animated Stars (Moving element)
          const stars = blessed.box({
            parent: rightCol,
            top: 0,
            left: 31,
            width: 15,
            height: 5,
            content: '',
            style: { fg: 'white' }
          });

          let starFrame = 0;
          const starFrames = [
            '  *     +\n     *  \n  +     ',
            '  +     *\n     +  \n  *     ',
            '  *     +\n     *  \n  +     '
          ];
          
          const starInterval = setInterval(() => {
            starFrame = (starFrame + 1) % starFrames.length;
            stars.setContent(starFrames[starFrame]);
            screen.render();
          }, 800);

          // VIEWS Content
          const views = {
            'Bio': [
              `${chalk.white.bold('Hi, I\'m Sahil Mane')} — a developer who builds`,
              `digital experiences from scratch. I focus on engineering`,
              `clean interfaces, meaningful motion, and systems that`,
              `work beyond the surface.`,
              ``,
              `${chalk.cyan('FULL STACK DEVELOPER')}  ·  Pune, India`,
              ``,
              `I turn ideas into working digital experiences through code.`,
              `Self-taught, curiosity-driven, and always building.`,
              ``,
              `${chalk.white.bold('Skills & Services')}`,
              `› Web Development  › UX / UI Design`,
              `› Backend Systems  › Creative Direction`,
              `› eCommerce & 3D   › Video & Animation`,
              ``,
              `Secured ${chalk.cyan('3rd place at GDG Nagpur Hackathon')} and have a`,
              `strong foundation in C++ and Data Structures & Algorithms.`,
            ].join('\n'),

            'Projects': [
              `${chalk.white.bold('01 · BUILDING REACT')}  ${chalk.grey('2025')}`,
              `${chalk.cyan('Frontend / Core Engineering')}`,
              `JS · Virtual DOM · Reconciliation · Fiber Arch`,
              `Educational project building a React-like library`,
              `from scratch.`,
              ``,
              `${chalk.white.bold('02 · BITTORRENT')}  ${chalk.grey('2026')}`,
              `${chalk.cyan('Systems / Network Protocol')}`,
              `Node.js · TCP/IP · Networking · Buffers`,
              `Research-driven implementation of the BitTorrent`,
              `protocol from the ground up.`,
              ``,
              `${chalk.white.bold('03 · AI RESUME')}  ${chalk.grey('2024')}`,
              `${chalk.cyan('AI / Engineering')}`,
              `React · OpenAI API · Tailwind · Next.js`,
              `AI powered tool for resume analysis and ATS`,
              `compatibility scoring.`,
              ``,
              `${chalk.white.bold('04 · REALTIME TRACKER')}  ${chalk.grey('2025')}`,
              `${chalk.cyan('Full Stack / Socket.io')}`,
              `Socket.io · Leaflet.js · Express · Node.js`,
              `Real-time multi-user location tracker with live`,
              `map updates.`,
              ``,
              `${chalk.white.bold('05 · REPOLENS')}  ${chalk.grey('2025')}`,
              `${chalk.cyan('DevTools / Analytics')}`,
              `Next.js · GitHub API · Data Viz · Chart.js`,
              `Deep insights into GitHub repositories and`,
              `contribution patterns.`,
            ].join('\n'),

            'Contact': [
              `${chalk.white.bold('Let\'s Talk.')}`,
              `Have an idea? Need a system that scales?`,
              `Or just want to talk about the future of tech?`,
              ``,
              `In most terminals you can Cmd/Ctrl+click links:`,
              ``,
              `${chalk.cyan.bold('● LinkedIn')}`,
              `  https://www.linkedin.com/in/sahilmane74/`,
              ``,
              `${chalk.cyan.bold('● GitHub')}`,
              `  https://github.com/sahilmane69`,
              ``,
              `${chalk.cyan.bold('● Portfolio')}`,
              `  https://sahilmane-one.vercel.app`,
              `${chalk.grey('Base:')} Bhosari, Pune, Maharashtra`,
            ].join('\n')
          };

          const tabs = ['Bio', 'Projects', 'Contact'];
          let activeTab = 0;

          const bio = blessed.box({
            parent: rightCol,
            top: 6,
            left: 0,
            width: '100%',
            height: 28,
            tags: true,
            content: views[tabs[activeTab]],
            style: { fg: '#a0a0a0' } // Lighter greyish text for readability
          });

          // FOOTER MENU
          const menu = blessed.box({
            parent: rightCol,
            bottom: 0,
            left: 0,
            width: '100%',
            height: 1,
            tags: true,
          });

          function updateMenu() {
            let menuStr = '';
            for (let i = 0; i < tabs.length; i++) {
              if (i === activeTab) {
                menuStr += `${chalk.cyan.bold('↓ ' + tabs[i])}   `;
              } else {
                menuStr += `${tabs[i]}   `;
              }
            }
            menu.setContent(menuStr);
            bio.setContent(views[tabs[activeTab]]); // Update page content when selecting tab
            screen.render();
          }
          
          updateMenu();

          // Keyboard Navigation
          screen.key(['right', 'd'], () => {
            activeTab = (activeTab + 1) % tabs.length;
            updateMenu();
          });

          screen.key(['left', 'a'], () => {
            activeTab = (activeTab - 1 + tabs.length) % tabs.length;
            updateMenu();
          });

          // BOTTOM STATUS BAR
          const statusBar = blessed.box({
            parent: screen,
            bottom: 0,
            left: 0,
            width: '100%',
            height: 1,
            content: ' [← → to select tab · q to quit]',
            style: { fg: 'grey' }
          });

          // Handle Keys Cleanup
          screen.key(['q', 'C-c', 'escape'], () => {
             clearInterval(starInterval);
             screen.destroy();
             shellStream.end();
          });

          // Render
          screen.render();

          shellStream.on('end', () => {
             if (!screen.destroyed) screen.destroy();
          });

        } catch (err) {
          console.error('TUI Render Error:', err);
          shellStream.end('Internal Terminal Error\r\n');
        }
      });
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SUCCESS] Portfolio is live on port ${PORT}`);
});
