#!/usr/bin/env node
const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Utilitaire : créer un dossier s'il n'existe pas
function createDirIfNotExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`Dossier créé : ${dirPath}`);
	} else {
		console.log(`Le dossier existe déjà : ${dirPath}`);
	}
}

// Utilitaire : créer un fichier s'il n'existe pas
function writeFileIfNotExists(filePath, content) {
	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, content.trimStart());
		console.log(`Fichier créé : ${filePath}`);
	} else {
		console.log(`Fichier déjà existant : ${filePath}`);
	}
}

// Fonction pour créer plusieurs dossiers
function createDirs(baseDir, dirs) {
	dirs.forEach((dir) => createDirIfNotExists(path.join(baseDir, dir)));
}

// Contenus communs et frontend
const gitignoreContent = `
node_modules
.env
dist
`;

const frontendEnvContent = `
# Variables d'environnement frontend
VITE_API_URL=http://localhost:5000
`;

const frontendReadmeContent = `
# Frontend React avec Vite
Structure frontend React avec Vite et dossiers organisés.
`;

const frontendIndexHtmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mon Projet React</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;

const frontendMainJsxContent = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
`;

const frontendAppJsxContent = `
import React from 'react';
import { Routes, Route } from 'react-router-dom';

function Home() {
  return <h2>Accueil</h2>;
}

function About() {
  return <h2>À propos</h2>;
}

function App() {
  return (
    <div>
      <h1>Bienvenue dans mon projet React ! 🚀</h1>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
`;

// Backend
const backendEnvContent = `
# Variables d'environnement backend
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=password
`;

const backendReadmeContent = `
# Backend
Serveur Express basique avec middlewares cors et morgan
`;

// Backend app.js et server.js
const appJsContent = `
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

// Middlewares globaux
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Exemple route simple
app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

module.exports = app;
`;

const serverJsContent = `
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

// Commande create <projectName>
program
	.command("create <projectName>")
	.description("Créer une base de projet React avec backend et frontend")
	.action((projectName) => {
		const targetDir = path.join(process.cwd(), projectName);

		// Création dossier principal
		createDirIfNotExists(targetDir);

		// ========== FRONTEND ==========
		const frontendDir = path.join(targetDir, "frontend");

		// Créer dossier frontend vide
		createDirIfNotExists(frontendDir);

		// 1. Initialisation vite + react (force overwrite si besoin)
		console.log("Initialisation frontend avec Vite + React...");
		execSync("npm create vite@latest . -- --template react --force", {
			cwd: frontendDir,
			stdio: "inherit",
		});

		// 2. Installation des dépendances frontend
		execSync("npm install", { cwd: frontendDir, stdio: "inherit" });
		execSync("npm install sass react-router-dom", {
			cwd: frontendDir,
			stdio: "inherit",
		});

		// 3. Création des dossiers personnalisés frontend
		createDirIfNotExists(path.join(frontendDir, "public"));
		createDirIfNotExists(path.join(frontendDir, "public", "assets"));

		const frontendSrcDir = path.join(frontendDir, "src");
		createDirs(frontendSrcDir, [
			"assets",
			"components",
			"pages",
			"hooks",
			"styles",
			"animations",
		]);

		// 4. Création fichiers frontend custom (écrasement possible)
		writeFileIfNotExists(
			path.join(frontendDir, ".gitignore"),
			gitignoreContent
		);
		writeFileIfNotExists(
			path.join(frontendDir, ".env"),
			frontendEnvContent
		);
		writeFileIfNotExists(
			path.join(frontendDir, "README.md"),
			frontendReadmeContent
		);
		writeFileIfNotExists(
			path.join(frontendDir, "public", "index.html"),
			frontendIndexHtmlContent
		);
		writeFileIfNotExists(
			path.join(frontendSrcDir, "main.jsx"),
			frontendMainJsxContent
		);
		writeFileIfNotExists(
			path.join(frontendSrcDir, "App.jsx"),
			frontendAppJsxContent
		);

		// ========== BACKEND ==========
		const backendDir = path.join(targetDir, "backend");
		createDirIfNotExists(backendDir);

		// Création dossiers backend complets
		const backendDirs = [
			"config",
			"controllers",
			"middleware",
			"models",
			"routes",
			"auth",
			"utils",
			"tests",
		];
		createDirs(backendDir, backendDirs);

		// Création fichiers backend
		writeFileIfNotExists(
			path.join(backendDir, ".gitignore"),
			gitignoreContent
		);
		writeFileIfNotExists(path.join(backendDir, ".env"), backendEnvContent);
		writeFileIfNotExists(
			path.join(backendDir, "README.md"),
			backendReadmeContent
		);
		writeFileIfNotExists(path.join(backendDir, "app.js"), appJsContent);
		writeFileIfNotExists(
			path.join(backendDir, "server.js"),
			serverJsContent
		);

		// Initialiser npm et installer dépendances backend
		console.log("Initialisation backend...");
		execSync("npm init -y", { cwd: backendDir, stdio: "inherit" });
		execSync("npm install express dotenv cors morgan", {
			cwd: backendDir,
			stdio: "inherit",
		});

		console.log(`\nProjet "${projectName}" créé avec succès ! 🚀`);
		console.log(
			`Structure frontend (Vite + React) et backend prête avec dépendances installées.`
		);
	});

program.parse(process.argv);
