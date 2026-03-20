"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";
import Spinner from "@/components/Spinner";

interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

type SortOption = "newest" | "oldest" | "az" | "za";

export default function DashboardClient({ userName }: { userName: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalTasks, setTotalTasks] = useState(0);
  const router = useRouter();

  const fetchTasks = useCallback(async (pageNum: number, append = false) => {
    try {
      if (!append) setLoading(true);
      const params = new URLSearchParams({ page: String(pageNum) });
      if (search) params.set("search", search);
      if (filter) params.set("status", filter);

      const res = await fetch(`/api/tasks?${params}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (append) {
        setTasks((prev) => [...prev, ...data.tasks]);
      } else {
        setTasks(data.tasks);
      }
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
      if (data.total !== undefined) setTotalTasks(data.total);
    } catch {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [search, filter, router]);

  useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  const createTask = async () => {
    if (!title.trim()) { toast.error("Task title is required"); return; }
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: description || undefined }),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.message); return; }
      setTitle(""); setDescription(""); setShowDescription(false);
      toast.success("Task added");
      fetchTasks(1);
    } catch { toast.error("Failed to add task"); }
  };

  const deleteTask = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      toast.success("Task deleted");
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch { toast.error("Failed to delete task"); }
  };

  const toggleTask = async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: data.completed } : t)));
    } catch { toast.error("Failed to update task"); }
  };

  const updateTask = async () => {
    if (!editTitle.trim()) return;
    try {
      await fetch(`/api/tasks/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDescription || null }),
      });
      setTasks((prev) => prev.map((t) => (t.id === editId ? { ...t, title: editTitle, description: editDescription || null } : t)));
      setEditId(null); setEditTitle(""); setEditDescription("");
      toast.success("Task updated");
    } catch { toast.error("Failed to update task"); }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") updateTask();
    if (e.key === "Escape") { setEditId(null); setEditTitle(""); setEditDescription(""); }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const filteredAndSorted = tasks
    .filter((task) => {
      const matchesSearch = !search.trim() || task.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "" || (filter === "completed" ? task.completed : !task.completed);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sort) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "az": return a.title.localeCompare(b.title);
        case "za": return b.title.localeCompare(a.title);
        default: return 0;
      }
    });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Task Manager</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome, {userName}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors">
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <input className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a new task..." value={title} onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !showDescription && createTask()} aria-label="New task title" />
            <button onClick={createTask} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">Add</button>
          </div>
          <button onClick={() => setShowDescription(!showDescription)}
            className="mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            {showDescription ? "- Hide description" : "+ Add description"}
          </button>
          {showDescription && (
            <textarea className="mt-2 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional description..." rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
              maxLength={1000} aria-label="Task description" />
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input placeholder="Search tasks..." className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search tasks" />
          <div className="flex gap-2">
            <select className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter tasks">
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
            <select className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sort} onChange={(e) => setSort(e.target.value as SortOption)} aria-label="Sort tasks">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="az">A - Z</option>
              <option value="za">Z - A</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4" aria-live="polite">
          {filteredAndSorted.length} of {totalTasks} task{totalTasks !== 1 ? "s" : ""}
        </p>

        {initialLoading ? (
          <div className="flex justify-center py-12"><Spinner size="md" /></div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {totalTasks === 0 ? "No tasks yet \u2014 create one above!" : "No tasks match your search or filter"}
            </p>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Task list">
            {filteredAndSorted.map((task) => (
              <li key={task.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 cursor-pointer focus:ring-2 focus:ring-blue-500"
                  aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`} />
                <div className="flex-1 min-w-0">
                  {editId === task.id ? (
                    <div className="space-y-2">
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={handleEditKeyDown}
                        className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Edit task title" autoFocus />
                      <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} onKeyDown={handleEditKeyDown}
                        className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        rows={2} placeholder="Description (optional)" aria-label="Edit task description" />
                    </div>
                  ) : (
                    <>
                      <span className={`block ${task.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"}`}>{task.title}</span>
                      {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Created {formatDate(task.createdAt)}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  {editId === task.id ? (
                    <>
                      <button onClick={updateTask} className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">Save</button>
                      <button onClick={() => { setEditId(null); setEditTitle(""); setEditDescription(""); }}
                        className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-2 focus:ring-blue-500">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(task.id); setEditTitle(task.title); setEditDescription(task.description || ""); }}
                        className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:ring-2 focus:ring-blue-500 rounded"
                        aria-label={`Edit "${task.title}"`}>Edit</button>
                      <button onClick={() => deleteTask(task.id)}
                        className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 focus:ring-2 focus:ring-blue-500 rounded"
                        aria-label={`Delete "${task.title}"`}>Delete</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {hasMore && (
          <div className="text-center mt-6">
            <button onClick={() => fetchTasks(page + 1, true)} disabled={loading}
              className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 focus:ring-2 focus:ring-blue-500 rounded">
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
