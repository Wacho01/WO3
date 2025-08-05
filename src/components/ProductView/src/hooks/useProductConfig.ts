import { useState, useEffect } from 'react';
import { ProductConfig, waterOdysseyConfig } from '../config/productConfig';

export const useProductConfig = (configName?: string) => {
  const [config, setConfig] = useState<ProductConfig>(waterOdysseyConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async (configPath: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would load from an API or file
      // For now, we'll use the default configurations
      if (configPath === 'water-odyssey' || !configPath) {
        setConfig(waterOdysseyConfig);
      } else {
        // Load other configurations dynamically
        const response = await fetch(`/configs/${configPath}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load configuration: ${configPath}`);
        }
        const loadedConfig = await response.json();
        setConfig(loadedConfig);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      console.error('Configuration loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (newConfig: Partial<ProductConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig
    }));
  };

  const resetConfig = () => {
    setConfig(waterOdysseyConfig);
  };

  useEffect(() => {
    if (configName && configName !== 'water-odyssey') {
      loadConfig(configName);
    }
  }, [configName]);

  return {
    config,
    loading,
    error,
    loadConfig,
    updateConfig,
    resetConfig
  };
};