# Collection Carbone — site et programme de test

Le site de Collection Carbone (innovation numérique) : présentation, logiciels à tester, contact.
Il est statique et hébergé gratuitement par GitHub Pages ; les fichiers à télécharger vivent dans les
« Releases » du dépôt (jusqu'à 2 Go par fichier).

## Les fichiers

- `index.html` : le site (solutions, logiciels à tester, installation, contact).
- `apps.json` : la liste des logiciels à tester. Le site la lit ; le tableau de bord l'écrit.
- `admin.html` : le tableau de bord, pour ajouter, modifier, ouvrir, fermer ou masquer un logiciel.
- `assets/config.js` : le dépôt GitHub et les contacts (WhatsApp, e-mail, TikTok, LinkedIn, GitHub).

## Ajouter un logiciel à tester

1. Préparer une version d'essai qui n'ouvre que les parties à tester. Pour Carbone Espaces :
   `scripts\build-espaces.ps1 -Version 0.8.0 -Essai "photo,graphisme,motion,montage,son,3d"`
   donne `dist\Carbone-Espaces-Essai-0.8.0-windows-x64.zip`.
2. Ouvrir `https://trinity667.github.io/collection-carbone/admin.html`, se connecter avec un jeton
   GitHub (permission Contents : Read and write sur ce dépôt seulement), « Ajouter un logiciel ».
3. Le fichier part dans une Release, la fiche dans `apps.json`. Le site se met à jour en une à deux minutes.

Le guide complet est en bas du tableau de bord.

## Ce que voit un testeur

Le site, la fiche du logiciel et le bouton « Télécharger l'essai ». Dans le logiciel d'essai, seules
les parties ouvertes, avec le badge « Version d'essai · Collection Carbone ». Le tableau de bord ne
peut rien modifier sans le jeton du propriétaire.

## Limite

Une version d'essai contient le programme sur l'ordinateur du testeur : la limite des parties est
une barrière d'usage, pas un verrou impossible à contourner pour quelqu'un de très technique.
