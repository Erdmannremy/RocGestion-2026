/* ==========================================================
   ROCGESTION V1.7 - MASTER SYNC (JURBISE_V1)
   ========================================================== */

let clientEnCoursDeModif = null; 
let idASupprimer = null;         

// 1. CALCULATEUR FISCAL (Normes Belges)
function mettreAJourChiffreAffaires() {
    const tableAnnu = document.getElementById('annuaire-table-body');
    let totalHT = 0;

    // On scanne l'annuaire pour obtenir le montant réel HT
    for (let i = 0; i < tableAnnu.rows.length; i++) {
        const montantTexte = tableAnnu.rows[i].cells[2].innerText;
        const montantNum = parseFloat(montantTexte) || 0;
        totalHT += montantNum;
    }

    // --- CALCUL DES TAXES (Estimation 45% : Cotisations + IPP) ---
    const tauxChargeGlobal = 0.45; 
    const montantCharges = totalHT * tauxChargeGlobal;
    const montantNet = totalHT - montantCharges;

    // --- MISE À JOUR DE L'INTERFACE ---
    const format = (num) => num.toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

    const elCA = document.getElementById('total-ca-display');
    const elCharges = document.getElementById('total-charges-display');
    const elNet = document.getElementById('total-net-display');

    if (elCA) elCA.innerText = format(totalHT);
    if (elCharges) elCharges.innerText = "-" + format(montantCharges);
    if (elNet) elNet.innerText = format(montantNet);

    console.log(`Sync Fiscale : Brut ${totalHT}€ | Net ${montantNet}€`);
}

// 2. NAVIGATION
function afficherSection(nom) {
    const sections = ['dashboard', 'clients', 'parametres'];
    sections.forEach(s => {
        const el = document.getElementById('section-' + s);
        if (el) el.style.display = 'none';
    });
    document.getElementById('section-' + nom).style.display = 'block';
}

// 3. GESTION DES MODALES
function ouvrirModale(id = null) {
    clientEnCoursDeModif = id; 
    const titre = document.querySelector('#modal-client h3');
    const inputTVA = document.getElementById('new-client-tva');
    
    // On récupère le taux par défaut des paramètres au cas où c'est un nouveau dossier
    const tvaDefaut = document.getElementById('param-tva').value || 21;

    if (id) {
        titre.innerText = "MODIFIER LE DOSSIER";
        const ligneAnnu = document.getElementById("annu-" + id);
        document.getElementById('new-client-name').value = ligneAnnu.cells[0].innerText;
        document.getElementById('new-client-sector').value = ligneAnnu.cells[1].innerText;
        document.getElementById('new-client-amount').value = parseFloat(ligneAnnu.cells[2].innerText);
        
        // On récupère le taux TVA qui était stocké dans un attribut "data" (voir étape suivante)
        inputTVA.value = ligneAnnu.getAttribute('data-tva') || tvaDefaut;
    } else {
        titre.innerText = "NOUVEAU DOSSIER";
        document.getElementById('new-client-name').value = "";
        document.getElementById('new-client-sector').value = "";
        document.getElementById('new-client-amount').value = "";
        inputTVA.value = tvaDefaut; // On remet le taux par défaut
    }
    document.getElementById('modal-client').style.display = 'flex';
}

function fermerModale() {
    document.getElementById('modal-client').style.display = 'none';
}

// 4. SUPPRESSION SÉCURISÉE
function supprimerClient(id) {
    idASupprimer = id; 
    document.getElementById('modal-confirm').style.display = 'flex';
}

function fermerModaleConfirm() {
    document.getElementById('modal-confirm').style.display = 'none';
    idASupprimer = null;
}

function confirmerSuppression() {
    if (idASupprimer) {
        const d = document.getElementById("dash-" + idASupprimer);
        const a = document.getElementById("annu-" + idASupprimer);
        if(d) d.remove();
        if(a) a.remove();
        
        // Refresh des chiffres
        mettreAJourChiffreAffaires();
        document.getElementById('total-partenaires').innerText = document.getElementById('annuaire-table-body').rows.length;
        
        fermerModaleConfirm();
    }
}

