import React from 'react';
import { SoftwareType } from '../types';
import { SOFTWARE_TOOLS } from '../constants';

type Props = { type: SoftwareType; className?: string };

const palette: Record<string, string> = {
  ARDUINO: 'bg-teal-600 text-white',
  AUTOCAD: 'bg-red-700 text-white',
  SOLIDWORKS: 'bg-red-600 text-white',
  MATLAB: 'bg-orange-600 text-white',
  VSCODE: 'bg-blue-500 text-white',
  PROTEUS: 'bg-blue-600 text-white',
  GITHUB: 'bg-slate-800 text-white'
};

export const ToolIcon: React.FC<Props> = ({ type, className = 'w-8 h-8' }) => {
  const tool = SOFTWARE_TOOLS.find(t => t.id === type);
  const [broken, setBroken] = React.useState(false);

  if (!tool) {
    return <div className={`${className} rounded bg-slate-300`} />;
  }

  if (tool.logoUrl && !broken) {
    return (
      <div className={`${className} bg-white dark:bg-slate-800 rounded p-1 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700`}>
        <img
          src={tool.logoUrl}
          alt={tool.name}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  const initials = (tool.name || '').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  const tint = palette[type] || 'bg-slate-600 text-white';

  return (
    <div className={`${className} ${tint} rounded flex items-center justify-center font-bold text-xs border border-slate-200/30 dark:border-slate-700/30`}>{initials}</div>
  );
};

export default ToolIcon;