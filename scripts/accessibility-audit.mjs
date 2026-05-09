import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { dirname, join, relative, sep } from "node:path";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const projectRoot = process.cwd();
const distDir = join(projectRoot, "dist");
const reportsDir = join(projectRoot, ".lighthouse", "accessibility");
const accessibilityThreshold = 100;
const host = "127.0.0.1";
const bunCommand = "bun";

const stripAnsi = (value) =>
  value.replace(
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Strips CLI ANSI escape sequences.
    /[\u001B\u009B][[\]()#;?]*(?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*\u0007|(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~])/g,
    "",
  );

const getFreePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();

    server.once("error", reject);
    server.listen(0, host, () => {
      const address = server.address();
      server.close(() => {
        if (typeof address === "object" && address !== null) {
          resolve(address.port);
          return;
        }

        reject(new Error("Could not allocate a local preview port."));
      });
    });
  });

const findIndexFiles = (directory) => {
  const entries = readdirSync(directory);
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      files.push(...findIndexFiles(path));
    } else if (entry === "index.html") {
      files.push(path);
    }
  }

  return files;
};

const routeFromIndexFile = (file) => {
  const routeDirectory = relative(distDir, dirname(file)).split(sep).join("/");
  return routeDirectory === "" ? "/" : `/${routeDirectory}/`;
};

const discoverRoutes = () => {
  if (!existsSync(distDir)) {
    throw new Error("Missing dist/. Run `bun run build` before auditing accessibility.");
  }

  const routes = findIndexFiles(distDir).map(routeFromIndexFile).sort();

  if (routes.length === 0) {
    throw new Error("No generated HTML routes found in dist/.");
  }

  return routes;
};

const waitForPreview = async (previewProcess, initialOrigin) => {
  const startedAt = Date.now();
  let origin = initialOrigin;
  let output = "";

  const captureOutput = (chunk) => {
    output += stripAnsi(chunk.toString());
    const match = output.match(/Local\s+(https?:\/\/[^\s/]+(?::\d+)?\/?)/);

    if (match?.[1]) {
      origin = match[1].replace(/\/$/, "");
    }
  };

  previewProcess.stdout.on("data", captureOutput);
  previewProcess.stderr.on("data", captureOutput);

  while (Date.now() - startedAt < 15_000) {
    if (previewProcess.exitCode !== null) {
      throw new Error(`Astro preview exited early.\n${output.trim()}`);
    }

    try {
      const response = await fetch(origin);
      if (response.ok) {
        return origin;
      }
    } catch {
      // Retry until Astro preview is ready or the timeout is reached.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Astro preview did not become ready.\n${output.trim()}`);
};

const killProcessTree = (child) => {
  if (!child.pid) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill("SIGTERM");
};

const withTimeout = async (promise, timeoutMs, message) => {
  let timeout;

  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return await Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
};

const reportFileNameForRoute = (route) =>
  route === "/" ? "home.json" : `${route.replace(/^\/|\/$/g, "").replaceAll("/", "-")}.json`;

const readAuditResult = (route, reportPath) => {
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const accessibilityScore = Math.round(report.categories.accessibility.score * 100);
  const failingAudits = Object.values(report.audits)
    .filter((audit) => audit.score !== null && audit.score < 1)
    .map((audit) => audit.id)
    .sort();

  return {
    route,
    accessibilityScore,
    failingAudits,
  };
};

const runLighthouse = async (origin, route) => {
  const url = new URL(route, `${origin}/`).href;
  const reportPath = join(reportsDir, reportFileNameForRoute(route));
  const profileDir = join(
    reportsDir,
    "chrome-profiles",
    reportFileNameForRoute(route).replace(".json", ""),
  );

  console.log(`Auditing ${route}`);
  mkdirSync(profileDir, { recursive: true });

  const chrome = await launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    logLevel: "silent",
    userDataDir: profileDir,
  });

  try {
    const result = await withTimeout(
      lighthouse(url, {
        logLevel: "silent",
        maxWaitForLoad: 15_000,
        onlyCategories: ["accessibility"],
        output: "json",
        port: chrome.port,
      }),
      60_000,
      `Lighthouse timed out for ${route}.`,
    );

    if (!result) {
      throw new Error(`Lighthouse did not return a result for ${route}.`);
    }

    writeFileSync(reportPath, JSON.stringify(result.lhr, null, 2));
  } finally {
    chrome.kill();
  }

  return readAuditResult(route, reportPath);
};

const main = async () => {
  const routes = discoverRoutes();

  rmSync(reportsDir, { recursive: true, force: true });
  mkdirSync(reportsDir, { recursive: true });

  const port = await getFreePort();
  const initialOrigin = `http://${host}:${port}`;
  const previewProcess = spawn(
    bunCommand,
    ["run", "preview", "--", "--host", host, "--port", String(port)],
    {
      cwd: projectRoot,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  try {
    const origin = await waitForPreview(previewProcess, initialOrigin);
    const results = [];

    for (const route of routes) {
      results.push(await runLighthouse(origin, route));
    }

    console.table(
      results.map((result) => ({
        Route: result.route,
        Accessibility: result.accessibilityScore,
        "Failing audits": result.failingAudits.join(", ") || "none",
      })),
    );

    const failures = results.flatMap((result) => {
      if (result.accessibilityScore >= accessibilityThreshold) {
        return [];
      }

      const auditSummary =
        result.failingAudits.length > 0
          ? ` Failing audits: ${result.failingAudits.join(", ")}.`
          : "";

      return `${result.route} scored ${result.accessibilityScore}, below the ${accessibilityThreshold} threshold.${auditSummary}`;
    });

    if (failures.length > 0) {
      throw new Error(`Accessibility audit failed:\n- ${failures.join("\n- ")}`);
    }

    console.log(`Accessibility audit reports written to ${relative(projectRoot, reportsDir)}/`);
  } finally {
    if (!previewProcess.killed) {
      killProcessTree(previewProcess);
    }
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
