-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 21 juil. 2025 à 12:48
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
  `CheminDem` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(318951, 'Solofotian', 'RANDRIANANTENAINA', 'Solofotiana', 'MAGISTRAT', 'Président', 'Homme', 1, 'admin'),
(319050, 'HasinaGC', 'RANDRIANIRINA', ' Hasina', 'GREFFIER DES SERVICES JUDICIAIRES', 'Greffier en Chef', 'Homme', 1, 'Employer'),
(326707, 'Andriamiha', 'RAJAONA ', 'Andriamihaja', 'MAGISTRAT', 'Commissaire Financier', 'Femme', 2, 'admin'),
(344387, 'AndoC', 'RAHARISON ', 'Ando Harilalaina', 'MAGISTRAT', 'Conseiller', 'Homme', 1, 'employer'),
(424720, 'Erika', 'RAMANANJATOVO ', 'Maminirina Eric', 'MAGISTRAT', 'Substitut', 'Homme', 2, 'employer');

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
  `Matricule` int(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `permission`
--

INSERT INTO `permission` (`IdP`, `TypeP`, `NbrjP`, `DateDemPerm`, `DebP`, `FinP`, `Motif`, `LienPerm`, `StatueP`, `Matricule`) VALUES
(1, 'Permission d\'absence', 3, '2025-07-21', '2025-07-23', '2025-07-25', 'familiale', '/uploads/1753081354605-demande_permission_319050 (6).pdf', 'En attente', 319050);

-- --------------------------------------------------------

--
-- Structure de la table `titre`
--

CREATE TABLE `titre` (
  `NumDesc` int(3) NOT NULL,
  `NbrAnne` int(1) NOT NULL,
  `DC` int(3) NOT NULL,
  `CP` int(2) NOT NULL,
  `Reliquat` int(2) NOT NULL,
  `CheminTitre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utiliser`
--

CREATE TABLE `utiliser` (
  `IdC` int(3) NOT NULL,
  `NumDesc` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Index pour la table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`IdP`),
  ADD KEY `Matricule` (`Matricule`);

--
-- Index pour la table `titre`
--
ALTER TABLE `titre`
  ADD PRIMARY KEY (`NumDesc`);

--
-- Index pour la table `utiliser`
--
ALTER TABLE `utiliser`
  ADD KEY `IdC` (`IdC`),
  ADD KEY `NumDesc` (`NumDesc`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `conge`
--
ALTER TABLE `conge`
  MODIFY `IdC` int(3) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `division`
--
ALTER TABLE `division`
  MODIFY `IdDiv` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `permission`
--
ALTER TABLE `permission`
  MODIFY `IdP` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- Contraintes pour la table `permission`
--
ALTER TABLE `permission`
  ADD CONSTRAINT `permission_ibfk_1` FOREIGN KEY (`Matricule`) REFERENCES `employer` (`Matricule`);

--
-- Contraintes pour la table `utiliser`
--
ALTER TABLE `utiliser`
  ADD CONSTRAINT `utiliser_ibfk_1` FOREIGN KEY (`IdC`) REFERENCES `conge` (`IdC`),
  ADD CONSTRAINT `utiliser_ibfk_2` FOREIGN KEY (`NumDesc`) REFERENCES `titre` (`NumDesc`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
