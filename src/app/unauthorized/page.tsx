import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center animate-fade-in-up">
        <div className="text-9xl font-extrabold text-primary opacity-20 mb-4 select-none">403</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Access Denied</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
          You do not have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Link 
          href="/" 
          className="btn-primary inline-flex items-center gap-2 px-8 py-3"
        >
          <span>🏠</span>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
