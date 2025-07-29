import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Personnel.css";

const Personnel = () => {
  const [employes, setEmployes] = useState([]);
  const [form, setForm] = useState({
    matricule: "",
    nom: "",
    prenom: "",
    corps: "",
    attribution: "",
    genre: "Homme",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [matriculeEditing, setMatriculeEditing] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const idDiv = user?.idDiv;

  useEffect(() => {
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/employers/division/${idDiv}`);
      setEmployes(res.data);
    } catch (err) {
      console.error("Erreur chargement employés :", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/employers/${matriculeEditing}`, {
          ...form,
          idDiv,
        });
        alert("Employé modifié !");
      } else {
        await axios.post("http://localhost:5000/api/employers", {
          ...form,
          idDiv,
        });
        alert("Employé ajouté !");
      }
      setForm({
        matricule: "",
        nom: "",
        prenom: "",
        corps: "",
        attribution: "",
        genre: "Homme",
      });
      setIsEditing(false);
      setMatriculeEditing(null);
      fetchEmployes();
    } catch (err) {
      console.error("Erreur enregistrement :", err);
      alert("Erreur lors de la soumission");
    }
  };

  const handleEdit = (employe) => {
    setIsEditing(true);
    setMatriculeEditing(employe.Matricule);
    setForm({
      matricule: employe.Matricule,
      nom: employe.Nom,
      prenom: employe.Prenom,
      corps: employe.Corps,
      attribution: employe.Attribution,
      genre: employe.Genre,
    });
  };

  const handleDelete = async (matricule) => {
    if (!window.confirm("Supprimer cet employé ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/employers/${matricule}`);
      fetchEmployes();
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  return (
    <div className="personnel-container">
      <h2>Personnel de votre division</h2>

      <form onSubmit={handleSubmit} className="personnel-form">
        <input
          type="number"
          name="matricule"
          placeholder="Matricule"
          value={form.matricule}
          onChange={handleChange}
          disabled={isEditing}
          required
        />
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={form.nom}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          value={form.prenom}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="corps"
          placeholder="Corps"
          value={form.corps}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="attribution"
          placeholder="Attribution"
          value={form.attribution}
          onChange={handleChange}
          required
        />
        <select name="genre" value={form.genre} onChange={handleChange}>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>
        <button type="submit">{isEditing ? "Modifier" : "Ajouter"}</button>
      </form>

      <table className="personnel-table">
        <thead>
          <tr>
            <th>Matricule</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Corps</th>
            <th>Attribution</th>
            <th>Genre</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employes.map((emp) => (
            <tr key={emp.Matricule}>
              <td>{emp.Matricule}</td>
              <td>{emp.Nom}</td>
              <td>{emp.Prenom}</td>
              <td>{emp.Corps}</td>
              <td>{emp.Attribution}</td>
              <td>{emp.Genre}</td>
              <td>
                <button onClick={() => handleEdit(emp)}>Modifier</button>
                <button onClick={() => handleDelete(emp.Matricule)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Personnel;
