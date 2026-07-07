import { Draggable } from "@hello-pangea/dnd";
import { PRIORITY_STYLES, PRIORITY_LABELS } from "../constants";

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TaskCard({ task, index, onEdit, onDelete }) {
  const dueLabel = formatDate(task.dueDate);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0) && task.status !== "DONE";

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group mb-3 cursor-grab rounded-xl border bg-white p-3.5 shadow-sm transition active:cursor-grabbing ${
            snapshot.isDragging ? "rotate-1 border-brand-300 shadow-lg" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-snug text-slate-900">{task.title}</h3>
            <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => onEdit(task)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(task)}
                className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {task.description && (
            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{task.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[task.priority]}`}
            >
              {PRIORITY_LABELS[task.priority]}
            </span>
            {dueLabel && (
              <span className={`text-[11px] font-medium ${isOverdue ? "text-red-500" : "text-slate-400"}`}>
                {isOverdue ? "Overdue: " : ""}
                {dueLabel}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
