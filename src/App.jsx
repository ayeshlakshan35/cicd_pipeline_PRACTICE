import React, { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('taskflow-todos')
    return saved ? JSON.parse(saved) : []
  })
  const [inputValue, setInputValue] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isAdding, setIsAdding] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('taskflow-darkmode')
    return saved ? JSON.parse(saved) : false
  })
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const inputRef = useRef(null)

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow-todos', JSON.stringify(todos))
  }, [todos])

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('taskflow-darkmode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [darkMode])

  // Update current time every second to check deadlines
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const isOverdue = (todo) => {
    if (!todo.deadline || todo.completed) return false
    return new Date(todo.deadline) < currentTime
  }

  const addTodo = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setIsAdding(true)
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: inputValue.trim(),
          completed: false,
          deadline: deadline || null,
          priority: priority,
          createdAt: new Date().toISOString()
        }
      ])
      setInputValue('')
      setDeadline('')
      setPriority('medium')
      setTimeout(() => setIsAdding(false), 300)
      inputRef.current?.focus()
    }
  }

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id)
    if (todo && !todo.completed) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const startEditing = (todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const saveEdit = (id) => {
    if (editText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, text: editText.trim() } : todo
      ))
    }
    setEditingId(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const updatePriority = (id, newPriority) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, priority: newPriority } : todo
    ))
  }

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed))
  }

  const getTimeRemaining = (deadline) => {
    if (!deadline) return null
    const diff = new Date(deadline) - currentTime
    if (diff < 0) return 'Overdue'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h ${minutes}m left`
    return `${minutes}m left`
  }

  const formatDeadline = (deadline) => {
    if (!deadline) return ''
    const date = new Date(deadline)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredTodos = todos.filter(todo => {
    // First apply search filter
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    
    // Then apply status filter
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    if (filter === 'overdue') return isOverdue(todo)
    if (filter === 'high') return todo.priority === 'high' && !todo.completed
    return true
  })

  const remainingCount = todos.filter(todo => !todo.completed).length
  const overdueCount = todos.filter(todo => isOverdue(todo)).length
  const completedCount = todos.filter(todo => todo.completed).length
  const progressPercentage = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0
  const highPriorityCount = todos.filter(todo => todo.priority === 'high' && !todo.completed).length

  const getTodoStatus = (todo) => {
    if (todo.completed) return 'completed'
    if (isOverdue(todo)) return 'overdue'
    return 'active'
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
            }} />
          ))}
        </div>
      )}
      
      {/* Animated Background Elements */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="todo-app">
        <header className="todo-header">
          <div className="header-top">
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </div>
          <div className="header-content">
            <div className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <h1>TaskFlow</h1>
            <p className="subtitle">Organize your day, achieve your goals</p>
          </div>
          
          {/* Progress Bar */}
          {todos.length > 0 && (
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Daily Progress</span>
                <span className="progress-percentage">{progressPercentage}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="progress-text">
                {completedCount} of {todos.length} tasks completed
              </div>
            </div>
          )}
          
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{todos.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{remainingCount}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number completed-stat">{completedCount}</span>
              <span className="stat-label">Done</span>
            </div>
            {highPriorityCount > 0 && (
              <>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number high-priority-stat">{highPriorityCount}</span>
                  <span className="stat-label">Urgent</span>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-wrapper">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="search-clear"
                onClick={() => setSearchQuery('')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={addTodo} className="todo-form">
          <div className="form-inputs">
            <div className="input-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What's on your mind today?"
                className="todo-input"
              />
            </div>
            <div className="form-row">
              <div className="deadline-input-wrapper">
                <svg className="deadline-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="deadline-input"
                />
              </div>
              <div className="priority-selector">
                <button
                  type="button"
                  className={`priority-btn low ${priority === 'low' ? 'active' : ''}`}
                  onClick={() => setPriority('low')}
                  title="Low Priority"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17l-5-5h10l-5 5z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className={`priority-btn medium ${priority === 'medium' ? 'active' : ''}`}
                  onClick={() => setPriority('medium')}
                  title="Medium Priority"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="10" width="16" height="4" rx="1"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className={`priority-btn high ${priority === 'high' ? 'active' : ''}`}
                  onClick={() => setPriority('high')}
                  title="High Priority"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7l5 5H7l5-5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className={`add-btn ${isAdding ? 'adding' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </form>

        <div className="filter-section">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <span className="filter-icon">📋</span>
              All
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              <span className="filter-icon">⚡</span>
              Active
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              <span className="filter-icon">✅</span>
              Done
            </button>
            <button
              className={`filter-btn overdue-filter ${filter === 'overdue' ? 'active' : ''}`}
              onClick={() => setFilter('overdue')}
            >
              <span className="filter-icon">⏰</span>
              Overdue
              {overdueCount > 0 && <span className="overdue-badge">{overdueCount}</span>}
            </button>
            <button
              className={`filter-btn high-filter ${filter === 'high' ? 'active' : ''}`}
              onClick={() => setFilter('high')}
            >
              <span className="filter-icon">🔥</span>
              Urgent
              {highPriorityCount > 0 && <span className="high-badge">{highPriorityCount}</span>}
            </button>
          </div>
        </div>

        <ul className="todo-list">
          {filteredTodos.length === 0 ? (
            <li className="empty-state">
              <div className="empty-illustration">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3>No tasks here</h3>
              <p>Add a new task above to get started!</p>
            </li>
          ) : (
            filteredTodos.map((todo, index) => (
              <li 
                key={todo.id} 
                className={`todo-item ${getTodoStatus(todo)} priority-${todo.priority || 'medium'}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span className={`checkmark ${getTodoStatus(todo)}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                </label>
                <div className="todo-content">
                  {editingId === todo.id ? (
                    <div className="edit-wrapper">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="edit-input"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(todo.id)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                      />
                      <button onClick={() => saveEdit(todo.id)} className="edit-save-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button onClick={cancelEdit} className="edit-cancel-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="todo-text-row">
                        <span className={`priority-indicator priority-${todo.priority || 'medium'}`}></span>
                        <span className="todo-text">{todo.text}</span>
                      </div>
                      {todo.deadline && (
                        <div className={`todo-deadline ${getTodoStatus(todo)}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span className="deadline-text">{formatDeadline(todo.deadline)}</span>
                          <span className="time-remaining">{getTimeRemaining(todo.deadline)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="todo-actions">
                  {!todo.completed && editingId !== todo.id && (
                    <button
                      onClick={() => startEditing(todo)}
                      className="edit-btn"
                      aria-label="Edit todo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-btn"
                    aria-label="Delete todo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        {todos.length > 0 && (
          <footer className="todo-footer">
            <div className="footer-info">
              <span className="todo-count">
                <strong>{remainingCount}</strong> {remainingCount === 1 ? 'task' : 'tasks'} remaining
              </span>
              {overdueCount > 0 && (
                <span className="overdue-text">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {overdueCount} overdue
                </span>
              )}
            </div>
            <button onClick={clearCompleted} className="clear-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Clear completed
            </button>
          </footer>
        )}
      </div>
      
      <footer className="app-footer">
        <p>Built with ❤️ using React</p>
      </footer>
    </div>
  )
}

export default App
