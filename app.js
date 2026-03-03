// 1. CALCULATEUR ROC
const RocCalculateur = {
    tauxTVA: 0.21,
    calculerTTC: function(montantHT) {
        const tva = montantHT * this.tauxTVA;
        const ttc = montantHT + tva;
        return {
            ttc: ttc.toFixed(2)
        };
    }
};
// --- SYSTÈME DE NAVIGATION ---

function afficherSection(nomSection) {
    // 1. On cache toutes les sections possibles
    document.getElementById('section-dashboard').style.display = 'none';
    document.getElementById('section-parametres').style.display = 'none';

    // 2. On affiche uniquement celle demandée
    if(nomSection === 'dashboard') {
        document.getElementById('section-dashboard').style.display = 'block';
    } else if(nomSection === 'parametres') {
        document.getElementById('section-parametres').style.display = 'block';
    }
}

// 2. FONCTIONS DE LA FENÊTRE (MODALE)
function ouvrirModale() {
    document.getElementById('modal-client').style.display = 'flex';
}

function fermerModale() {
    document.getElementById('modal-client').style.display = 'none';
}

// 3. FONCTION D'ENREGISTREMENT (Celle qui bloquait)
function validerAjoutClient() {
    // Récupération des données
    const champNom = document.getElementById('new-client-name');
    const champSecteur = document.getElementById('new-client-sector');
    const champMontant = document.getElementById('new-client-amount');

    // Vérification si les champs existent bien
    if (!champNom || !champSecteur || !champMontant) {
        console.error("Erreur : Un des champs HTML est introuvable.");
        return;
    }

    const nom = champNom.value;
    const secteur = champSecteur.value;
    const montantHT = parseFloat(champMontant.value) || 0;

    // Sécurité
    if (nom.trim() === "") {
        alert("Rémy, le nom est obligatoire.");
        return;
    }

    // Calcul
    const resultat = RocCalculateur.calculerTTC(montantHT);

    // Ajout au tableau
    const tableBody = document.getElementById('client-table-body');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td style="padding: 1rem; border-bottom: 1px solid #1f2937; font-weight: bold;">${nom}</td>
        <td style="padding: 1rem; border-bottom: 1px solid #1f2937;">${new Date().toLocaleDateString('fr-FR')}</td>
        <td style="padding: 1rem; border-bottom: 1px solid #1f2937;">
            <span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: bold;">
                PROSPECT (${resultat.ttc}€)
            </span>
        </td>
    `;
    
    tableBody.prepend(row);

    // Fermeture et nettoyage
    fermerModale();
    champNom.value = "";
    champSecteur.value = "";
    champMontant.value = "";
}