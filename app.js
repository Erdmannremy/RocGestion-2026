/* ==========================================================
   ROCGESTION V1.2 - SYSTÈME COMPLET (AJOUT / MODIF / SUPPR)
   ========================================================== */

let clientEnCoursDeModif = null; // Variable pour savoir si on modifie ou si on crée

// 1. CALCULATEUR
const RocCalculateur = {
    tauxTVA: 0.21,
    calculerTTC: function(montantHT) {
        const tva = montantHT * this.tauxTVA;
        const ttc = montantHT + tva;
        return { ht: montantHT.toFixed(2), ttc: ttc.toFixed(2) };
    }
};

// 2. NAVIGATION ET MODALE
function afficherSection(nom) {
    ['dashboard', 'clients', 'parametres'].forEach(s => document.getElementById('section-'+s).style.display = 'none');
    document.getElementById('section-' + nom).style.display = 'block';
}

function ouvrirModale(id = null) {
    const titre = document.querySelector('#modal-client h3');
    if (id) {
        // MODE MODIFICATION
        clientEnCoursDeModif = id;
        titre.innerText = "Modifier le Dossier";
        // On récupère les anciennes valeurs (en trichant un peu via le texte des cellules)
        const ligneAnnu = document.getElementById("annu-" + id);
        document.getElementById('new-client-name').value = ligneAnnu.cells[0].innerText;
        document.getElementById('new-client-sector').value = ligneAnnu.cells[1].innerText;
        document.getElementById('new-client-amount').value = parseFloat(ligneAnnu.cells[2].innerText);
    } else {
        // MODE NOUVEAU
        clientEnCoursDeModif = null;
        titre.innerText = "Nouveau Dossier";
        document.getElementById('new-client-name').value = "";
        document.getElementById('new-client-sector').value = "";
        document.getElementById('new-client-amount').value = "";
    }
    document.getElementById('modal-client').style.display = 'flex';
}

function fermerModale() {
    document.getElementById('modal-client').style.display = 'none';
}

// 3. LA FONCTION UNIQUE : VALIDER (AJOUT OU MODIF)
function validerAjoutClient() {
    const nom = document.getElementById('new-client-name').value;
    const secteur = document.getElementById('new-client-sector').value;
    const montantHT = parseFloat(document.getElementById('new-client-amount').value) || 0;

    if (nom.trim() === "") return;

    const calcul = RocCalculateur.calculerTTC(montantHT);
    const dateJour = new Date().toLocaleDateString('fr-FR');

    if (clientEnCoursDeModif) {
        // --- MISE À JOUR ---
        const rDash = document.getElementById("dash-" + clientEnCoursDeModif);
        const rAnnu = document.getElementById("annu-" + clientEnCoursDeModif);
        
        if(rDash) rDash.innerHTML = `<td style="padding:1rem;"><i class="fas fa-bolt" style="color:#fbbf24;margin-right:10px;"></i> ${nom}</td><td style="padding:1rem;color:#9ca3af;">${dateJour}</td><td style="padding:1rem;text-align:right;font-weight:bold;color:#10b981;">${calcul.ttc} €</td>`;
        
        rAnnu.innerHTML = `<td style="padding:1.2rem;font-weight:bold;color:#3b82f6;">${nom.toUpperCase()}</td><td style="padding:1.2rem;"><span style="background:#1f2937;padding:4px 10px;border-radius:4px;font-size:0.75rem;color:#9ca3af;">${secteur}</span></td><td style="padding:1.2rem;text-align:right;"><span style="margin-right:15px;">${calcul.ht} € HT</span><button onclick="ouvrirModale('${clientEnCoursDeModif}')" style="background:none;border:none;color:#3b82f6;cursor:pointer;margin-right:10px;"><i class="fas fa-edit"></i></button><button onclick="supprimerClient('${clientEnCoursDeModif}')" style="background:none;border:none;color:#ef4444;cursor:pointer;"><i class="fas fa-trash-alt"></i></button></td>`;
        
    } else {
        // --- CRÉATION ---
        const id = "client-" + Date.now();
        
        // Dashboard
        const tableDash = document.getElementById('client-table-body');
        const rowDash = document.createElement('tr');
        rowDash.id = "dash-" + id;
        rowDash.innerHTML = `<td style="padding:1rem;"><i class="fas fa-bolt" style="color:#fbbf24;margin-right:10px;"></i> ${nom}</td><td style="padding:1rem;color:#9ca3af;">${dateJour}</td><td style="padding:1rem;text-align:right;font-weight:bold;color:#10b981;">${calcul.ttc} €</td>`;
        tableDash.prepend(rowDash);

        // Annuaire
        const tableAnnu = document.getElementById('annuaire-table-body');
        const rowAnnu = document.createElement('tr');
        rowAnnu.id = "annu-" + id;
        rowAnnu.innerHTML = `<td style="padding:1.2rem;font-weight:bold;color:#3b82f6;">${nom.toUpperCase()}</td><td style="padding:1.2rem;"><span style="background:#1f2937;padding:4px 10px;border-radius:4px;font-size:0.75rem;color:#9ca3af;">${secteur}</span></td><td style="padding:1.2rem;text-align:right;"><span style="margin-right:15px;">${calcul.ht} € HT</span><button onclick="ouvrirModale('${id}')" style="background:none;border:none;color:#3b82f6;cursor:pointer;margin-right:10px;"><i class="fas fa-edit"></i></button><button onclick="supprimerClient('${id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;"><i class="fas fa-trash-alt"></i></button></td>`;
        tableAnnu.prepend(rowAnnu);
    }

    document.getElementById('total-partenaires').innerText = document.getElementById('annuaire-table-body').rows.length;
    fermerModale();
}

// --- FONCTION DE SUPPRESSION AVEC DOUBLE VÉRIFICATION ---
let idASupprimer = null; // Variable temporaire pour stocker l'ID

// 1. Appelé quand on clique sur la poubelle
function supprimerClient(id) {
    idASupprimer = id; // On mémorise quel client on veut supprimer
    document.getElementById('modal-confirm').style.display = 'flex';
}

// 2. Appelé quand on clique sur "ANNULER"
function fermerModaleConfirm() {
    idASupprimer = null;
    document.getElementById('modal-confirm').style.display = 'none';
}

// 3. Appelé quand on clique sur le bouton rouge "SUPPRIMER" de la modale
document.getElementById('btn-confirm-delete').onclick = function() {
    if (idASupprimer) {
        // Suppression réelle
        document.getElementById("dash-" + idASupprimer)?.remove();
        document.getElementById("annu-" + idASupprimer)?.remove();
        
        // Mise à jour du compteur
        const tableAnnu = document.getElementById('annuaire-table-body');
        document.getElementById('total-partenaires').innerText = tableAnnu.rows.length;
        
        console.log("Système : Dossier " + idASupprimer + " éliminé.");
        
        // On ferme et on nettoie
        fermerModaleConfirm();
    }
};