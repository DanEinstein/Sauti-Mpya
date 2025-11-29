import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/Layout/Layout';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { Assessment } from './pages/Assessment';
import { SafetyPlan } from './pages/SafetyPlan';
import { Resources } from './pages/Resources';
import { About } from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/safety-plan" element={<SafetyPlan />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
