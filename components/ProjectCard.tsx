import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <div 
      onClick={() => onClick(project)}
      className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer border border-white/5 hover:border-cyan-500/50 transition-all"
    >
      <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
        <div className="bg-black/40 backdrop-blur-sm self-start px-2 py-0.5 rounded text-[10px] text-gray-300 mb-1 border border-white/10">
            {project.date}
        </div>
        <h3 className="text-sm font-semibold text-white leading-tight">{project.title}</h3>
      </div>
    </div>
  );
};

export default ProjectCard;
