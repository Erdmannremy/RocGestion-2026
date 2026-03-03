/* ==========================================================
   ROCGESTION V1.6 - CALCULATEUR DE CA SYNCHRONISÉ
   ========================================================== */

let clientEnCoursDeModif = null; 
let idASupprimer = null;         

// 1. CALCULATEUR DE CA (LA NOUVELLE FONCTION)
function mettreAJourChiffreAffaires() {
    const tableAnnu = document.getElementById('annuaire-table-body');
    let totalHT = 0;

    // On scanne l'annuaire car c'est là que se trouve la base de données propre
    for (let i = 0; i < tableAnnu.rows.length; i++) {
        // On récupère le montant HT (cellule index 2 dans l'annuaire)
        const montantTexte = tableAnnu.rows[i].cells[2].innerText;
        
        // On extrait uniquement les chiffres (on enlève "€ HT")
        const montantNum = parseFloat(montantTexte) || 0;
        totalHT += montantNum;
    }

    // Affichage du Chiffre d'Affaires RÉEL (Hors TVA)
    const afficheur = document.getElementById('total-ca-display');
    if (afficheur) {
        // Formatage propre : 2.500,00 €
        afficheur.innerText = totalHT.toLocaleString('fr-BE', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        }) + " € HT";
        
        // Petit bonus visuel : on change la couleur pour confirmer que c'est du HT
        afficheur.style.color = "#3b82f6"; // Bleu pro au lieu du vert "cash encaissé"
    }
    
    console.log("Calcul CA : " + totalHT + "€ HT (TVA exclue)");
}

// 2. NAVIGATION
function afficherSection(nom) {
    document.getElementById('section-dashboard').style.display = 'none';
    document.getElementById('section-clients').style.display = 'none';
    document.getElementById('section-parametres').style.display = 'none';
    document.getElementById('section-' + nom).style.display = 'block';
}

// 3. MODALES
function ouvrirModale(id = null) {
    clientEnCoursDeModif = id; 
    const titre = document.querySelector('#modal-client h3');
    if (id) {
        titre.innerText = "MODIFIER LE DOSSIER";
        const ligneAnnu = document.getElementById("annu-" + id);
        document.getElementById('new-client-name').value = ligneAnnu.cells[0].innerText;
        document.getElementById('new-client-sector').value = ligneAnnu.cells[1].innerText;
        document.getElementById('new-client-amount').value = parseFloat(ligneAnnu.cells[2].innerText);
    } else {
        titre.innerText = "NOUVEAU DOSSIER";
        document.getElementById('new-client-name').value = "";
        document.getElementById('new-client-sector').value = "";
        document.getElementById('new-client-amount').value = "";
    }
    document.getElementById('modal-client').style.display = 'flex';
}

function fermerModale() {
    document.getElementById('modal-client').style.display = 'none';
}

// 4. SUPPRESSION
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
        document.getElementById("dash-" + idASupprimer)?.remove();
        document.getElementById("annu-" + idASupprimer)?.remove();
        
        // RECALCUL APRÈS SUPPRESSION
        mettreAJourChiffreAffaires();
        document.getElementById('total-partenaires').innerText = document.getElementById('annuaire-table-body').rows.length;
        
        fermerModaleConfirm();
    }
}

// 5. ENREGISTREMENT & SYNCHRO
function validerAjoutClient() {
    const nom = document.getElementById('new-client-name').value;
    const secteur = document.getElementById('new-client-sector').value;
    const montantHT = parseFloat(document.getElementById('new-client-amount').value) || 0;

    if (nom.trim() === "") return;

    const ht = montantHT.toFixed(2);
    const ttc = (montantHT * 1.21).toFixed(2);
    const date = new Date().toLocaleDateString('fr-FR');

    if (clientEnCoursDeModif) {
        const id = clientEnCoursDeModif;
        const rDash = document.getElementById("dash-" + id);
        const rAnnu = document.getElementById("annu-" + id);
        
        if(rDash) rDash.innerHTML = `<td style="padding:1rem;"><i class="fas fa-bolt" style="color:#fbbf24;margin-right:10px;"></i> ${nom}</td><td style="padding:1rem;color:#9ca3af;">${date}</td><td style="padding:1rem;text-align:right;font-weight:bold;color:#10b981;">${ttc} €</td>`;
        if(rAnnu) rAnnu.innerHTML = `<td style="padding:1.2rem;font-weight:bold;color:#3b82f6;">${nom.toUpperCase()}</td><td style="padding:1.2rem;"><span style="background:#1f2937;padding:4px 10px;border-radius:4px;font-size:0.75rem;color:#9ca3af;">${secteur}</span></td><td style="padding:1.2rem;text-align:right;"><span style="margin-right:15px;">${ht} € HT</span><button onclick="ouvrirModale('${id}')" style="background:none;border:none;color:#3b82f6;cursor:pointer;margin-right:10px;"><i class="fas fa-edit"></i></button><button onclick="supprimerClient('${id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;"><i class="fas fa-trash-alt"></i></button></td>`;
    } else {
        const id = "ID" + Date.now();
        const rowAnnu = document.createElement('tr');
        rowAnnu.id = "annu-" + id;
        rowAnnu.innerHTML = `<td style="padding:1.2rem;font-weight:bold;color:#3b82f6;">${nom.toUpperCase()}</td><td style="padding:1.2rem;"><span style="background:#1f2937;padding:4px 10px;border-radius:4px;font-size:0.75rem;color:#9ca3af;">${secteur}</span></td><td style="padding:1.2rem;text-align:right;"><span style="margin-right:15px;">${ht} € HT</span><button onclick="ouvrirModale('${id}')" style="background:none;border:none;color:#3b82f6;cursor:pointer;margin-right:10px;"><i class="fas fa-edit"></i></button><button onclick="supprimerClient('${id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;"><i class="fas fa-trash-alt"></i></button></td>`;
        document.getElementById('annuaire-table-body').prepend(rowAnnu);

        const rowDash = document.createElement('tr');
        rowDash.id = "dash-" + id;
        rowDash.innerHTML = `<td style="padding:1rem;"><i class="fas fa-bolt" style="color:#fbbf24;margin-right:10px;"></i> ${nom}</td><td style="padding:1rem;color:#9ca3af;">${date}</td><td style="padding:1rem;text-align:right;font-weight:bold;color:#10b981;">${ttc} €</td>`;
        document.getElementById('client-table-body').prepend(rowDash);
    }
    
    // RECALCUL ET MISE À JOUR COMPTEUR
    mettreAJourChiffreAffaires();
    document.getElementById('total-partenaires').innerText = document.getElementById('annuaire-table-body').rows.length;
    fermerModale();
}