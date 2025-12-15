import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [deadline, setDeadline] = useState('')
  const [filter, setFilter] = useState('all')
  const [currentTime, setCurrentTime] = useState(new Date())

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
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: inputValue.trim(),
          completed: false,
          deadline: deadline || null
        }
      ])
      setInputValue('')
      setDeadline('')
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
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
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    if (filter === 'overdue') return isOverdue(todo)
    return true
  })

  const remainingCount = todos.filter(todo => !todo.completed).length
  const overdueCount = todos.filter(todo => isOverdue(todo)).length

  const getTodoStatus = (todo) => {
    if (todo.completed) return 'completed'
    if (isOverdue(todo)) return 'overdue'
    return 'active'
  }

  return (
    <div className="app-container">
      <div className="todo-app">
        <header className="todo-header">
          <h1>Todo List</h1>
          <p className="subtitle">Stay organized, get things done</p>
        </header>

        <form onSubmit={addTodo} className="todo-form">
          <div className="form-inputs">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What needs to be done?"
              className="todo-input"
            />
            <div className="deadline-input-wrapper">
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="deadline-input"
              />
              <span className="deadline-label">Set deadline</span>
            </div>
          </div>
          <button type="submit" className="add-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </form>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
            onClick={() => setFilter('overdue')}
          >
            Overdue {overdueCount > 0 && <span className="overdue-badge">{overdueCount}</span>}
          </button>
        </div>

        <ul className="todo-list">
          {filteredTodos.length === 0 ? (
            <li className="empty-state">
              <span className="empty-icon">📝</span>
              <p>No tasks yet. Add one above!</p>
            </li>
          ) : (
            filteredTodos.map(todo => (
              <li key={todo.id} className={`todo-item ${getTodoStatus(todo)}`}>
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span className={`checkmark ${getTodoStatus(todo)}`}></span>
                </label>
                <div className="todo-content">
                  <span className="todo-text">{todo.text}</span>
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
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-btn"
                  aria-label="Delete todo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </li>
            ))
          )}
        </ul>

        {todos.length > 0 && (
          <footer className="todo-footer">
            <span className="todo-count">
              {remainingCount} {remainingCount === 1 ? 'task' : 'tasks'} remaining
              {overdueCount > 0 && <span className="overdue-text"> • {overdueCount} overdue</span>}
            </span>
            <button onClick={clearCompleted} className="clear-btn">
              clear completed
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}

export default App
