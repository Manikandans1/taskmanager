import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

export default function KanbanColumn({ status, label, tasks, onEdit, onDelete }) {
  return (
    <div className="flex min-w-[280px] flex-1 flex-col rounded-2xl bg-slate-100/70 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[120px] flex-1 rounded-xl p-1 transition ${
              snapshot.isDraggingOver ? "bg-brand-50" : ""
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <p className="px-2 py-6 text-center text-xs text-slate-400">No tasks here</p>
            )}
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
