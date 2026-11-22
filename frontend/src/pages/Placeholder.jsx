export default function Placeholder({ title }) {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="glass p-10 max-w-md w-full text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mb-2">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className="text-2xl font-bold text-brand-dark">{title}</h2>
        <p className="text-brand-dark/60">
          This module is coming up in the next phase.
        </p>
      </div>
    </div>
  );
}