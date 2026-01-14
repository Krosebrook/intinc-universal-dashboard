/**
 * Widget Code Splitting Utilities
 * Phase 6.3: Performance & Security Isolation
 * 
 * Provides utilities for lazy loading and code splitting custom widget bundles
 */

import { lazy, ComponentType, LazyExoticComponent, Suspense, useState, useEffect } from 'react';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface WidgetManifest {
  id: string;
  name: string;
  version: string;
  componentPath: string;
  dependencies?: string[];
  size?: number;
}

/**
 * Widget Loader - Manages dynamic imports and code splitting
 */
export class WidgetLoader {
  private static instance: WidgetLoader;
  private loadedWidgets: Map<string, ComponentType<any>> = new Map();
  private loadingPromises: Map<string, Promise<ComponentType<any>>> = new Map();
  private manifests: Map<string, WidgetManifest> = new Map();

  private constructor() {}

  static getInstance(): WidgetLoader {
    if (!WidgetLoader.instance) {
      WidgetLoader.instance = new WidgetLoader();
    }
    return WidgetLoader.instance;
  }

  /**
   * Register a widget manifest
   */
  registerWidget(manifest: WidgetManifest) {
    this.manifests.set(manifest.id, manifest);
  }

  /**
   * Dynamically import a widget component
   */
  async loadWidget(widgetId: string): Promise<ComponentType<any>> {
    // Return cached widget if already loaded
    if (this.loadedWidgets.has(widgetId)) {
      return this.loadedWidgets.get(widgetId)!;
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(widgetId)) {
      return this.loadingPromises.get(widgetId)!;
    }

    const manifest = this.manifests.get(widgetId);
    if (!manifest) {
      throw new Error(`Widget manifest not found: ${widgetId}`);
    }

    // Create loading promise
    const loadingPromise = this.importWidget(manifest)
      .then(component => {
        this.loadedWidgets.set(widgetId, component);
        this.loadingPromises.delete(widgetId);
        return component;
      })
      .catch(error => {
        this.loadingPromises.delete(widgetId);
        throw new Error(`Failed to load widget ${widgetId}: ${error.message}`);
      });

    this.loadingPromises.set(widgetId, loadingPromise);
    return loadingPromise;
  }

  /**
   * Import widget from module path
   */
  private async importWidget(manifest: WidgetManifest): Promise<ComponentType<any>> {
    try {
      // Dynamic import with code splitting
      const module = await import(/* @vite-ignore */ manifest.componentPath);
      
      // Support both default and named exports
      const Component = module.default || module[manifest.name];
      
      if (!Component) {
        throw new Error(`Widget component not found in module: ${manifest.name}`);
      }

      return Component;
    } catch (error) {
      console.error('Widget import error:', error);
      throw error;
    }
  }

  /**
   * Create a lazy-loaded widget component
   */
  createLazyWidget(widgetId: string): LazyExoticComponent<ComponentType<any>> {
    return lazy(() => 
      this.loadWidget(widgetId).then(component => ({ default: component }))
    );
  }

  /**
   * Preload a widget to improve performance
   */
  preloadWidget(widgetId: string): Promise<void> {
    return this.loadWidget(widgetId).then(() => undefined);
  }

  /**
   * Unload a widget to free memory
   */
  unloadWidget(widgetId: string) {
    this.loadedWidgets.delete(widgetId);
  }

  /**
   * Get loading status
   */
  isLoaded(widgetId: string): boolean {
    return this.loadedWidgets.has(widgetId);
  }

  isLoading(widgetId: string): boolean {
    return this.loadingPromises.has(widgetId);
  }

  /**
   * Get all registered widgets
   */
  getRegisteredWidgets(): WidgetManifest[] {
    return Array.from(this.manifests.values());
  }
}

export const widgetLoader = WidgetLoader.getInstance();

/**
 * Widget Loader Component with Suspense boundary
 */
interface LazyWidgetProps {
  widgetId: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  props?: any;
}

export function LazyWidget({ 
  widgetId, 
  fallback, 
  errorFallback,
  props = {} 
}: LazyWidgetProps) {
  const Component = widgetLoader.createLazyWidget(widgetId);
  
  const defaultFallback = (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );

  const defaultErrorFallback = (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <p className="text-red-800 text-sm">Failed to load widget</p>
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback || defaultErrorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Error Boundary for widget loading failures
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Widget loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Bundle size analyzer for widgets
 */
export async function analyzeWidgetBundle(widgetId: string): Promise<{
  widgetId: string;
  estimatedSize: number;
  dependencies: string[];
  loadTime: number;
}> {
  const startTime = performance.now();
  
  try {
    await widgetLoader.loadWidget(widgetId);
    const loadTime = performance.now() - startTime;
    
    const manifest = widgetLoader.getRegisteredWidgets()
      .find(m => m.id === widgetId);

    return {
      widgetId,
      estimatedSize: manifest?.size || 0,
      dependencies: manifest?.dependencies || [],
      loadTime
    };
  } catch (error) {
    throw new Error(`Failed to analyze widget bundle: ${error}`);
  }
}

/**
 * Preload multiple widgets in parallel
 */
export async function preloadWidgets(widgetIds: string[]): Promise<void> {
  await Promise.all(widgetIds.map(id => widgetLoader.preloadWidget(id)));
}

/**
 * Progressive loading strategy for widgets
 */
export class ProgressiveWidgetLoader {
  private priorityQueue: string[] = [];
  private lowPriorityQueue: string[] = [];
  private isLoading = false;

  /**
   * Add widget to high priority queue
   */
  addHighPriority(widgetId: string) {
    if (!this.priorityQueue.includes(widgetId)) {
      this.priorityQueue.push(widgetId);
      this.processQueue();
    }
  }

  /**
   * Add widget to low priority queue
   */
  addLowPriority(widgetId: string) {
    if (!this.lowPriorityQueue.includes(widgetId)) {
      this.lowPriorityQueue.push(widgetId);
      this.processQueue();
    }
  }

  /**
   * Process the loading queue
   */
  private async processQueue() {
    if (this.isLoading) return;
    
    this.isLoading = true;

    try {
      // Load high priority widgets first
      while (this.priorityQueue.length > 0) {
        const widgetId = this.priorityQueue.shift()!;
        await widgetLoader.preloadWidget(widgetId);
      }

      // Then load low priority widgets
      while (this.lowPriorityQueue.length > 0) {
        const widgetId = this.lowPriorityQueue.shift()!;
        await widgetLoader.preloadWidget(widgetId);
      }
    } finally {
      this.isLoading = false;
    }
  }
}

export const progressiveLoader = new ProgressiveWidgetLoader();

/**
 * Hook for using lazy-loaded widgets
 */
export function useLazyWidget(widgetId: string, preload = false) {
  const [isLoaded, setIsLoaded] = useState(widgetLoader.isLoaded(widgetId));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (preload && !isLoaded) {
      setIsLoading(true);
      widgetLoader.preloadWidget(widgetId)
        .then(() => {
          setIsLoaded(true);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, [widgetId, preload, isLoaded]);

  return {
    isLoaded,
    isLoading,
    error,
    Component: isLoaded ? widgetLoader.createLazyWidget(widgetId) : null
  };
}
