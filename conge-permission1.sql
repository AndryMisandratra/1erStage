-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 19 août 2025 à 11:00
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `conge-permission`
--

-- --------------------------------------------------------

--
-- Structure de la table `conge`
--

CREATE TABLE `conge` (
  `IdC` int(3) NOT NULL,
  `TypeC` char(20) NOT NULL,
  `DateDemCong` date NOT NULL,
  `DebC` date NOT NULL,
  `FinC` date NOT NULL,
  `TotalCP` int(2) DEFAULT NULL,
  `StatueC` char(20) NOT NULL,
  `Matricule` int(6) NOT NULL,
  `CheminDem` varchar(100) NOT NULL,
  `ObservationCong` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `conge`
--

INSERT INTO `conge` (`IdC`, `TypeC`, `DateDemCong`, `DebC`, `FinC`, `TotalCP`, `StatueC`, `Matricule`, `CheminDem`, `ObservationCong`) VALUES
(15, 'Maladie', '2025-08-18', '2025-08-25', '2025-08-29', 5, 'Accepter', 319050, '/uploads/demandes/1755544921545-demande_conge_319050 (3).pdf', NULL),
(16, 'Annuel', '2025-08-18', '2025-09-01', '2025-09-05', 5, 'En attente', 319050, '/uploads/demandes/1755556138333-demande_congÃ©_319050_19_08_2025.pdf', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `division`
--

CREATE TABLE `division` (
  `IdDiv` int(1) NOT NULL,
  `Libelle` char(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `division`
--

INSERT INTO `division` (`IdDiv`, `Libelle`) VALUES
(1, 'Siege'),
(2, 'Parquet');

-- --------------------------------------------------------

--
-- Structure de la table `employer`
--

CREATE TABLE `employer` (
  `Matricule` int(6) NOT NULL,
  `NomUtil` varchar(10) NOT NULL,
  `Nom` varchar(50) NOT NULL,
  `Prenom` varchar(60) NOT NULL,
  `Corps` varchar(50) NOT NULL,
  `Attribution` varchar(50) NOT NULL,
  `Genre` char(5) NOT NULL,
  `IdDiv` int(6) NOT NULL,
  `Mdp` char(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `employer`
--

INSERT INTO `employer` (`Matricule`, `NomUtil`, `Nom`, `Prenom`, `Corps`, `Attribution`, `Genre`, `IdDiv`, `Mdp`) VALUES
(318951, 'Solofotian', 'RANDRIANANTENAINA', 'Solofotiana', 'MAGISTRAT', 'PRESIDENT', 'Homme', 1, 'admin'),
(319050, 'HasinaGC', 'RANDRIANIRINA', ' Hasina', 'GREFFIER DES SERVICES JUDICIERE', 'GREFFIER EN CHEF', 'Homme', 1, 'employer'),
(326707, 'Andriamiha', 'RAJAONA ', 'Andriamihaja', 'MAGISTRAT', 'COMMISSAIRE FINANCIER', 'Femme', 2, 'admin'),
(424720, 'Erika', 'RAMANANJATOVO ', 'Maminirina Eric', 'MAGISTRAT', 'Substitut', 'Homme', 2, 'employer');

-- --------------------------------------------------------

--
-- Structure de la table `ordonnance`
--

CREATE TABLE `ordonnance` (
  `IdOrd` int(3) NOT NULL,
  `CheminOrd` varchar(100) NOT NULL,
  `IdC` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `ordonnance`
--

INSERT INTO `ordonnance` (`IdOrd`, `CheminOrd`, `IdC`) VALUES
(1, '/uploads/ordonnances/1755544934954-demande_permission_424720_17_08_2025 (3).pdf', 15);

-- --------------------------------------------------------

--
-- Structure de la table `permission`
--

CREATE TABLE `permission` (
  `IdP` int(3) NOT NULL,
  `TypeP` char(20) NOT NULL,
  `NbrjP` int(2) NOT NULL,
  `DateDemPerm` date NOT NULL,
  `DebP` date NOT NULL,
  `FinP` date NOT NULL,
  `Motif` varchar(100) DEFAULT NULL,
  `LienPerm` varchar(100) NOT NULL,
  `StatueP` char(20) NOT NULL,
  `ObservationPerm` varchar(150) DEFAULT NULL,
  `Matricule` int(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `titre`
--

CREATE TABLE `titre` (
  `IdTitre` int(3) NOT NULL,
  `CheminTitre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `titre`
--

INSERT INTO `titre` (`IdTitre`, `CheminTitre`) VALUES
(8, '/uploads/titres/1755556144459-demande_congÃ©_319050_ (3).pdf');

-- --------------------------------------------------------

--
-- Structure de la table `utiliser`
--

CREATE TABLE `utiliser` (
  `IdTitre` int(3) NOT NULL,
  `IdC` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utiliser`
--

INSERT INTO `utiliser` (`IdTitre`, `IdC`) VALUES
(8, 16);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `conge`
--
ALTER TABLE `conge`
  ADD PRIMARY KEY (`IdC`),
  ADD KEY `Matricule` (`Matricule`);

--
-- Index pour la table `division`
--
ALTER TABLE `division`
  ADD PRIMARY KEY (`IdDiv`);

--
-- Index pour la table `employer`
--
ALTER TABLE `employer`
  ADD PRIMARY KEY (`Matricule`),
  ADD KEY `IdDiv` (`IdDiv`);

--
-- Index pour la table `ordonnance`
--
ALTER TABLE `ordonnance`
  ADD PRIMARY KEY (`IdOrd`),
  ADD KEY `IdC` (`IdC`);

--
-- Index pour la table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`IdP`),
  ADD KEY `Matricule` (`Matricule`);

--
-- Index pour la table `titre`
--
ALTER TABLE `titre`
  ADD PRIMARY KEY (`IdTitre`);

--
-- Index pour la table `utiliser`
--
ALTER TABLE `utiliser`
  ADD KEY `IdTitre` (`IdTitre`),
  ADD KEY `IdC` (`IdC`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `conge`
--
ALTER TABLE `conge`
  MODIFY `IdC` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `division`
--
ALTER TABLE `division`
  MODIFY `IdDiv` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `ordonnance`
--
ALTER TABLE `ordonnance`
  MODIFY `IdOrd` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `permission`
--
ALTER TABLE `permission`
  MODIFY `IdP` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `titre`
--
ALTER TABLE `titre`
  MODIFY `IdTitre` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `conge`
--
ALTER TABLE `conge`
  ADD CONSTRAINT `conge_ibfk_1` FOREIGN KEY (`Matricule`) REFERENCES `employer` (`Matricule`);

--
-- Contraintes pour la table `employer`
--
ALTER TABLE `employer`
  ADD CONSTRAINT `employer_ibfk_1` FOREIGN KEY (`IdDiv`) REFERENCES `division` (`IdDiv`);

--
-- Contraintes pour la table `ordonnance`
--
ALTER TABLE `ordonnance`
  ADD CONSTRAINT `ordonnance_ibfk_1` FOREIGN KEY (`IdC`) REFERENCES `conge` (`IdC`);

--
-- Contraintes pour la table `permission`
--
ALTER TABLE `permission`
  ADD CONSTRAINT `permission_ibfk_1` FOREIGN KEY (`Matricule`) REFERENCES `employer` (`Matricule`);

--
-- Contraintes pour la table `utiliser`
--
ALTER TABLE `utiliser`
  ADD CONSTRAINT `utiliser_ibfk_1` FOREIGN KEY (`IdTitre`) REFERENCES `titre` (`IdTitre`),
  ADD CONSTRAINT `utiliser_ibfk_2` FOREIGN KEY (`IdC`) REFERENCES `conge` (`IdC`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
