import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProjectProvider } from './context/ProjectContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ProjectSetup from './pages/ProjectSetup'
import KeywordOpportunities from './pages/KeywordOpportunities'
import ContentBriefGenerator from './pages/ContentBriefGenerator'
import SEOContentWriter from './pages/SEOContentWriter'
import ContentScoreChecker from './pages/ContentScoreChecker'
import WordPressExport from './pages/WordPressExport'

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="project" element={<ProjectSetup />} />
            <Route path="keywords" element={<KeywordOpportunities />} />
            <Route path="brief" element={<ContentBriefGenerator />} />
            <Route path="writer" element={<SEOContentWriter />} />
            <Route path="score" element={<ContentScoreChecker />} />
            <Route path="export" element={<WordPressExport />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  )
}
