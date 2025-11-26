import { useState } from 'react';
import { supabase } from './supabase';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('Creating account...');

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      setMessage('❌ Signup failed: ' + authError.message);
      return;
    }

    // Add coach info to coaches table
    const { error: dbError } = await supabase
      .from('coaches')
      .insert([{ 
        id: authData.user.id,
        email, 
        name, 
        sport 
      }]);

    if (dbError) {
      setMessage('❌ Error saving coach info: ' + dbError.message);
    } else {
      setMessage('✅ Account created! Check your email to verify, then login.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>🏸 Coach Signup</h1>
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: '15px' }}>
          <label>Name:</label><br/>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Sport:</label><br/>
          <input 
            type="text" 
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            placeholder="e.g., Tennis, Golf, Basketball"
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label><br/>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label><br/>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Create Account
        </button>
      </form>
      <p>{message}</p>
      <p>Already have an account? <a href="/login">Login here</a></p>
    </div>
  );
}

export default Signup;