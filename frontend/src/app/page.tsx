export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-blue via-secondary-blue to-accent-gold p-24">
            <div className="text-center">
                <h1 className="mb-4 text-6xl font-bold text-white drop-shadow-lg">
                    Employee Management System
                </h1>
                <p className="mb-8 text-xl text-white/90">
                    Modern HR solution with AI-powered insights
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="/login"
                        className="rounded-lg bg-white px-8 py-3 font-semibold text-primary-navy shadow-lg transition hover:scale-105 hover:shadow-xl"
                    >
                        Get Started
                    </a>
                    <a
                        href="/about"
                        className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-white/10"
                    >
                        Learn More
                    </a>
                </div>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="glass rounded-xl p-6 text-center text-white">
                    <div className="mb-4 text-4xl">👥</div>
                    <h3 className="mb-2 text-xl font-semibold">Employee Management</h3>
                    <p className="text-sm text-white/80">
                        Complete CRUD operations with advanced search
                    </p>
                </div>
                <div className="glass rounded-xl p-6 text-center text-white">
                    <div className="mb-4 text-4xl">📊</div>
                    <h3 className="mb-2 text-xl font-semibold">Performance Tracking</h3>
                    <p className="text-sm text-white/80">
                        KPIs, goals, and 360-degree feedback
                    </p>
                </div>
                <div className="glass rounded-xl p-6 text-center text-white">
                    <div className="mb-4 text-4xl">🤖</div>
                    <h3 className="mb-2 text-xl font-semibold">AI-Powered Insights</h3>
                    <p className="text-sm text-white/80">
                        Predictive analytics and smart automation
                    </p>
                </div>
            </div>
        </div>
    );
}
