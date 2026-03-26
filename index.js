#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function logStep(message) {
	console.log(`\n=== ${message} ===`);
}

function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`📁 Dossier créé : ${dirPath}`);
	}
}

function writeFile(filePath, content) {
	fs.writeFileSync(filePath, content.trimStart(), "utf-8");
	console.log(`📄 Fichier écrit : ${filePath}`);
}

function run(command, cwd) {
	console.log(`> ${command}`);
	execSync(command, {
		cwd,
		stdio: "inherit",
	});
}

function createBackendStructure(backendDir) {
	const srcDir = path.join(backendDir, "src");

	[
		"config",
		"controllers",
		"middlewares",
		"models",
		"routes",
		"services",
		"utils",
	].forEach((folder) => ensureDir(path.join(srcDir, folder)));

	writeFile(
		path.join(backendDir, ".env"),
		`
PORT=5000
FRONTEND_URL=http://localhost:5173
`,
	);

	writeFile(
		path.join(backendDir, ".gitignore"),
		`
node_modules
.env
`,
	);

	writeFile(
		path.join(backendDir, "package.json"),
		`
{
	"name": "backend",
	"version": "1.0.0",
	"type": "commonjs",
	"main": "src/server.js",
	"scripts": {
		"dev": "nodemon src/server.js",
		"start": "node src/server.js"
	}
}
`,
	);

	writeFile(
		path.join(srcDir, "app.js"),
		`
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");

const app = express();

app.use(cors({
	origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
	res.json({ message: "Backend OK 🚀" });
});

app.use("/api", routes);

module.exports = app;
`,
	);

	writeFile(
		path.join(srcDir, "server.js"),
		`
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(\`✅ Backend lancé sur http://localhost:\${PORT}\`);
});
`,
	);

	writeFile(
		path.join(srcDir, "routes", "index.js"),
		`
const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
	res.json({ status: "ok" });
});

module.exports = router;
`,
	);
}

function createFrontendStructure(frontendDir) {
	const srcDir = path.join(frontendDir, "src");

	[
		"assets",
		"components",
		"pages",
		"layouts",
		"routes",
		"services",
		"hooks",
		"styles",
		"utils",
	].forEach((folder) => ensureDir(path.join(srcDir, folder)));

	writeFile(
		path.join(frontendDir, ".env"),
		`
VITE_API_URL=http://localhost:5000/api
`,
	);

	writeFile(
		path.join(frontendDir, ".gitignore"),
		`
node_modules
dist
.env
`,
	);

	writeFile(
		path.join(srcDir, "main.jsx"),
		`
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>
);
`,
	);

	writeFile(
		path.join(srcDir, "App.jsx"),
		`
import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";

export default function App() {
	return (
		<div>
			<header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
				<nav style={{ display: "flex", gap: "1rem" }}>
					<Link to="/">Accueil</Link>
					<Link to="/about">À propos</Link>
				</nav>
			</header>

			<main style={{ padding: "2rem" }}>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/about" element={<AboutPage />} />
				</Routes>
			</main>
		</div>
	);
}
`,
	);

	writeFile(
		path.join(srcDir, "pages", "HomePage.jsx"),
		`
export default function HomePage() {
	return (
		<section>
			<h1>Bienvenue sur ton frontend React 🚀</h1>
			<p>Base Vite + React prête.</p>
		</section>
	);
}
`,
	);

	writeFile(
		path.join(srcDir, "pages", "AboutPage.jsx"),
		`
export default function AboutPage() {
	return (
		<section>
			<h1>À propos</h1>
			<p>Tu peux maintenant construire ton site vitrine.</p>
		</section>
	);
}
`,
	);

	writeFile(
		path.join(srcDir, "styles", "index.css"),
		`
:root {
	font-family: Arial, sans-serif;
	line-height: 1.5;
	color: #222;
	background: #f7f7f7;
}

* {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}

body {
	min-width: 320px;
	min-height: 100vh;
}

main {
	max-width: 1100px;
	margin: 0 auto;
}
`,
	);
}

function createRootReadme(projectDir, projectName) {
	writeFile(
		path.join(projectDir, "README.md"),
		`
# ${projectName}

Projet fullstack généré avec moncli.

## Structure

- frontend : React + Vite
- backend : Node + Express

## Lancement

### Frontend
\`\`\`bash
cd frontend
npm run dev
\`\`\`

### Backend
\`\`\`bash
cd backend
npm run dev
\`\`\`
`,
	);
}

function scaffoldProject(projectName) {
	const projectDir = path.join(process.cwd(), projectName);
	const frontendDir = path.join(projectDir, "frontend");
	const backendDir = path.join(projectDir, "backend");

	if (fs.existsSync(projectDir)) {
		console.error(`❌ Le dossier "${projectName}" existe déjà.`);
		process.exit(1);
	}

	logStep(`Création du projet ${projectName}`);
	ensureDir(projectDir);

	// On crée les deux dossiers dès le début
	ensureDir(frontendDir);
	ensureDir(backendDir);

	logStep("Création de la structure backend");
	createBackendStructure(backendDir);

	logStep("Initialisation du backend");
	run("npm install express cors dotenv morgan", backendDir);
	run("npm install -D nodemon", backendDir);

	logStep("Création du frontend avec Vite + React");
	run(
		"npm create vite@latest . -- --template react --no-interactive --no-immediate",
		frontendDir,
	);
	run("npm install", frontendDir);
	run("npm install react-router-dom sass", frontendDir);
	createFrontendStructure(frontendDir);

	logStep("Création des fichiers racine");
	createRootReadme(projectDir, projectName);

	logStep("Projet généré avec succès");
	console.log(`\n✅ Projet prêt : ${projectDir}`);
	console.log(`Frontend : cd ${projectName}/frontend && npm run dev`);
	console.log(`Backend  : cd ${projectName}/backend && npm run dev`);
}

program
	.name("moncli")
	.description("CLI pour générer une base fullstack React + Vite + Express")
	.version("1.0.0");

program
	.command("create <projectName>")
	.description("Créer un projet avec frontend React/Vite et backend Express")
	.action((projectName) => {
		try {
			scaffoldProject(projectName);
		} catch (error) {
			console.error("\n❌ Erreur pendant la génération du projet.");
			console.error(error.message);
			process.exit(1);
		}
	});

program.parse(process.argv);
