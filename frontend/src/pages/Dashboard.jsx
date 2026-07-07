import { useCallback, useEffect, useMemo, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import Navbar from "../components/Navbar";
import FilterBar from "../components/FilterBar";
import KanbanColumn from "../components/KanbanColumn";
import TaskForm from "../components/TaskForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { STATUSES } from "../constants";
import { taskApi } from "../api/tasks";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "" });

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const data = await taskApi.list(params);
      setTasks(data);
    } catch (err) {
      setLoadError("Couldn't load your tasks. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(STATUSES.map((s) => [s.value, []]));
    for (const task of tasks) {
      if (grouped[task.status]) grouped[task.status].push(task);
    }
    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) => a.position - b.position);
    }
    return grouped;
  }, [tasks]);

  function openCreateForm() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEditForm(task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingTask(null);
  }

  function handleSaved() {
    closeForm();
    loadTasks();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await taskApi.remove(pendingDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setLoadError("Couldn't delete the task. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    const taskId = Number(draggableId);

    // Build the next state optimistically so the UI feels instant.
    const nextColumns = {
      ...columns,
      [sourceStatus]: [...columns[sourceStatus]],
      [destStatus]: [...columns[destStatus]],
    };

    const [movedTask] = nextColumns[sourceStatus].splice(source.index, 1);
    const updatedTask = { ...movedTask, status: destStatus };
    nextColumns[destStatus].splice(destination.index, 0, updatedTask);

    const flattened = Object.values(nextColumns).flat();
    setTasks(flattened);

    const orderedTaskIds = nextColumns[destStatus].map((t) => t.id);

    try {
      await taskApi.reorder(destStatus, orderedTaskIds);
    } catch {
      setLoadError("Couldn't save the new order. Reloading tasks.");
      loadTasks();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onNewTask={openCreateForm} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <FilterBar filters={filters} onChange={setFilters} />

        {loadError && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{loadError}</div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">Loading tasks...</div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col gap-4 sm:flex-row">
              {STATUSES.map((s) => (
                <KanbanColumn
                  key={s.value}
                  status={s.value}
                  label={s.label}
                  tasks={columns[s.value]}
                  onEdit={openEditForm}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </main>

      <TaskForm open={formOpen} task={editingTask} onClose={closeForm} onSaved={handleSaved} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete task?"
        message={`This will permanently delete "${pendingDelete?.title}". This can't be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
        confirming={deleting}
      />
    </div>
  );
}
