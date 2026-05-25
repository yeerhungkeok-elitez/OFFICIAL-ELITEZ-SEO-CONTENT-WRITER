import { createContext, useContext, useState, useEffect } from 'react'
import { loadStorage, saveStorage, generateId } from '../lib/storage'

const ProjectContext = createContext(null)

const DEFAULT_PROJECT = {
  companyName: '',
  website: '',
  country: '',
  industry: '',
  services: '',
  targetAudience: '',
  tone: 'Professional & Authoritative',
  keywords: [],
  briefs: [],
  generatedContent: [],
  scores: [],
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)

  // Load from localStorage on mount
  useEffect(() => {
    const data = loadStorage()
    if (data.projects?.length) {
      setProjects(data.projects)
      setActiveProjectId(data.activeProjectId || data.projects[0]?.id || null)
    }
  }, [])

  // Persist whenever state changes
  useEffect(() => {
    saveStorage({ projects, activeProjectId })
  }, [projects, activeProjectId])

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null

  function createProject(data) {
    const project = {
      ...DEFAULT_PROJECT,
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProjects(prev => [...prev, project])
    setActiveProjectId(project.id)
    return project
  }

  function updateProject(id, data) {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...data, updatedAt: new Date().toISOString() }
          : p
      )
    )
  }

  function updateActiveProject(data) {
    if (activeProjectId) updateProject(activeProjectId, data)
  }

  function deleteProject(id) {
    setProjects(prev => prev.filter(p => p.id !== id))
    if (activeProjectId === id) {
      const remaining = projects.filter(p => p.id !== id)
      setActiveProjectId(remaining[0]?.id || null)
    }
  }

  // Domain-specific helpers
  function saveKeywords(keywords) {
    updateActiveProject({ keywords })
  }

  function saveBrief(brief) {
    const current = activeProject?.briefs || []
    updateActiveProject({ briefs: [...current.filter(b => b.id !== brief.id), brief] })
  }

  function saveContent(content) {
    const current = activeProject?.generatedContent || []
    updateActiveProject({ generatedContent: [...current.filter(c => c.id !== content.id), content] })
  }

  function saveScore(score) {
    const current = activeProject?.scores || []
    updateActiveProject({ scores: [...current.filter(s => s.id !== score.id), score] })
  }

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProject,
      activeProjectId,
      setActiveProjectId,
      createProject,
      updateProject,
      updateActiveProject,
      deleteProject,
      saveKeywords,
      saveBrief,
      saveContent,
      saveScore,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}
