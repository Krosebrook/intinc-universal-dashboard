import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { SavedDashboard } from '../../../types/dashboard';

interface DashboardSavedViewsProps {
  savedDashboards: SavedDashboard[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DashboardSavedViews({
  savedDashboards,
  onLoad,
  onDelete,
}: DashboardSavedViewsProps) {
  if (savedDashboards.length === 0) return null;

  return (
    <div className="glass-card border-white/10 p-6 rounded-2xl">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Saved Views</h3>
      <div className="space-y-2">
        {savedDashboards.map(dash => (
          <div key={dash.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
            <button 
              className="flex-1 text-left text-sm font-medium hover:text-primary transition-colors"
              onClick={() => onLoad(dash.id)}
            >
              {dash.name}
            </button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              onClick={() => onDelete(dash.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
