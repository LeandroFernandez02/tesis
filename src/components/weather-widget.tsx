import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Cloudy } from 'lucide-react';

interface WeatherWidgetProps {
  className?: string;
}

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'windy' | 'partly-cloudy';
  description: string;
}

export function WeatherWidget({ className }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22,
    condition: 'sunny',
    description: 'Despejado'
  });

  useEffect(() => {
    // Simular datos de clima cambiantes para demostración
    const weatherConditions: WeatherData[] = [
      { temperature: 22, condition: 'sunny', description: 'Despejado' },
      { temperature: 18, condition: 'cloudy', description: 'Nublado' },
      { temperature: 15, condition: 'rainy', description: 'Lluvia' },
      { temperature: 25, condition: 'partly-cloudy', description: 'Parcialmente nublado' },
      { temperature: 12, condition: 'windy', description: 'Ventoso' }
    ];

    // Actualizar cada 30 segundos para simular cambios
    const interval = setInterval(() => {
      const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      setWeather(randomWeather);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (condition) {
      case 'sunny':
        return <Sun {...iconProps} className="h-4 w-4 text-yellow-500" />;
      case 'cloudy':
        return <Cloud {...iconProps} className="h-4 w-4 text-gray-500" />;
      case 'rainy':
        return <CloudRain {...iconProps} className="h-4 w-4 text-blue-500" />;
      case 'snowy':
        return <CloudSnow {...iconProps} className="h-4 w-4 text-blue-300" />;
      case 'stormy':
        return <CloudLightning {...iconProps} className="h-4 w-4 text-purple-500" />;
      case 'windy':
        return <Wind {...iconProps} className="h-4 w-4 text-gray-600" />;
      case 'partly-cloudy':
        return <Cloudy {...iconProps} className="h-4 w-4 text-gray-400" />;
      default:
        return <Sun {...iconProps} className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 25) return 'text-red-600';
    if (temp >= 20) return 'text-orange-500';
    if (temp >= 15) return 'text-green-600';
    if (temp >= 10) return 'text-blue-500';
    return 'text-blue-700';
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        {getWeatherIcon(weather.condition)}
        <span className={`text-sm font-medium ${getTemperatureColor(weather.temperature)}`}>
          {weather.temperature}°C
        </span>
      </div>
    </div>
  );
}