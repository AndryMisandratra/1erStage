import React, { useState } from 'react';
import axios from 'axios';

const NouvelArrivant = () => {
  const [form, setForm] = useState({
    Nom: '', Prenom: '', Corps: '', Attribution: '', Genre: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/employes', {
        ...form, IdDiv: user.IdDiv
      });
      alert('Employé ajouté');
      setForm({ Nom: '', Prenom: '', Corps: '', Attribution: '', Genre: '' });
    } catch (err) {
      console.error(err);
      alert('Erreur création employé');
    }
  };

  return (
    <div className="form-container">
      <h2>Ajouter Nouvel Employé</h2>
      <form onSubmit={handleSubmit}>
        {['Nom', 'Prenom', 'Corps', 'Attribution', 'Genre'].map(field => (
          <div key={field}>
            <label>{field}:</label>
            <input name={field} value={form[field]} onChange={handleChange} required />
          </div>
        ))}
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default NouvelArrivant;
