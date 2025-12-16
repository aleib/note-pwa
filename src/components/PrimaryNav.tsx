import { NavLink } from "react-router-dom";

type NavItem = {
  to: string;
  label: string;
};

const navItems: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/tasks", label: "Tasks" },
  { to: "/notes", label: "Notes" },
  { to: "/search", label: "Search" },
  { to: "/settings", label: "Settings" }
];

function navLinkClassName(isActive: boolean) {
  return [
    "flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium",
    isActive ? "bg-slate-800 text-white" : "text-slate-300"
  ].join(" ");
}

export function PrimaryNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md border-t border-slate-800 bg-slate-950/90 px-2 py-2 backdrop-blur">
      <div className="flex gap-2">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => navLinkClassName(isActive)}>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}


