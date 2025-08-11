interface HeaderProps {
  onOpenForm: () => void;
}

export default function Header({ onOpenForm }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-primary-black">KOC tries AI</h1>
          <button
            onClick={onOpenForm}
            className="bg-primary-black text-white px-3 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Update Rankings
          </button>
        </div>
      </div>
    </header>
  );
}
