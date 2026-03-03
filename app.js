/* ==========================================================
   ROCGESTION V1.0 - LE CERVEAU DU SYSTÈME (JURBISE_V1)
   ========================================================== */

// 1. CALCULATEUR DE TAXES (Normes Belges 21%)
const RocCalculateur = {
    tauxTVA: 0.21,
    calculerTTC: function(montantHT) {
        const tva = montantHT * this.tauxTVA;
        const ttc = montantHT + tva;
        return {
            ht: montantHT.toFixed(2),
            tva: tva.toFixed(2),
            ttc: ttc.toFixed(2)
        };
    }
};

// 2. SYSTÈME DE NAVIGATION (Changement de vue)
function afficherSection(nomSection) {
    // Liste des sections du HTML
    const sections = ['section-dashboard', 'section-clients', 'section-parametres'];
    
    // On cache tout
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // On affiche la section demandée
    const sectionCible = document.getElementById('section-' + nomSection);
    if (sectionCible) {
        sectionCible.style.display = 'block';
    }

    // Feedback console pour ton esprit d'analyse
    console.log("Navigation active : " + nomSection.toUpperCase());
}

// 3. GESTION DE LA MODALE
function ouvrirModale() {
    document.getElementById('modal-client').style.display = 'flex';
}

function fermerModale() {
    document.getElementById('modal-client').style.display = 'none';
}

// 4. MODIFICATION DE L'ENREGISTREUR POUR AJOUTER UN ID UNIQUE
function validerAjoutClient() {
    const nom = document.getElementById('new-client-name').value;
    const secteur = document.getElementById('new-client-sector').value;
    const montantHT = parseFloat(document.getElementById('new-client-amount').value) || 0;

    if (nom.trim() === "") return;

    const calcul = RocCalculateur.calculerTTC(montantHT);
    const dateJour = new Date().toLocaleDateString('fr-FR');
    
    // 5. Génération d'un ID unique basé sur le temps (timestamp)
    const clientId = "client-" + Date.now();

    // 6. --- A. DASHBOARD ---
    const tableDash = document.getElementById('client-table-body');
    const rowDash = document.createElement('tr');
    rowDash.id = "dash-" + clientId; // ID pour le dashboard
    rowDash.innerHTML = `
        <td style="padding: 1rem;"><i class="fas fa-bolt" style="color: #fbbf24; margin-right: 10px;"></i> ${nom}</td>
        <td style="padding: 1rem; color: #9ca3af;">${dateJour}</td>
        <td style="padding: 1rem; text-align: right; font-weight: bold; color: #10b981;">${calcul.ttc} €</td>
    `;
    tableDash.prepend(rowDash);

    // 7. --- B. ANNUAIRE + BOUTON SUPPRIMER ---
    const tableAnnu = document.getElementById('annuaire-table-body');
    const rowAnnu = document.createElement('tr');
    rowAnnu.id = "annu-" + clientId; // ID pour l'annuaire
    rowAnnu.innerHTML = `
        <td style="padding: 1.2rem; font-weight: bold; color: #3b82f6;">${nom.toUpperCase()}</td>
        <td style="padding: 1.2rem;"><span style="background: #1f2937; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; color: #9ca3af;">${secteur}</span></td>
        <td style="padding: 1.2rem; text-align: right;">
            <span style="margin-right: 15px;">${calcul.ht} € HT</span>
            <button onclick="supprimerClient('${clientId}')" style="background: none; border: none; color: #ef4444; cursor: pointer;">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    tableAnnu.prepend(rowAnnu);

    // --- C. COMPTEUR ---
    document.getElementById('total-partenaires').innerText = tableAnnu.rows.length;

    fermerModale();
    document.getElementById('new-client-name').value = "";
    document.getElementById('new-client-sector').value = "";
    document.getElementById('new-client-amount').value = "";
}

// 9. --- NOUVELLE FONCTION : SUPPRESSION SYNCHRONISÉE ---
function supprimerClient(id) {
    if (confirm("Rémy, confirmer la suppression définitive de ce dossier ?")) {
        // Suppression sur le Dashboard
        const ligneDash = document.getElementById("dash-" + id);
        if (ligneDash) ligneDash.remove();

        // Suppression sur l'Annuaire
        const ligneAnnu = document.getElementById("annu-" + id);
        if (ligneAnnu) ligneAnnu.remove();

        // Mise à jour du compteur
        const tableAnnu = document.getElementById('annuaire-table-body');
        document.getElementById('total-partenaires').innerText = tableAnnu.rows.length;
        
        console.log("Dossier " + id + " éliminé du système.");
    }
}