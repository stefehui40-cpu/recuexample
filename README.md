# Reçus · Gynécologie

Application statique pour iPhone et navigateur. Le PDF est généré localement, en une page de 595 × 842 points, avec deux exemplaires et des tableaux de dimensions identiques. Aucune donnée saisie n’est envoyée à un serveur, stockée dans localStorage ou conservée dans un historique. Le PDF reste en mémoire jusqu’au départ de la page, à son effacement ou à son remplacement.

## Saisie

1. Zone texte unique : `KONE SALI 08354290926 CAT2 33ans 456283902`. Le bouton Générer interprète les cinq informations. Options repliées pour le sexe et l’âge.
2. Zone texte pour la période, avec calendriers accessibles à la demande : `20/09/2026 au 23/09/2026`.
3. Agent d’enregistrement : liste ou saisie libre.
4. Agent d’encaissement : liste ou saisie libre.

Quantité = nombre de jours entre entrée et sortie. La sortie doit être strictement postérieure à l’entrée. CAT3 = 10 000 FCFA/jour, CAT2 = 20 000, CAT1 = 30 000. Total = durée × prix ; montant reçu = total ; monnaie = 0. Horodatage à la génération, fuseau Africa/Abidjan ; paiement 40 secondes avant émission. QR numérique contenant uniquement le numéro du reçu, zéros initiaux conservés. Âge 12–70, 0 mois et 0 jour fixes. F par défaut, choix F/M.

La génération efface le formulaire uniquement après réussite. En cas d’erreur les valeurs restent disponibles. Les textes trop longs pour le modèle provoquent une erreur plutôt qu’un débordement.

## iPhone et hors connexion

Ouvrir le site HTTPS dans Safari et ajouter à l’écran d’accueil depuis le menu de partage. Attendre « Disponible hors connexion » après la première visite connectée. Le navigateur peut évincer son cache ; une nouvelle ouverture connectée rétablit les ressources. Partager le PDF via le bouton dédié si l’appareil le permet, ou télécharger/ouvrir le fichier puis le partager. La compatibilité avec un iPhone physique doit être confirmée sur l’appareil cible.

## Développement et publication

Node 22 ou ultérieur. Aucune installation de paquet nécessaire.

```sh
node serve.mjs
node --test core.test.mjs
```

Le site fonctionne à la racine ou dans un sous-dossier GitHub Pages. Dans GitHub : Settings → Pages → Source → Deploy from a branch → main → /(root). Les fichiers sont disposés à la racine pour permettre une publication sans étape de compilation. Un dépôt privé peut nécessiter une offre GitHub compatible avec Pages ; le site Pages peut être public même si son dépôt est privé. Le formulaire ne contient aucun vrai dossier prérempli.

## Modèle et ressources

Le fond est une image à 300 dpi préparée à partir du prototype approuvé, débarrassée des champs variables et QR d’origine. Les données et le nouveau QR sont ajoutés dans le PDF comme éléments vectoriels. Les PDF sources d’origine et leurs données cachées ne font pas partie du projet. Police Mona Sans (OFL), adaptée pour reproduire le « a » validé. Bibliothèques embarquées : pdf-lib, fontkit, qrcode-generator. Aucun CDN n’est contacté à l’utilisation. Voir les licences incluses.

Après une modification des ressources, changer la version du cache dans `sw.js`. Fermer les anciennes fenêtres de l’application pour activer la mise à jour.
