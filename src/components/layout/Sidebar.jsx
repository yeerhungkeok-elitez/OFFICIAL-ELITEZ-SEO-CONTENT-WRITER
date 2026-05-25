import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Settings, Search, FileText,
  PenLine, BarChart2, Download, ChevronRight,
  TrendingUp, FolderOpen, Plus
} from 'lucide-react'
import { useProject } from '../../context/ProjectContext'

const NAV = [
  { to: '/',        label: 'Dashboard',         icon: LayoutDashboard, step: null },
  { to: '/project', label: 'Project Setup',     icon: Settings,         step: '1' },
  { to: '/keywords',label: 'Keywords',          icon: Search,           step: '2' },
  { to: '/brief',   label: 'Content Brief',     icon: FileText,         step: '3' },
  { to: '/writer',  label: 'SEO Writer',        icon: PenLine,          step: '4' },
  { to: '/score',   label: 'Score Checker',     icon: BarChart2,        step: '5' },
  { to: '/export',  label: 'WordPress Export',  icon: Download,         step: '6' },
]

export default function Sidebar() {
  const { projects, activeProject, activeProjectId, setActiveProjectId, createProject } = useProject()
  const navigate = useNavigate()

  function handleNewProject() {
    const p = createProject({ companyName: 'New Project' })
    navigate('/project')
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">SEO Growth</div>
            <div className="text-brand-400 text-xs font-medium">Engine v1</div>
          </div>
        </div>
      </div>

      {/* Project Switcher */}
      <div className="px-3 py-3 border-b border-slate-700/60">
        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
          Active Project
        </div>
        {projects.length > 0 ? (
          <div className="space-y-1">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveProjectId(p.id)}
                className={`w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-all
                  ${p.id === activeProjectId
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
              >
                <FolderOpen size={14} className="flex-shrink-0" />
                <span className="truncate">{p.companyName || 'Unnamed Project'}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-2 text-slate-500 text-xs italic">No projects yet</div>
        )}
        <button
          onClick={handleNewProject}
          className="mt-2 w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all border border-dashed border-slate-700 hover:border-slate-500"
        >
          <Plus size={13} />
          New Project
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mb-3">
          Workflow
        </div>
        {NAV.map(({ to, label, icon: Icon, step }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
              ${isActive
                ? 'bg-brand-500 text-white shadow-md shadow-brand-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {step && (
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-slate-200'}`}>
                    {step}
                  </span>
                )}
                {!step && <Icon size={16} className="flex-shrink-0" />}
                <span className="flex-1">{label}</span>
                {!step && <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700/60">
        {activeProject?.companyName ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-400 text-xs font-bold">
                {activeProject.companyName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-slate-200 text-xs font-medium truncate">{activeProject.companyName}</div>
              <div className="text-slate-500 text-xs truncate">{activeProject.industry || 'No industry set'}</div>
            </div>
          </div>
        ) : (
          <div className="text-slate-600 text-xs italic">Set up a project to begin</div>
        )}
      </div>
    </aside>
  )
}
