import React, { useState, useEffect } from "react";
import { 
  Folder, 
  File, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ChevronRight, 
  RefreshCw, 
  FileJson, 
  FileText, 
  FileCode,
  FileMinus
} from "lucide-react";

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  mtime: string;
}

export default function FileExplorer() {
  const [currentDir, setCurrentDir] = useState<string>(".");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals / Inputs
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemType, setNewItemType] = useState<"file" | "dir">("file");

  const loadFiles = async (dirPath: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/files/list?dir=${encodeURIComponent(dirPath)}`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
        setCurrentDir(data.currentPath);
      } else {
        setError(data.error || "Failed to load directory items.");
      }
    } catch (err) {
      setError("Failed to query file system API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(currentDir);
  }, []);

  const handleNavigate = (path: string) => {
    loadFiles(path);
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleNavigateUp = () => {
    const parts = currentDir.split("/");
    if (parts.length > 1) {
      parts.pop();
      handleNavigate(parts.join("/"));
    } else if (currentDir !== ".") {
      handleNavigate(".");
    }
  };

  const handleViewFile = async (file: FileItem) => {
    setSelectedFile(file);
    setIsEditing(false);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/files/read?file=${encodeURIComponent(file.path)}`);
      const data = await response.json();
      if (data.success) {
        setFileContent(data.content);
        setIsEditing(true);
      } else {
        setError(data.error || "Could not read file content.");
      }
    } catch (err) {
      setError("API connection error while reading file.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;
    setSaveLoading(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/files/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: selectedFile.path, content: fileContent })
      });
      const data = await response.json();
      if (data.success) {
        setFeedback({ type: "success", message: "File contents updated successfully." });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to edit file." });
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Failed to dispatch file write instructions." });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const targetPath = currentDir === "." ? newItemName : `${currentDir}/${newItemName}`;
    setLoading(true);
    try {
      const response = await fetch("/api/files/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPath, type: newItemType })
      });
      const data = await response.json();
      if (data.success) {
        setNewItemName("");
        setShowCreateModal(false);
        loadFiles(currentDir);
      } else {
        setError(data.error || "Could not spawn file node.");
      }
    } catch (err) {
      setError("API failure during item creation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete: ${path}?`)) return;

    setLoading(true);
    try {
      const response = await fetch("/api/files/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPath: path })
      });
      const data = await response.json();
      if (data.success) {
        loadFiles(currentDir);
        if (selectedFile?.path === path) {
          setSelectedFile(null);
          setIsEditing(false);
        }
      } else {
        setError(data.error || "Failed to remove item.");
      }
    } catch (err) {
      setError("Connection failure while removing node.");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (name: string, isDirectory: boolean) => {
    if (isDirectory) return <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20" />;
    if (name.endsWith(".json")) return <FileJson className="w-4 h-4 text-cyan-400" />;
    if (name.endsWith(".ts") || name.endsWith(".tsx") || name.endsWith(".js") || name.endsWith(".cjs")) {
      return <FileCode className="w-4 h-4 text-blue-400" />;
    }
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div id="file-explorer" className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#090d1a] border border-slate-900 rounded-xl p-5 shadow-2xl shadow-blue-950/10">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 tracking-wide uppercase font-sans">
            File Manager
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Browse, manage, and configure files directly in the hosting VPS's filesystem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadFiles(currentDir)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e1428] border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg hover:shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Item
          </button>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4 flex items-start gap-3">
          <FileMinus className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-red-400">File Manager Fault</span>
            <p className="text-red-300 text-[11px] mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* DETAILED WORKING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FILE LIST PANEL */}
        <div className={`col-span-1 ${isEditing ? 'lg:col-span-5' : 'lg:col-span-12'} transition-all`}>
          <div className="bg-[#090d1a] border border-slate-900 rounded-xl overflow-hidden shadow-2xl">
            
            {/* DIRECTORY BREADCRUMB */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0d1225]/60 border-b border-slate-900/80">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 overflow-x-auto whitespace-nowrap py-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] sm:inline-block">Root</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                {currentDir === "." ? (
                  <span className="text-blue-400 font-semibold underline underline-offset-4 bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">workspace</span>
                ) : (
                  <>
                    <span 
                      onClick={() => handleNavigate(".")} 
                      className="text-slate-400 hover:text-slate-100 cursor-pointer hover:underline"
                    >
                      workspace
                    </span>
                    {currentDir.split("/").map((part, index, arr) => (
                      <React.Fragment key={index}>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span 
                          onClick={() => {
                            const target = arr.slice(0, index + 1).join("/");
                            handleNavigate(target);
                          }}
                          className={`${index === arr.length - 1 ? 'text-blue-400 font-semibold bg-blue-500/5 border border-blue-500/10 px-1.5 py-0.5 rounded' : 'text-slate-400 hover:text-slate-100'} cursor-pointer hover:underline`}
                        >
                          {part}
                        </span>
                      </React.Fragment>
                    ))}
                  </>
                )}
              </div>
              
              {currentDir !== "." && (
                <button
                  onClick={handleNavigateUp}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-100 px-2 py-1 bg-[#121831] border border-slate-800 rounded-md transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" /> Up
                </button>
              )}
            </div>

            {/* DIRECTORY EMPTY OR POPULATED VIEWS */}
            {files.length === 0 ? (
              <div className="py-12 text-center">
                <Folder className="w-10 h-10 text-slate-700 mx-auto stroke-[1.5]" />
                <p className="text-slate-500 text-xs mt-2">This directory is currently empty.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-[#0c1122] text-slate-400 border-b border-slate-900/60 uppercase tracking-wider text-[10px] font-mono">
                      <th className="px-4 py-3 font-semibold">Name</th>
                      {!isEditing && <th className="px-4 py-3 font-semibold">Size</th>}
                      {!isEditing && <th className="px-4 py-3 font-semibold">Last Modified</th>}
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40">
                    {files.map((file) => (
                      <tr 
                        key={file.path} 
                        onClick={() => file.isDirectory ? handleNavigate(file.path) : handleViewFile(file)}
                        className={`hover:bg-blue-600/5 cursor-pointer transition-colors ${selectedFile?.path === file.path ? 'bg-blue-600/10 border-l border-blue-500' : ''}`}
                      >
                        <td className="px-4 py-3.5 font-medium text-slate-200">
                          <div className="flex items-center gap-2.5">
                            {getFileIcon(file.name, file.isDirectory)}
                            <span className="truncate max-w-[200px] sm:max-w-xs font-mono text-[11px]">
                              {file.name}
                            </span>
                          </div>
                        </td>
                        {!isEditing && (
                          <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                            {file.isDirectory ? "DIR" : formatSize(file.size)}
                          </td>
                        )}
                        {!isEditing && (
                          <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                            {new Date(file.mtime).toLocaleString()}
                          </td>
                        )}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {!file.isDirectory && (
                              <button
                                onClick={() => handleViewFile(file)}
                                title="Edit File"
                                className="p-1 px-2 hover:bg-[#121933] border border-transparent hover:border-slate-800 rounded text-slate-400 hover:text-blue-400 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteItem(file.path, e)}
                              title="Delete Item"
                              className="p-1 px-2 hover:bg-[#1e1322] border border-transparent hover:border-red-950 rounded text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* LOCAL STATISTICS */}
            <div className="px-4 py-3 bg-[#0a0f1f] border-t border-slate-900 border-dashed text-slate-500 text-[10px] font-mono flex flex-col sm:flex-row justify-between gap-1.5">
              <span>PATH: ./{currentDir}</span>
              <span>ITEMS: {files.length} • PERSISTENCE: LOCAL COLD DISK</span>
            </div>

          </div>
        </div>

        {/* EDITOR SPLIT PANEL */}
        {isEditing && selectedFile && (
          <div className="col-span-1 lg:col-span-7">
            <div className="bg-[#090d1a] border border-blue-900/30 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
              
              {/* FILE EDITOR TITLE BAR */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0d1225] border-b border-slate-900">
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedFile.name, false)}
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block font-mono">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {selectedFile.path}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setSelectedFile(null); setIsEditing(false); }}
                    className="p-1 text-slate-400 hover:text-slate-200 bg-[#121831] border border-slate-800 rounded transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* EDITOR SUB-NOTIFICATIONS */}
              {feedback && (
                <div className={`px-4 py-2 border-b text-[11px] font-medium ${
                  feedback.type === "success" 
                    ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400" 
                    : "bg-red-950/20 border-red-900/30 text-red-400"
                }`}>
                  {feedback.message}
                </div>
              )}

              {/* TEXT AREA EDITOR */}
              <div className="flex-1 min-h-0">
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  spellCheck="false"
                  className="w-full h-full bg-[#04060c] border-0 text-slate-300 font-mono text-[11px] leading-relaxed p-4 outline-none resize-none focus:ring-0 custom-scrollbar"
                  placeholder="// Paste files or start typing..."
                />
              </div>

              {/* SAVE / FOOTER COMMAND PANEL */}
              <div className="px-4 py-3 bg-[#0d1225] border-t border-slate-900/80 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  CHAR CHARACTERS: {fileContent.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedFile(null); setIsEditing(false); }}
                    className="px-3 py-1.5 hover:bg-[#121933] border border-slate-800 rounded-lg text-slate-300 text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFile}
                    disabled={saveLoading}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saveLoading ? "Saving File..." : "Save Changes"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#070b16] border border-slate-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-5 py-4 bg-[#0d1225] border-b border-slate-900/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">Create Directory or File</span>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-widest font-mono mb-2">Item Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewItemType("file")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                      newItemType === "file" 
                        ? 'bg-blue-600/10 text-blue-400 border-blue-500/40' 
                        : 'bg-[#0b1021] text-slate-400 border-slate-900/80 hover:border-slate-800'
                    }`}
                  >
                    Blank File
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemType("dir")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                      newItemType === "dir" 
                        ? 'bg-blue-600/10 text-blue-400 border-blue-500/40' 
                        : 'bg-[#0b1021] text-slate-400 border-slate-900/80 hover:border-slate-800'
                    }`}
                  >
                    Directory/Folder
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-widest font-mono mb-2">
                  Name / Identifier
                </label>
                <input
                  type="text"
                  placeholder={newItemType === "file" ? "config.json" : "images"}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-[#050812] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 hover:bg-[#121831] border border-slate-900 rounded-lg text-slate-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  Create Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
