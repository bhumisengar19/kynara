import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Folder, MoreVertical, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const fetchProjects = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/projects");
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to load projects", err);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    const handleCreate = async () => {
        if (!newTitle) return;
        try {
            const res = await axios.post("http://localhost:5000/api/projects", {
                title: newTitle,
                description: newDesc,
            });
            setProjects([res.data, ...projects]);
            setShowCreate(false);
            setNewTitle("");
            setNewDesc("");
        } catch (err) {
            console.error("Create failed", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete project?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/projects/${id}`);
            setProjects(projects.filter(p => p._id !== id));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    return (
        <div className="flex-1 p-8 glass-panel m-4 ml-0 relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-cyan">
                        Projects
                    </h1>
                    <p className="opacity-60 text-sm">Organize your chats and workflows</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> New Project
                </button>
            </div>

            {showCreate && (
                <div className="mb-8 p-6 glass-card border border-white/20 animate-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-4">Create New Project</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs opacity-70 mb-1">Project Name</label>
                            <input
                                className="input-glass w-full"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="e.g. Q1 Marketing Plan"
                            />
                        </div>
                        <div>
                            <label className="block text-xs opacity-70 mb-1">Description (Optional)</label>
                            <textarea
                                className="input-glass w-full min-h-[80px]"
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                placeholder="Brief details..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2 opacity-70 hover:opacity-100">Cancel</button>
                            <button onClick={handleCreate} className="btn-primary">Create</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length === 0 && !showCreate && (
                    <div className="col-span-full text-center opacity-40 py-20">
                        <Folder size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No projects found. Create one to get started.</p>
                    </div>
                )}

                {projects.map((project) => (
                    <div key={project._id} className="glass-card p-6 relative group hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-lg bg-accent-deepPurple/20 flex items-center justify-center text-accent-cyan">
                                <Folder size={20} />
                            </div>
                            <button onClick={() => handleDelete(project._id)} className="opacity-0 group-hover:opacity-100 hover:text-red-400">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        <p className="text-sm opacity-60 line-clamp-2 h-10 mb-4">{project.description || "No description"}</p>
                        <div className="flex justify-between items-center text-xs opacity-50 border-t border-white/10 pt-4">
                            <span>{project.chats?.length || 0} Chats</span>
                            <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
