import { useEffect, useState } from 'react';
import { supabase } from './supabase';

function Clients() {
  const [clients, setClients] = useState([]);
  const [coach, setCoach] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: coachData } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', user.id)
      .single();
    setCoach(coachData);

    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false });

    setClients(clientsData || []);
  }

  async function updateClientStatus(clientId, newStatus) {
    const { error } = await supabase
      .from('clients')
      .update({ status: newStatus })
      .eq('id', clientId);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert(`✅ Client ${newStatus.toLowerCase()}!`);
      loadData();
    }
  }

  const filteredClients = clients.filter(c => c.status === activeTab);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>👥 Manage Clients</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('PENDING')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            background: activeTab === 'PENDING' ? '#4CAF50' : '#ddd',
            color: activeTab === 'PENDING' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Pending Requests ({clients.filter(c => c.status === 'PENDING').length})
        </button>
        <button 
          onClick={() => setActiveTab('APPROVED')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            background: activeTab === 'APPROVED' ? '#4CAF50' : '#ddd',
            color: activeTab === 'APPROVED' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Approved Clients ({clients.filter(c => c.status === 'APPROVED').length})
        </button>
        <button 
          onClick={() => setActiveTab('REJECTED')}
          style={{ 
            padding: '10px 20px',
            background: activeTab === 'REJECTED' ? '#4CAF50' : '#ddd',
            color: activeTab === 'REJECTED' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Rejected ({clients.filter(c => c.status === 'REJECTED').length})
        </button>
      </div>

      {filteredClients.length === 0 ? (
        <p>No {activeTab.toLowerCase()} clients.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Requested</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id}>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{client.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{client.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  {new Date(client.created_at).toLocaleDateString()}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  {client.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => updateClientStatus(client.id, 'APPROVED')}
                        style={{ padding: '5px 15px', marginRight: '10px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        onClick={() => updateClientStatus(client.id, 'REJECTED')}
                        style={{ padding: '5px 15px', background: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}
                  {client.status === 'APPROVED' && (
                    <button 
                      onClick={() => updateClientStatus(client.id, 'REJECTED')}
                      style={{ padding: '5px 15px', background: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                  {client.status === 'REJECTED' && (
                    <button 
                      onClick={() => updateClientStatus(client.id, 'APPROVED')}
                      style={{ padding: '5px 15px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                      Re-approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Clients;