# 🎮 CS2 Transfer Simulator

Simule des transferts de joueurs CS2 entre équipes professionnelles !

![CS2 Transfer Simulator](https://img.shields.io/badge/CS2-Transfer%20Simulator-orange)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-blue)
![PandaScore](https://img.shields.io/badge/PandaScore-API-green)

## ✨ Fonctionnalités

- 🏆 **Équipes CS2 en temps réel** via PandaScore API
- 🔄 **Drag & drop** pour simuler les transferts
- 💾 **Persistance** automatique dans le navigateur
- ↩️ **Annulation** des transferts
- 🔍 **Recherche** d'équipes
- 📱 **Responsive** design

## 🚀 Démarrage rapide

### 1. Installation

```bash
npm install
```

### 2. Configuration PandaScore (REQUIS)

1. Créez un compte gratuit sur [pandascore.co](https://pandascore.co/)
2. Récupérez votre clé API (gratuit : **1000 requêtes/heure**)
3. Créez un fichier `.env.local` :

```env
PANDASCORE_API_KEY=votre_cle_api_ici
```

### 3. Lancement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
cs-transfer-simulator/
├── src/
│   ├── app/
│   │   ├── api/teams/          # API routes (PandaScore)
│   │   ├── teams/[id]/         # Page équipe
│   │   ├── simulator/          # Simulateur de transferts
│   │   └── page.tsx            # Accueil
│   ├── components/ui/          # Composants React
│   ├── hooks/                  # Custom hooks
│   └── lib/
│       ├── pandascore.ts       # Client API PandaScore
│       └── types.ts            # Types TypeScript
```

## 🛠️ Stack technique

- **Next.js 16** - Framework React
- **Tailwind CSS 4** - Styling
- **@dnd-kit** - Drag and drop
- **PandaScore API** - Données esports en temps réel
- **TypeScript** - Typage strict

## 📊 PandaScore API

| Fonctionnalité | Description |
|----------------|-------------|
| **Tier gratuit** | 1000 requêtes/heure |
| **Équipes** | Toutes les équipes CS2 actives |
| **Joueurs** | 17,000+ joueurs avec stats |
| **Mise à jour** | Quotidienne |

➡️ [Créer un compte PandaScore](https://pandascore.co/)

## 🎨 Design

- Thème dark inspiré de HLTV
- Couleurs : Orange (#ff6600), Navy (#0d1117), Cyan (#00d4ff)
- Animations fluides et micro-interactions

## 📝 License

MIT
