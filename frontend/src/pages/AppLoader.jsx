import { useParams } from "react-router-dom";
import { useAppsContext } from "../context/AppsContext";
import { useEffect, useState } from "react";

export default function AppLoader() {
    const { appRoute } = useParams();
    const { apps } = useAppsContext();
    const [app, setApp] = useState(null);

    useEffect(() => {
        if (apps.length > 0) {
            const found = apps.find(a => a.route === appRoute);
            setApp(found);
        }
    }, [apps, appRoute]);

    if (!app) {
        return (
            <div className="flex-1 flex items-center justify-center text-white/50">
                Scanning modules...
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen bg-[#0F0B1F] text-white p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-2xl font-bold">
                    {app.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{app.name}</h1>
                    <p className="opacity-50">{app.description}</p>
                </div>
            </div>

            <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🚧</div>
                    <h2 className="text-xl font-bold mb-2">Application Under Construction</h2>
                    <p className="opacity-60 max-w-md mx-auto">
                        The <strong>{app.name}</strong> module is currently being compiled. creating the UI for this specific tool is the next step.
                    </p>
                    <button className="mt-8 px-6 py-2 bg-accent-purple rounded-lg hover:bg-accent-deepPurple transition-all">
                        Initialize Module
                    </button>
                </div>
            </div>
        </div>
    );
}