// 5. ENREGISTREMENT CENTRALISÉ
function validerAjoutClient() {
    const nom = document.getElementById('new-client-name').value;
    const secteur = document.getElementById('new-client-sector').value;
    const montantHT = parseFloat(document.getElementById('new-client-amount').value) || 0;
    const tauxTVA = parseFloat(document.getElementById('new-client-tva').value) || 0;

    if (nom.trim() === "") return;

    const calculTVA = montantHT * (tauxTVA / 100);
    const ttc = (montantHT + calculTVA).toFixed(2);
    const ht = montantHT.toFixed(2);
    const date = new Date().toLocaleDateString('fr-FR');

    const contenuHTML_Annu = (id) => `
        <td style="padding:1.2rem;font-weight:bold;color:#3b82f6;">${nom.toUpperCase()}</td>
        <td style="padding:1.2rem;"><span style="background:#1f2937;padding:4px 10px;border-radius:4px;font-size:0.75rem;color:#9ca3af;">${secteur}</span></td>
        <td style="padding:1.2rem;text-align:right;">
            <span style="font-size:0.7rem; color:#4b5563; margin-right:5px;">(${tauxTVA}%)</span>
            <span style="margin-right:15px;">${ht} € HT</span>
            <button onclick="ouvrirModale('${id}')" style="background:none;border:none;color:#3b82f6;cursor:pointer;margin-right:10px;"><i class="fas fa-edit"></i></button>
            <button onclick="supprimerClient('${id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
        </td>`;

    const contenuHTML_Dash = `
        <td style="padding:1rem;"><i class="fas fa-bolt" style="color:#fbbf24;margin-right:10px;"></i> ${nom}</td>
        <td style="padding:1rem;color:#9ca3af;">${date}</td>
        <td style="padding:1rem;text-align:right;font-weight:bold;color:#10b981;">${ttc} €</td>`;

    if (clientEnCoursDeModif) {
        const id = clientEnCoursDeModif;
        const rAnnu = document.getElementById("annu-" + id);
        const rDash = document.getElementById("dash-" + id);
        if(rAnnu) {
            rAnnu.innerHTML = contenuHTML_Annu(id);
            rAnnu.setAttribute('data-tva', tauxTVA); // On stocke la TVA pour la future modif
        }
        if(rDash) rDash.innerHTML = contenuHTML_Dash;
    } else {
        const id = "ID" + Date.now();
        const rowAnnu = document.createElement('tr');
        rowAnnu.id = "annu-" + id;
        rowAnnu.setAttribute('data-tva', tauxTVA); // Stockage important
        rowAnnu.innerHTML = contenuHTML_Annu(id);
        document.getElementById('annuaire-table-body').prepend(rowAnnu);

        const rowDash = document.createElement('tr');
        rowDash.id = "dash-" + id;
        rowDash.innerHTML = contenuHTML_Dash;
        document.getElementById('client-table-body').prepend(rowDash);
    }
    
    mettreAJourChiffreAffaires();
    document.getElementById('total-partenaires').innerText = document.getElementById('annuaire-table-body').rows.length;
    fermerModale();
}
// --- FONCTION DU POINT 1 & 2 : SAUVEGARDE RÉGLAGES ---
function sauvegarderParametres() {
    const nouveauNom = document.getElementById('param-entreprise').value;
    // Mise à jour du nom dans la barre latérale
    document.querySelector('h1').innerHTML = `<i class="fas fa-gem" style="color: #3b82f6; margin-right: 12px;"></i> ${nouveauNom.toUpperCase()}`;
    
    // On relance le calcul du CA avec les nouveaux taux (le calcul utilisera les valeurs des inputs)
    mettreAJourChiffreAffaires();
    alert("Paramètres mis à jour avec succès !");
}

