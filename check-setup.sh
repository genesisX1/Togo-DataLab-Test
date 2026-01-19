#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Vérification de l'Installation - Système de Réservations     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "✓ Node.js installé: "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}Oui ($NODE_VERSION)${NC}"
else
    echo -e "${RED}Non - Installez Node.js 18+${NC}"
    exit 1
fi

# Check npm
echo -n "✓ npm installé: "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}Oui ($NPM_VERSION)${NC}"
else
    echo -e "${RED}Non${NC}"
    exit 1
fi

# Check frontend dependencies
echo -n "✓ Dépendances frontend: "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}Installées${NC}"
else
    echo -e "${RED}Non installées - Exécutez: npm install${NC}"
fi

# Check backend dependencies
echo -n "✓ Dépendances backend: "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}Installées${NC}"
else
    echo -e "${RED}Non installées - Exécutez: cd backend && npm install${NC}"
fi

# Check backend .env
echo -n "✓ Fichier backend/.env: "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}Existe${NC}"
else
    echo -e "${RED}Manquant - Il devrait avoir été créé automatiquement${NC}"
fi

# Check root .env
echo -n "✓ Fichier .env (racine): "
if [ -f ".env" ]; then
    echo -e "${GREEN}Existe${NC}"
else
    echo -e "${YELLOW}Manquant${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Tests de Connectivité"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if backend is running
echo -n "✓ Backend accessible (port 3001): "
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}Oui ✓${NC}"
    BACKEND_RESPONSE=$(curl -s http://localhost:3001/api/health)
    echo "  Réponse: $BACKEND_RESPONSE"
else
    echo -e "${RED}Non${NC}"
    echo -e "  ${YELLOW}→ Le backend n'est pas démarré${NC}"
    echo -e "  ${YELLOW}→ Exécutez: cd backend && node src/server.js${NC}"
fi

# Check if frontend is running
echo -n "✓ Frontend accessible (port 5173): "
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}Oui ✓${NC}"
else
    echo -e "${RED}Non${NC}"
    echo -e "  ${YELLOW}→ Le frontend n'est pas démarré${NC}"
    echo -e "  ${YELLOW}→ Exécutez: npm run dev${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Instructions"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Pour démarrer l'application:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend"
echo "    node src/server.js"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    npm run dev"
echo ""
echo "Puis ouvrez: http://localhost:5173"
echo ""
echo "Pour plus d'aide, consultez: TROUBLESHOOTING.md"
echo ""
