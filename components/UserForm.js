const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "trainer", label: "Trainer" },
  { value: "owner", label: "Owner" },
];

const ERROR_MESSAGES = {
  duplicate: "That username is already in use.",
  invalid: "Enter a username, a valid role, and a password of at least 8 characters.",
  owner: "That change would remove the last owner.",
  role: "You do not have permission to assign that role.",
};

export function UserForm({ action, error, user }) {
  const isEditing = Boolean(user);

  return (
    <form action={action} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      {error ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {ERROR_MESSAGES[error] || "Unable to save this user."}
        </p>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Username" name="username" required value={user?.username} />
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="role">
            Role
          </label>
          <select
            className="mt-2 block w-full rounded-xl border-gray-300"
            defaultValue={user?.role || "user"}
            id="role"
            name="role"
            required
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500">
            Trainers and users currently have the same permissions.
          </p>
        </div>
        <Field
          autoComplete={isEditing ? "new-password" : "new-password"}
          help={isEditing ? "Leave blank to keep the current password." : "Use at least 8 characters."}
          label={isEditing ? "New password" : "Password"}
          name="password"
          required={!isEditing}
          type="password"
        />
      </div>
      <button className="rounded-full bg-[#491964] px-5 py-3 font-semibold text-white hover:bg-[#37124F]">
        {isEditing ? "Save user" : "Create user"}
      </button>
    </form>
  );
}

function Field({ autoComplete, help, label, name, required = false, type = "text", value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <input
        autoComplete={autoComplete}
        className="mt-2 block w-full rounded-xl border-gray-300"
        defaultValue={value ?? ""}
        id={name}
        name={name}
        required={required}
        type={type}
      />
      {help ? <p className="mt-2 text-sm text-gray-500">{help}</p> : null}
    </div>
  );
}
