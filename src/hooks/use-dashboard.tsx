import { useState, createContext, useContext } from 'react';

export type Department = 'Sales' | 'HR' | 'IT' | 'Marketing';

interface DashboardContextType {
  department: Department;
  setDepartment: (dept: Department) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [department, setDepartment] = useState<Department>('Sales');

  return (
    <DashboardContext.Provider value={{ department, setDepartment }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
