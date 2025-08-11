interface HeaderProps {
  onOpenForm: () => void;
}

export default function Header({ onOpenForm }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-black rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">AI</span>
            </div>
            <h1 className="text-2xl font-semibold text-primary-black">KOC tries AI</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <button
              onClick={onOpenForm}
              className="bg-primary-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Update Rankings
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
