import { useMemo } from 'react';
import * as ss from 'simple-statistics';
import regression from 'regression';

/**
 * useStatistics hook
 * Provides statistical analysis utilities for dashboard data
 */
export function useStatistics(data: any[]) {
  const extractSeries = (key: string) => {
    return data
      .map(item => {
        const val = typeof key === 'string' ? item[key] : null;
        return Number(val);
      })
      .filter(val => !isNaN(val));
  };

  const getBasicStats = (key: string) => {
    const series = extractSeries(key);
    if (series.length === 0) return null;

    return {
      mean: ss.mean(series),
      median: ss.median(series),
      mode: ss.mode(series),
      variance: ss.variance(series),
      standardDeviation: ss.standardDeviation(series),
      min: ss.min(series),
      max: ss.max(series),
      sum: ss.sum(series),
    };
  };

  const getCorrelation = (keyA: string, keyB: string) => {
    const seriesA = extractSeries(keyA);
    const seriesB = extractSeries(keyB);
    
    const minLength = Math.min(seriesA.length, seriesB.length);
    if (minLength < 2) return 0;

    try {
      return ss.sampleCorrelation(seriesA.slice(0, minLength), seriesB.slice(0, minLength));
    } catch (e) {
      return 0;
    }
  };

  const getLinearRegression = (yKey: string) => {
    // Uses index as x-axis for time-series trend
    const points: [number, number][] = data
      .map((item, index) => [index, Number(item[yKey])] as [number, number])
      .filter(([x, y]) => !isNaN(x) && !isNaN(y));

    if (points.length < 2) return null;

    return regression.linear(points);
  };

  return {
    getBasicStats,
    getCorrelation,
    getLinearRegression,
    extractSeries,
  };
}