// --- MODIFICATION DE LA FONCTION DE CALCUL POUR UTILISER LES PARAMÈTRES ---
// Remplace ton ancienne fonction mettreAJourChiffreAffaires par celle-ci :
function mettreAJourChiffreAffaires() {
    const tableAnnu = document.getElementById('annuaire-table-body');
    let totalHT = 0;

    // Récupération dynamique du taux de taxe depuis les paramètres
    const tauxTaxeParam = parseFloat(document.getElementById('param-taxe').value) / 100 || 0.45;

    for (let i = 0; i < tableAnnu.rows.length; i++) {
        const montantTexte = tableAnnu.rows[i].cells[2].innerText;
        const montantNum = parseFloat(montantTexte) || 0;
        totalHT += montantNum;
    }

    const montantCharges = totalHT * tauxTaxeParam;
    const montantNet = totalHT - montantCharges;

    const format = (num) => num.toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

    document.getElementById('total-ca-display').innerText = format(totalHT);
    document.getElementById('total-charges-display').innerText = "-" + format(montantCharges);
    document.getElementById('total-net-display').innerText = format(montantNet);
    
    // Mise à jour du texte de légende sous la carte charges
    document.querySelector('#total-charges-display + p').innerText = `Cotisations + Impôts (${(tauxTaxeParam*100).toFixed(0)}%)`;
}

// --- POINT 3 : EXPORT CSV AMÉLIORÉ (AVEC DÉTAILS TVA) ---
function exportCSV() {
    // Récupération des taux actuels définis dans tes paramètres
    const tauxTVA = parseFloat(document.getElementById('param-tva').value) || 21;
    const ratioTVA = tauxTVA / 100;

    // En-têtes du CSV (avec séparateur point-virgule pour Excel)
    let csv = "Client;Secteur;Montant HT;% TVA;Montant TVA;Montant TVAC\n";
    
    const rows = document.querySelectorAll("#annuaire-table-body tr");
    
    let totalHT = 0;
    let totalTVA = 0;
    let totalTVAC = 0;

    rows.forEach(row => {
        const nom = row.cells[0].innerText;
        const secteur = row.cells[1].innerText;
        // On récupère le montant HT et on nettoie le texte pour n'avoir que le nombre
        const montantHT = parseFloat(row.cells[2].innerText) || 0;
        
        // Calculs pour la ligne
        const montantTVA = montantHT * ratioTVA;
        const montantTVAC = montantHT + montantTVA;

        // Cumul pour le total final
        totalHT += montantHT;
        totalTVA += montantTVA;
        totalTVAC += montantTVAC;

        // Ajout de la ligne au CSV (formatage avec virgule pour les décimales si besoin)
        csv += `${nom};${secteur};${montantHT.toFixed(2)};${tauxTVA}%;${montantTVA.toFixed(2)};${montantTVAC.toFixed(2)}\n`;
    });

    // Ajout d'une ligne vide pour la lisibilité
    csv += "\n";
    
    // Ajout de la ligne des TOTAUX
    csv += `TOTAL GLOBAL;;${totalHT.toFixed(2)};;${totalTVA.toFixed(2)};${totalTVAC.toFixed(2)}\n`;

    // Création et téléchargement du fichier
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' }); // \ufeff pour forcer l'UTF-8 sur Excel
    const link = document.createElement("a");
    const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
    
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `RocGestion_Export_${date}.csv`);
    link.click();
    
    console.log("Export CSV généré avec succès.");
}

function effacerTout() {
    if(confirm("Rémy, attention : voulez-vous vraiment effacer TOUS les clients pour la nouvelle année ?")) {
        document.getElementById('annuaire-table-body').innerHTML = "";
        document.getElementById('client-table-body').innerHTML = "";
        mettreAJourChiffreAffaires();
        document.getElementById('total-partenaires').innerText = "0";
    }
}

// --- POINT 4 : PERSONNALISATION COULEUR ---
function changerCouleur(code) {
    const elements = document.querySelectorAll('.fa-gem, .fa-chart-line, #total-ca-display');
    elements.forEach(el => el.style.color = code);
    document.querySelector('button[onclick="validerAjoutClient()"]').style.background = code;
}