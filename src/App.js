import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import FindCoach from './FindCoach';
import BookSlot from './BookSlot';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/find-coach" />} />
        <Route path="/find-coach" element={<FindCoach />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book/:slotId" element={<BookSlot />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;