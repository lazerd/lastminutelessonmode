import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import Calendar from './Calendar';
import Clients from './Clients';

function Dashboard() {
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('calendar');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data: coachData } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', user.id)
      .single();

    setCoach(coachData);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div style={{ padding: '50px' }}>Loading...</div>;

  return (
    <div style={{ fontFamily: 'Arial' }}>
      <div style={{ padding: '20px', background: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>🏸 Welcome, {coach?.name}!</h1>
          <p style={{ margin: '5px 0 0 0' }}>Sport: {coach?.sport} | Email: {coach?.email}</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      
      <div style={{ padding: '20px', borderBottom: '2px solid #ddd' }}>
        <button 
          onClick={() => setCurrentView('calendar')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            background: currentView === 'calendar' ? '#4CAF50' : '#ddd',
            color: currentView === 'calendar' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          📅 Calendar
        </button>
        <button 
          onClick={() => setCurrentView('clients')}
          style={{ 
            padding: '10px 20px',
            background: currentView === 'clients' ? '#4CAF50' : '#ddd',
            color: currentView === 'clients' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          👥 Clients
        </button>
      </div>
      
      {currentView === 'calendar' && <Calendar />}
      {currentView === 'clients' && <Clients />}
    </div>
  );
}

export default Dashboard;