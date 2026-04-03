import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Users, MapPin, Zap, CheckCircle2,
    AlertCircle, Loader2, BarChart3, MoveRight,
    X, ChevronRight, UserPlus
} from 'lucide-react';
import useToastStore from '../../store/useToastStore';
import DemandForecast from './DemandForecast';
import { CalendarClock, Activity } from 'lucide-react';

const TrafficRecommendations = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [activeTab, setActiveTab] = useState('realtime'); // 'realtime' or 'forecast'
    const { addToast } = useToastStore();

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/ai/recommendations');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
            addToast('Failed to load traffic analytics', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMoveDriver = async (driverId, targetFermataId, targetName) => {
        try {
            setExecuting(true);
            const response = await api.post('/ai/execute-assignment', {
                driverId,
                fermataId: targetFermataId
            });

            if (response.data.success) {
                addToast(`Driver reassigned to ${targetName} successfully`, 'success');
                fetchRecommendations(); // Refresh data
                setSelectedStation(null); // Close panel
            }
        } catch (error) {
            console.error('Reassignment failed:', error);
            addToast('Failed to reassign driver', 'error');
        } finally {
            setExecuting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium italic">Analyzing real-time traffic data with AI...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative min-h-[600px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" />
                        AI Traffic Logistics
                    </h2>
                    <p className="text-gray-500 text-sm">Actionable redistribution and predictive demand analysis</p>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                    <button
                        onClick={() => setActiveTab('realtime')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'realtime' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Activity size={14} /> Real-time
                    </button>
                    <button
                        onClick={() => setActiveTab('forecast')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'forecast' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <CalendarClock size={14} /> Forecast (AI)
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <button
                        onClick={fetchRecommendations}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Refresh Data"
                    >
                        <Zap size={16} />
                    </button>
                </div>
            </div>

            {activeTab === 'forecast' ? (
                <DemandForecast />
            ) : (
                <>
                    {/* AI Insights Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-2 border-blue-50 rounded-2xl p-6 shadow-sm overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Zap size={120} className="text-blue-600" />
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative">
                            <div className="bg-blue-600 p-2 rounded-lg text-white">
                                <Zap size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-gray-800">AI Logistics Dispatcher</h3>
                        </div>
                        <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 whitespace-pre-wrap leading-relaxed relative text-gray-700 font-medium">
                            {data?.recommendations?.replace(/\*\*/g, '')}
                        </div>
                    </motion.div>

                    {/* Traffic Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.trafficData?.map((stat) => (
                            <motion.div
                                key={stat.id}
                                whileHover={{ y: -4 }}
                                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${stat.transactionCount > 10 && stat.driverCount < 2
                                        ? 'border-red-200 ring-4 ring-red-500/5'
                                        : 'border-gray-100'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-gray-50 p-3 rounded-xl text-gray-600">
                                        <MapPin size={24} />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${stat.transactionCount > 20 ? 'bg-red-100 text-red-600' :
                                            stat.transactionCount > 5 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                        {stat.transactionCount > 20 ? 'Congested' : stat.transactionCount > 5 ? 'Active' : 'Quiet'}
                                    </div>
                                </div>

                                <h4 className="text-xl font-bold text-gray-800 mb-1">{stat.name}</h4>
                                <p className="text-gray-500 text-sm mb-4">Current Fare: {stat.fare} ETB</p>

                                <div className="grid grid-cols-2 gap-4 border-y border-gray-50 py-4 mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Drivers</span>
                                        <div className="flex items-center gap-1.5 text-gray-800 font-bold text-lg">
                                            <Users size={16} className="text-blue-500" />
                                            {stat.driverCount}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Boardings</span>
                                        <div className="flex items-center gap-1.5 text-gray-800 font-bold text-lg">
                                            <BarChart3 size={16} className="text-blue-500" />
                                            {stat.transactionCount}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedStation(stat)}
                                    className="w-full py-2.5 rounded-xl border border-blue-100 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    Manage Drivers <ChevronRight size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            {/* Reassignment Slide-over */}
            <AnimatePresence>
                {selectedStation && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedStation(null)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 p-6 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="text-blue-600" />
                                    Drivers at {selectedStation.name}
                                </h3>
                                <button onClick={() => setSelectedStation(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {selectedStation.drivers.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <Users className="mx-auto text-gray-300 mb-2" size={40} />
                                        <p className="text-gray-500">No drivers currently assigned</p>
                                    </div>
                                ) : (
                                    selectedStation.drivers.map(driver => (
                                        <div key={driver.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:border-blue-200 transition-colors">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="font-bold text-gray-800">{driver.name}</p>
                                                    <p className="text-xs text-gray-400">{driver.userId}</p>
                                                </div>
                                                <div className="bg-green-100 text-green-600 p-1.5 rounded-full">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-50">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Redistribute to Hot Stations:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {data.trafficData.filter(f => f.id !== selectedStation.id).map(target => (
                                                        <button
                                                            key={target.id}
                                                            disabled={executing}
                                                            onClick={() => handleMoveDriver(driver.id, target.id, target.name)}
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${target.transactionCount > 10
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            {target.transactionCount > 10 && <Zap size={10} />}
                                                            Move to {target.name}
                                                            <MoveRight size={12} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrafficRecommendations;
