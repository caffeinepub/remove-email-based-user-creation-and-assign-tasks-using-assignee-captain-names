import { useState } from 'react';
import type { Task } from '../backend';

interface OpenTab {
  id: string;
  task: Task;
}

export function useTaskDetailTabs() {
  const [activeTab, setActiveTab] = useState('list');
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);

  const openTaskTab = (task: Task) => {
    const tabId = `task-${task.id}`;
    const existingTab = openTabs.find(tab => tab.id === task.id);
    
    if (!existingTab) {
      setOpenTabs(prev => [...prev, { id: task.id, task }]);
    }
    setActiveTab(tabId);
  };

  const closeTab = (taskId: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.id !== taskId));
    if (activeTab === `task-${taskId}`) {
      setActiveTab('list');
    }
  };

  const updateTabTask = (updatedTask: Task) => {
    setOpenTabs(prev => prev.map(tab => 
      tab.id === updatedTask.id ? { ...tab, task: updatedTask } : tab
    ));
  };

  const closeAllTabs = () => {
    setOpenTabs([]);
    setActiveTab('list');
  };

  return {
    activeTab,
    setActiveTab,
    openTabs,
    openTaskTab,
    closeTab,
    updateTabTask,
    closeAllTabs,
  };
}
