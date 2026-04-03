import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { 
    TrendingUp, Clock, AlertTriangle, 
    Thermometer, Info, Loader2, Sparkles,
    ChevronRight, MapPin
} from 'lucide-react';
import useToastStore from '../../store/useToastStore';

const DemandForecast = () => {
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToastStore();

    useEffect(() => {
        fetchForecast();
    }, []);

    const fetchForecast = async () => {
        try {
            setLoading(true);
            const response = await api.get('/ai/forecast');
            if (response.data.success) {
                setForecastData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch forecast:', error);
            addToast('AI Predictor is still warming up with data...', 'info');
        } finally {
            setLoading(false);
        }
    };

    const getHeatColor = (level) => {
        if (level >= 8) return 'bg-red-500 shadow-red-200';
        if (level >= 6) return 'bg-orange-500 shadow-orange-200';
        if (level >= 4) return 'bg-yellow-500 shadow-yellow-200';
        return 'bg-green-500 shadow-green-200';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-5 h-5 animate-pulse" />
                </div>
                <p className="text-gray-500 font-medium italic text-center">
                    AI is analyzing 7 days of historical patterns...<br/>
                    <span className="text-xs text-gray-400">Predicting "The Predictor" results</span>
                </p>
            </div>
        );
    }

    if (!forecastData || forecastData.error) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <AlertTriangle className="mx-auto text-orange-400 mb-3" size={40} />
                <h3 className="font-bold text-gray-800">Limited Historical Data</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">
                    Predictive analysis requires more transaction history. 
                    Continue using real-time analytics in the meantime.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Insight */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">4-Hour Demand Forecast</h2>
                        <p className="text-gray-500 text-sm">AI-driven predictive logistics for active stations</p>
                    </div>
                </div>
                {forecastData.hottestStation && (
                    <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
                        <Thermometer size={16} className="text-red-500" />
                        <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                            Peak Predicted: {forecastData.hottestStation}
                        </span>
                    </div>
                )}
            </div>

            {/* Prediction Summary */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start shadow-sm"
            >
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <Sparkles size={20} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed italic">
                        {forecastData.summary?.replace(/\*\*/g, '')}
                    </p>
                </div>
            </motion.div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-1 gap-4">
                {forecastData.forecast.map((station, idx) => (
                    <motion.div
                        key={station.stationId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-3 min-w-[200px]">
                                <MapPin size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                <h4 className="font-bold text-gray-800">{station.stationName}</h4>
                            </div>

                            <div className="flex-1 flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                {station.hourlyPredictions.map((pred, pIdx) => (
                                    <div key={pIdx} className="flex-1 min-w-[70px] space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 px-1">
                                            <span>{pred.hour}</span>
                                            <span className={pred.heatLevel > 7 ? 'text-red-400' : ''}>{pred.heatLevel}/10</span>
                                        </div>
                                        <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pred.heatLevel * 10}%` }}
                                                className={`absolute inset-y-0 left-0 rounded-full shadow-lg ${getHeatColor(pred.heatLevel)}`}
                                            />
                                        </div>
                                        <p className={`text-[10px] text-center font-bold ${
                                            pred.heatLevel >= 8 ? 'text-red-600' :
                                            pred.heatLevel >= 5 ? 'text-orange-600' : 'text-gray-500'
                                        }`}>
                                            {pred.label?.replace(/\*\*/g, '')}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="md:border-l border-gray-100 md:pl-6">
                                <button className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 group/btn">
                                    Pre-assign Drivers <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DemandForecast;
