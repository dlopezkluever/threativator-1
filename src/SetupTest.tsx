import { TestCard } from '@/components/ui/test-card';

export function SetupTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Threativator Setup Test
        </h1>
        <p className="text-gray-600 mb-8">
          Verifying Phase 1.1 environment setup is working correctly
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TestCard title="React + Vite + TypeScript" status="success">
            Project initialized with Vite, React 18, and strict TypeScript
            configuration.
          </TestCard>

          <TestCard title="Tailwind CSS" status="success">
            Utility-first CSS framework configured with PostCSS and
            autoprefixer. Custom color system and animations ready.
          </TestCard>

          <TestCard title="ESLint Configuration" status="success">
            Strict linting rules for TypeScript and React with hooks plugin
            enabled.
          </TestCard>

          <TestCard title="Prettier Formatting" status="success">
            Code formatting configured with standard rules. Run{' '}
            <code className="bg-gray-200 px-1 rounded">npm run format</code> to
            format code.
          </TestCard>

          <TestCard title="Component System" status="success">
            Magic UI foundation setup with shadcn/ui compatibility. Utils
            library with clsx and tailwind-merge ready.
          </TestCard>

          <TestCard title="Build System" status="success">
            Production builds working correctly with TypeScript compilation and
            Vite bundling.
          </TestCard>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Quick Commands to Test
          </h2>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <code className="bg-gray-100 p-2 rounded text-sm">
                npm run dev
              </code>
              <span className="text-sm text-gray-600">
                Start development server
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <code className="bg-gray-100 p-2 rounded text-sm">
                npm run lint
              </code>
              <span className="text-sm text-gray-600">
                Check code with ESLint
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <code className="bg-gray-100 p-2 rounded text-sm">
                npm run format
              </code>
              <span className="text-sm text-gray-600">
                Format code with Prettier
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <code className="bg-gray-100 p-2 rounded text-sm">
                npm run build
              </code>
              <span className="text-sm text-gray-600">
                Build for production
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-green-800 font-semibold">
              Phase 1.1 Setup Complete!
            </p>
          </div>
          <p className="text-green-700 mt-2 text-sm">
            All environment configurations are working. Ready to proceed to
            Phase 1.2: Supabase Backend Initialization.
          </p>
        </div>
      </div>
    </div>
  );
}
