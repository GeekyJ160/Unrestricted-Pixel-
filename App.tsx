import React, { useState, useEffect } from 'react';
import { Screen, Project, ToolType } from './types';
import LoadingScreen from './screens/LoadingScreen';
import HomeScreen from './screens/HomeScreen';
import EditorScreen from './screens/EditorScreen';
import ExportScreen from './screens/ExportScreen';
import { checkApiKey, promptForApiKey } from './services/geminiService';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOADING);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [initialTool, setInitialTool] = useState<ToolType>(ToolType.MAGIC);

  // Initial load simulation
  useEffect(() => {
    const init = async () => {
        // Simulate loading assets
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Check API key availability
        const hasKey = await checkApiKey();
        setIsKeyValid(hasKey);
        
        setCurrentScreen(Screen.HOME);
    };
    init();
  }, []);

  const handleCreateProject = async (tool: ToolType = ToolType.MAGIC) => {
    if (!isKeyValid) {
        await promptForApiKey();
        const hasKey = await checkApiKey();
        setIsKeyValid(hasKey);
        if(!hasKey) return; // User cancelled or failed
    }
    
    // Create a new blank project
    const newProject: Project = {
        id: Date.now().toString(),
        title: 'New Project',
        date: new Date().toLocaleString(),
        // Use a reliable high-quality image from Unsplash
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', 
        thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        type: 'New'
    };
    setActiveProject(newProject);
    setInitialTool(tool);
    setCurrentScreen(Screen.EDITOR);
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setInitialTool(ToolType.MAGIC); // Default tool when opening existing
    setCurrentScreen(Screen.EDITOR);
  };

  const handleExport = (project: Project) => {
     // Usually you'd update the project image with the edited version here
     setActiveProject(project);
     setCurrentScreen(Screen.EXPORT);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.LOADING:
        return <LoadingScreen />;
      case Screen.HOME:
        return (
          <HomeScreen 
            onCreateProject={handleCreateProject} 
            onOpenProject={handleOpenProject}
            apiKeyValid={isKeyValid}
            onRequestKey={promptForApiKey}
          />
        );
      case Screen.EDITOR:
        return activeProject ? (
          <EditorScreen 
            project={activeProject} 
            initialTool={initialTool}
            onBack={() => setCurrentScreen(Screen.HOME)}
            onExport={handleExport}
            apiKeyValid={isKeyValid}
          />
        ) : null;
      case Screen.EXPORT:
        return activeProject ? (
          <ExportScreen 
            project={activeProject} 
            onBack={() => setCurrentScreen(Screen.EDITOR)}
            onHome={() => setCurrentScreen(Screen.HOME)}
          />
        ) : null;
      default:
        return <LoadingScreen />;
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-ups-bg text-white font-sans antialiased overflow-hidden">
      {renderScreen()}
    </div>
  );
};

export default App;