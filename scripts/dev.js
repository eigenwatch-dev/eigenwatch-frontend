const prompts = require("prompts");
const { spawn } = require("child_process");
const net = require("net");

const APPS = {
  web: 3000,
  docs: 3001,
  dashboard: 3002,
};

async function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false); // Treat other errors as unavailable for safety
      }
    });
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await checkPort(port))) {
    port++;
  }
  return port;
}

async function run() {
  const args = process.argv.slice(2);
  let app = args[0];

  if (!app) {
    const response = await prompts({
      type: "select",
      name: "value",
      message: "Select an application to run",
      choices: [
        { title: "Web (default port 3000)", value: "web" },
        { title: "Docs (default port 3001)", value: "docs" },
        { title: "Dashboard (default port 3002)", value: "dashboard" },
      ],
      initial: 0,
    });

    app = response.value;
  }

  if (app) {
    const defaultPort = APPS[app];
    if (!defaultPort) {
      console.log(`Unknown app: ${app}`);
      process.exit(1);
    }

    let port = defaultPort;
    const isAvailable = await checkPort(port);

    if (!isAvailable) {
      console.log(`Port ${port} is in use.`);
      port = await findAvailablePort(port + 1);
      console.log(`Using next available port: ${port}`);
    }

    console.log(`Starting ${app} on port ${port}...`);

    // We pass the port as an argument to the underlying command.
    // Next.js accepts the last --port argument if multiple are provided.
    const child = spawn(
      "npx",
      [
        "turbo",
        "run",
        "dev",
        `--filter=${app}`,
        "--",
        "--port",
        port.toString(),
      ],
      {
        stdio: "inherit",
        shell: true,
      },
    );

    child.on("close", (code) => {
      process.exit(code);
    });
  } else {
    console.log("No application selected.");
  }
}

run();
