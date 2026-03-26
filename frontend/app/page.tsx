"use client"

import { useState, useEffect } from "react"

interface Task {
  _id: string
  title: string
  completed: boolean
}

const API = "http://localhost:3001/tasks"

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => {
        setTasks(data)
        setLoading(false)
      })
  }, [])

  async function addTask() {
    if (!newTask.trim()) return
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask }),
    })
    const task = await res.json()
    setTasks([task, ...tasks])
    setNewTask("")
  }

  async function toggleTask(id: string) {
    const res = await fetch(`${API}/${id}`, { method: "PATCH" })
    const updated = await res.json()
    setTasks(tasks.map(t => t._id === id ? updated : t))
  }

  async function deleteTask(id: string) {
    await fetch(`${API}/${id}`, { method: "DELETE" })
    setTasks(tasks.filter(t => t._id !== id))
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">Taskflow</h1>
        <p className="text-gray-400 mb-8">Tus tareas del día</p>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Nueva tarea..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={addTask}
            className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl font-medium transition"
          >
            Agregar
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando tareas...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-gray-600 transition"
              >
                <div
                  onClick={() => toggleTask(task._id)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 cursor-pointer ${
                    task.completed
                      ? "bg-green-500 border-green-500"
                      : "border-gray-600"
                  }`}
                />
                <span
                  onClick={() => toggleTask(task._id)}
                  className={`flex-1 cursor-pointer ${task.completed ? "line-through text-gray-500" : ""}`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="text-gray-600 hover:text-red-400 transition text-lg"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}