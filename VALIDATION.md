# Validation de la version 1

- 7 tests automatiques de calcul et de saisie réussis : catégories 1/2/3, conservation des zéros initiaux, âges, dates invalides, année bissextile, période collée, agents manuels, horodatage de paiement à moins 40 secondes même à minuit.
- Test complet dans Edge avec un écran mobile simulé de 390 × 844 : saisie, choix des agents, génération PDF, téléchargement et effacement du formulaire.
- Rechargement hors connexion après installation du service worker, puis deuxième génération avec des agents saisis manuellement : réussi.
- Vérification visuelle de l’interface mobile et ordinateur et du PDF produit.
- PDF : une page de 595 × 842 points, deux jeux de valeurs cohérents, absence des anciens nom et identifiants du modèle dans le texte.
- Lecture du QR généré : `08354290926`, zéros initiaux conservés.
- Exemple demandé : CAT2, du 20 au 23 septembre 2026, quantité 3, total 60 000 FCFA.

Le partage natif, l’installation et les calendriers n’ont pas été testés sur un iPhone physique. La publication GitHub Pages est à vérifier après sélection du dépôt. Les noms d’agents fournis sont inclus dans les choix du formulaire ; les données des patients ne sont pas conservées par l’application.
