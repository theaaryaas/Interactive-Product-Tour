import Link from 'next/link'

export default function SimpleLandingPage() {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="px-6 py-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">
            ProductTour
          </div>
          <div className="flex space-x-4">
            <Link href="/login" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg">
              Sign In
            </Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Interactive
            <span className="text-blue-600"> Product Tours</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Build engaging product demos with screenshots, annotations, and screen recordings. 
            Share your story with the world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg text-lg">
              Start Creating
            </Link>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-lg text-lg">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to showcase your product
            </h2>
            <p className="text-xl text-gray-600">
              Powerful tools to create, share, and analyze your product demos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">📹</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Screen Recording</h3>
              <p className="text-gray-600">
                Capture your workflow with our built-in screen recorder and add it to your tours.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Interactive Annotations</h3>
              <p className="text-gray-600">
                Add highlights, descriptions, and interactive elements to guide your audience.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Share & Collaborate</h3>
              <p className="text-gray-600">
                Share your tours with public or private links and collaborate with your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 ProductTour. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
