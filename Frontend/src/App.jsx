import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Pages
import Home from './components/HomePage';
import AuthForm from './components/AuthForm';
import AIpathway from './pages/AIpathway';
import Careers from './pages/Careers';
import MagazinePage from './pages/MagazinePage';
import CareerAptitudeTest from './pages/CareerAptitudeTest';
import Docgame1 from './pages/Docgame1';
import Lawgame1 from './pages/Lawgame1';
import Engineergame1 from './pages/Engineergame1';
import Cagame1 from './pages/Cagame1';
import Csgame1 from './pages/Csgame1';
import InteriorDesigngame1 from './pages/InteriorDesigngame1';
import Archgame1 from './pages/Archgame1';
import Writergame1 from './pages/Writergame1';
import StudyAbroadBlogPage from './pages/StudyAbroadBlogPage';
import AptitudeBlogPage from './pages/AptitudeBlogPage';
import CountryBlogPage from './pages/countryblogpage';
import ExamsDocsVisaBlog from './pages/ExamsDocsVisaBlog';
import EntrepreneurshipMagazine from './pages/EntrepreneurshipMagazine';
import CollegeTest from './pages/collegetest';
import IntelligenceTests from './pages/IntelligenceTests';
import SkillDevelopmentHub from './pages/SkillDevelopmentHub';
import CommunityNetworking from './pages/CommunityNetworking';
import ChatbotPage from './pages/ChatbotPage';
import AIStudyAbroadAdvisor from './pages/AIStudyAbroadAdvisor';
import AIInterviewPrepResumeGuide from './pages/AIInterviewPrepResumeGuide';
import ResumeAnalyzer from './pages/Resumeanalyzer';
import CoverLetterGenerator from './pages/Coverlettergenerator';
import ResumeDesigner from './pages/ResumeDesigner';
import ContactPage from './pages/ContactPage';
import AbroadPartTime from "./pages/AbroadPartTime";

function Layout() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  React.useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location.pathname]);

  const hideSidebarRoutes = ['/Auth'];
  const showSidebar = isLoggedIn && !hideSidebarRoutes.includes(location.pathname);

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex' }}>

        {showSidebar && <Sidebar />}

        <div
          style={{
            marginLeft: showSidebar ? '260px' : '0px',
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '80px',
          }}
        >
          <div style={{ flex: 1, padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Auth" element={<AuthForm />} />
              <Route path="/ai-pathway" element={<AIpathway />} />
              <Route path="/Careers" element={<Careers />} />
              <Route path="/CareerAptitudeTest" element={<CareerAptitudeTest />} />
              <Route path="/MagazinePage" element={<MagazinePage />} />
              <Route path="/Docgame1" element={<Docgame1 />} />
              <Route path="/Lawgame1" element={<Lawgame1 />} />
              <Route path="/Engineergame1" element={<Engineergame1 />} />
              <Route path="/Cagame1" element={<Cagame1 />} />
              <Route path="/Csgame1" element={<Csgame1 />} />
              <Route path="/InteriorDesigngame1" element={<InteriorDesigngame1 />} />
              <Route path="/Archgame1" element={<Archgame1 />} />
              <Route path="/Writergame1" element={<Writergame1 />} />
              <Route path="/StudyAbroadBlogPage" element={<StudyAbroadBlogPage />} />
              <Route path="/AptitudeBlogPage" element={<AptitudeBlogPage />} />
              <Route path="/CountryBlogPage" element={<CountryBlogPage />} />
              <Route path="/ExamsDocsVisaBlog" element={<ExamsDocsVisaBlog />} />
              <Route path="/EntrepreneurshipMagazine" element={<EntrepreneurshipMagazine />} />
              <Route path="/CollegeTest" element={<CollegeTest />} />
              <Route path="/IntelligenceTests" element={<IntelligenceTests />} />
              <Route path="/SkillDevelopmentHub" element={<SkillDevelopmentHub />} />
              <Route path="/CommunityNetworking" element={<CommunityNetworking />} />
              <Route path="/ChatbotPage" element={<ChatbotPage />} />
              <Route path="/AIStudyAbroadAdvisor" element={<AIStudyAbroadAdvisor />} />
              <Route path="/AIInterviewPrepResumeGuide" element={<AIInterviewPrepResumeGuide />} />
              <Route path="/ResumeAnalyzer" element={<ResumeAnalyzer />} />
              <Route path="/CoverLetterGenerator" element={<CoverLetterGenerator />} />
              <Route path="/ResumeDesigner" element={<ResumeDesigner />} />
              <Route path="/ContactPage" element={<ContactPage />} />
              <Route path="/AbroadPartTime" element={<AbroadPartTime />} />
            </Routes>
          </div>
          <Footer />
        </div>

      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}