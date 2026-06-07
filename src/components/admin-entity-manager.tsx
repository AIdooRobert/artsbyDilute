import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteAdminEntity,
  saveAdminEntity,
} from "@/app/actions/admin";
import type { AdminField, AdminSection } from "@/lib/admin-config";

export function AdminEntityManager({
  sectionKey,
  section,
  rows,
}: {
  sectionKey: string;
  section: AdminSection;
  rows: Array<Record<string, unknown>>;
}) {
  const save = saveAdminEntity.bind(null, sectionKey);
  const remove = deleteAdminEntity.bind(null, sectionKey);

  return (
    <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
      <details open className="card h-fit p-6">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-black">
          <Plus size={18} className="text-copper" /> Add {section.title.toLowerCase()}
        </summary>
        <form action={save} className="mt-5 grid gap-4">
          {section.fields.map((field) => (
            <AdminFieldControl key={field.name} field={field} />
          ))}
          <button className="button-primary">Create</button>
        </form>
      </details>

      <section className="card min-w-0 overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {section.display.map((column) => (
                  <th key={column}>{column.replaceAll("_", " ")}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)}>
                  {section.display.map((column) => (
                    <td key={column}>{formatValue(row[column])}</td>
                  ))}
                  <td>
                    <div className="flex gap-2">
                      <details className="relative">
                        <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-full bg-cream text-copper">
                          <Pencil size={15} />
                        </summary>
                        <div className="fixed inset-3 z-40 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-11 sm:w-[420px]">
                          <form action={save} className="grid gap-4">
                            <input type="hidden" name="id" value={String(row.id)} />
                            {section.fields.map((field) => (
                              <AdminFieldControl
                                key={field.name}
                                field={field}
                                value={row[field.imageColumn ?? field.name]}
                              />
                            ))}
                            <button className="button-primary">Save changes</button>
                          </form>
                        </div>
                      </details>
                      <form action={remove}>
                        <input type="hidden" name="id" value={String(row.id)} />
                        <button className="grid size-9 place-items-center rounded-full bg-red-50 text-red-700">
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={section.display.length + 1} className="text-center text-black/42">
                    No records yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AdminFieldControl({
  field,
  value,
}: {
  field: AdminField;
  value?: unknown;
}) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 text-sm font-bold">
        <input
          name={field.name}
          type="checkbox"
          defaultChecked={Boolean(value)}
          className="size-4 accent-copper"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "textarea" || field.type === "list") {
    const text = Array.isArray(value) ? value.join("\n") : String(value ?? "");
    return (
      <label className="grid gap-2 text-sm font-bold">
        {field.label}
        <textarea
          name={field.name}
          rows={field.type === "list" ? 4 : 5}
          defaultValue={text}
          className="field resize-y"
          required={field.required}
        />
      </label>
    );
  }

  return (
    <label className="grid gap-2 text-sm font-bold">
      {field.label}
      <input
        name={field.name}
        type={field.type === "file" ? "file" : field.type === "number" ? "number" : "text"}
        step={field.name.includes("price") ? "0.01" : undefined}
        defaultValue={field.type === "file" ? undefined : String(value ?? "")}
        className="field"
        required={field.required && field.type !== "file"}
        accept={field.type === "file" ? "image/*" : undefined}
      />
    </label>
  );
}

function formatValue(value: unknown) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (value == null || value === "") return "—";
  if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
  }
  return String(value);
}
